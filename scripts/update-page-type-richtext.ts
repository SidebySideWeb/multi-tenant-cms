import 'dotenv/config'

const TARGET_PAGE_TYPE_SLUG = 'home-ftiaxesite'
const TARGET_FIELDS = new Set([
  'hero.subheadline',
  'features.subtitle',
  'features.items.description',
  'process.subtitle',
  'process.steps.description',
  'contact.subtitle',
])

const updateField = (field: any, path: string[]): any => {
  if (!field || typeof field !== 'object') return field

  const identifier = field.name ?? field.key
  const nextPath = identifier ? [...path, identifier] : [...path]
  const joined = nextPath.join('.')

  const updated: any = { ...field }

  if (TARGET_FIELDS.has(joined)) {
    updated.type = 'richText'
  }

  if (field.type === 'group') {
    updated.fields = (field.fields ?? []).map((child: any) => updateField(child, nextPath))
  } else if (field.type === 'array') {
    updated.fields = (field.fields ?? []).map((child: any) => updateField(child, nextPath))
  } else if (Array.isArray(field.fields)) {
    updated.fields = field.fields.map((child: any) => updateField(child, nextPath))
  }

  return updated
}

const updateSchema = (schema: any) => {
  if (!schema || typeof schema !== 'object') return schema

  if (Array.isArray(schema.groups)) {
    return {
      ...schema,
      groups: schema.groups.map((group: any) => ({
        ...group,
        fields: (group.fields ?? []).map((field: any) => updateField(field, [group.key ?? group.name ?? ''])),
      })),
    }
  }

  return schema
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

  const pageTypes = await payload.find({
    collection: 'page-types',
    where: {
      slug: {
        equals: TARGET_PAGE_TYPE_SLUG,
      },
    },
    depth: 0,
    limit: 25,
  })

  for (const doc of pageTypes.docs as Array<Record<string, any>>) {
    const updatedFields = updateSchema(doc.fields)

    await payload.update({
      collection: 'page-types',
      id: doc.id,
      data: {
        fields: updatedFields,
      },
    })
  }

  if (typeof payload.close === 'function') {
    await payload.close()
  }

  console.log(`Updated ${pageTypes.docs.length} page-type(s) to use richText fields.`)
}

main().catch((error) => {
  console.error('Failed to update page-type fields:', error)
  process.exit(1)
})
