import 'dotenv/config'
import payload from 'payload'
import { buildDefaultEditorState } from '@payloadcms/richtext-lexical'

import config from '../src/payload.config'

type AnyRecord = Record<string, any>

const toLexical = (value: unknown) => {
  if (value && typeof value === 'object') {
    return value
  }

  const text = typeof value === 'string' ? value : ''
  return buildDefaultEditorState({ text })
}

const normalizeHero = (sections: AnyRecord | null | undefined) => {
  if (!sections || typeof sections !== 'object') {
    return sections
  }

  const hero = sections.hero
  if (!hero || typeof hero !== 'object') {
    return sections
  }

  return {
    ...sections,
    hero: {
      ...hero,
      subheadline: toLexical(hero.subheadline),
    },
  }
}

const migratePage = async (page: AnyRecord) => {
  const currentSections = page.sections ?? {}
  const normalizedSections = normalizeHero(currentSections)

  const content = page.content ?? {}
  const contentSections = normalizeHero(content.sections ?? {})

  const needsUpdate =
    JSON.stringify(currentSections?.hero?.subheadline) !== JSON.stringify(normalizedSections?.hero?.subheadline) ||
    JSON.stringify(contentSections?.hero?.subheadline) !== JSON.stringify(content.sections?.hero?.subheadline)

  if (!needsUpdate) {
    return
  }

  await payload.update({
    collection: 'pages',
    id: page.id,
    data: {
      sections: normalizedSections,
      content: {
        ...content,
        sections: contentSections,
      },
    },
    overrideAccess: true,
  })

  console.log(`✔ Converted hero subheadline for page ${page.slug || page.id}`)
}

async function migrateAllPages() {
  const limit = 100
  let page = 1
  let done = false

  while (!done) {
    const result = await payload.find({
      collection: 'pages',
      limit,
      page,
      depth: 0,
    })

    if (result.docs.length === 0) {
      done = true
      continue
    }

    for (const doc of result.docs) {
      await migratePage(doc as AnyRecord)
    }

    if (result.page >= result.totalPages) {
      done = true
    } else {
      page += 1
    }
  }

  console.log('✅ Migration complete')
}

async function main() {
  await payload.init({
    config,
    local: true,
    onInit: undefined,
  })

  try {
    await migrateAllPages()
  } finally {
    if (typeof payload.close === 'function') {
      await payload.close()
    }
  }
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})

