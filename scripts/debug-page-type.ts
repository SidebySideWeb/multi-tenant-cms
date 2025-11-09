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

  const docs = await payload.find({
    collection: 'page-types',
    limit: 10,
  })

  for (const doc of docs.docs as Array<Record<string, any>>) {
    console.log('--- PAGE TYPE ---')
    console.log(doc.slug, doc.name)
    console.dir(doc.fields, { depth: null })
  }

  if (typeof payload.close === 'function') {
    await payload.close()
  }
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
