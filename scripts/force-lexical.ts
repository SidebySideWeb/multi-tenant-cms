import 'dotenv/config'
import { buildDefaultEditorState } from '@payloadcms/richtext-lexical'

const createEmptyParagraph = () => ({
  type: 'paragraph',
  format: '',
  indent: 0,
  version: 1,
  direction: 'ltr',
  children: [],
})

const ensureNonEmptyLexical = (state: any) => {
  if (!state || typeof state !== 'object') {
    return {
      root: {
        type: 'root',
        format: '',
        indent: 0,
        version: 1,
        direction: 'ltr',
        children: [createEmptyParagraph()],
      },
    }
  }

  const root = state.root && typeof state.root === 'object' ? state.root : {}
  const children = Array.isArray((root as any).children) ? (root as any).children : []

  return {
    ...state,
    root: {
      type: 'root',
      format: '',
      indent: 0,
      version: 1,
      direction: 'ltr',
      ...(root as Record<string, unknown>),
      children: children.length > 0 ? children : [createEmptyParagraph()],
    },
  }
}

const ensureLexical = (value: unknown) => {
  if (value && typeof value === 'object' && 'root' in (value as Record<string, unknown>)) {
    return ensureNonEmptyLexical(value)
  }

  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value)
      if (parsed && typeof parsed === 'object' && 'root' in parsed) {
        return ensureNonEmptyLexical(parsed)
      }
    } catch (error) {
      // ignore parse errors
    }
  }

  const text = typeof value === 'string' ? value : ''
  return ensureNonEmptyLexical(buildDefaultEditorState({ text }))
}

const normalizeFeatureItems = (items: unknown) => {
  if (!Array.isArray(items)) return items

  return items.map((item) => {
    if (!item || typeof item !== 'object') return item
    const entry = item as Record<string, unknown>
    return {
      ...entry,
      description: ensureLexical(entry.description),
    }
  })
}

const normalizeProcessSteps = (steps: unknown) => {
  if (!Array.isArray(steps)) return steps

  return steps.map((step) => {
    if (!step || typeof step !== 'object') return step
    const entry = step as Record<string, unknown>
    return {
      ...entry,
      description: ensureLexical(entry.description),
    }
  })
}

const normalizeSections = (sections: unknown) => {
  if (!sections || typeof sections !== 'object') return sections

  const input = sections as Record<string, any>
  const result: Record<string, any> = { ...input }

  if (input.hero && typeof input.hero === 'object') {
    result.hero = {
      ...input.hero,
      subheadline: ensureLexical(input.hero.subheadline),
    }
  }

  if (input.features && typeof input.features === 'object') {
    const features = input.features as Record<string, any>
    result.features = {
      ...features,
      subtitle: ensureLexical(features.subtitle),
      items: normalizeFeatureItems(features.items),
    }
  }

  if (input.process && typeof input.process === 'object') {
    const process = input.process as Record<string, any>
    result.process = {
      ...process,
      subtitle: ensureLexical(process.subtitle),
      steps: normalizeProcessSteps(process.steps),
    }
  }

  if (input.contact && typeof input.contact === 'object') {
    const contact = input.contact as Record<string, any>
    result.contact = {
      ...contact,
      subtitle: ensureLexical(contact.subtitle),
    }
  }

  return result
}

async function main() {
  const [{ default: payload }, { default: payloadConfig }] = await Promise.all([
    import('payload'),
    import('../src/payload.config.ts'),
  ])

  await payload.init({
    config: payloadConfig,
    local: true,
    onInit: undefined,
  })

  const pages = await payload.find({
    collection: 'pages',
    depth: 0,
    limit: 100,
  })

  for (const doc of pages.docs as Array<Record<string, any>>) {
    const nextSections = normalizeSections(doc.sections ?? doc.content?.sections ?? {})
    const nextSummary = ensureLexical(doc.summary)
    const nextSeoDescription = ensureLexical(doc.seo?.description)

    const nextContent = {
      ...(doc.content || {}),
      sections: nextSections,
    }

    await payload.update({
      collection: 'pages',
      id: doc.id,
      data: {
        sections: nextSections,
        summary: nextSummary,
        content: nextContent,
        seo: {
          ...doc.seo,
          description: nextSeoDescription,
        },
      },
      overrideAccess: true,
    })

    console.log(`Normalized page ${doc.slug}`)
  }

  if (typeof payload.close === 'function') {
    await payload.close()
  }
}

main().catch((error) => {
  console.error('Failed to normalize rich text content:', error)
  process.exit(1)
})
