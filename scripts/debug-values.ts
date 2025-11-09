import 'dotenv/config'

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
    limit: 5,
    depth: 0,
  })

  for (const page of pages.docs as Array<Record<string, any>>) {
    if (page.slug === 'ftiaxesite-homepage') {
      console.log('--- Ftiaxesite Homepage ---')
      console.log('sections.features.subtitle:', page.sections?.features?.subtitle)
      console.log('content.sections.features.subtitle:', page.content?.sections?.features?.subtitle)
      console.log('sections.features.items:', page.sections?.features?.items)
      console.log('sections.process.subtitle:', page.sections?.process?.subtitle)
      console.log('sections.contact.subtitle:', page.sections?.contact?.subtitle)
    }
  }

  if (typeof payload.close === 'function') {
    await payload.close()
  }
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
