import 'dotenv/config'

import payload from 'payload'

import config from '../src/payload.config'

const tenantSlug = process.argv[2] ?? 'kalitechnia'
const pageTypeSlug = process.argv[3] ?? 'kalitechnia-programs'

async function run() {
  await payload.init({
    config,
    onInit: () => {
      payload.logger.info('Payload initialized for inspect-page-type script.')
    },
  })

  const tenant = await payload.find({
    collection: 'tenants',
    where: {
      slug: {
        equals: tenantSlug,
      },
    },
    depth: 0,
    limit: 1,
    overrideAccess: true,
  })

  if (tenant.docs.length === 0) {
    payload.logger.error(`Tenant with slug "${tenantSlug}" not found.`)
    process.exit(1)
  }

  const tenantId = tenant.docs[0].id

  const pageType = await payload.find({
    collection: 'page-types',
    where: {
      and: [
        {
          slug: {
            equals: pageTypeSlug,
          },
        },
        {
          tenant: {
            equals: tenantId,
          },
        },
      ],
    },
    depth: 0,
    limit: 1,
    overrideAccess: true,
  })

  if (pageType.docs.length === 0) {
    payload.logger.error(`Page type with slug "${pageTypeSlug}" not found for tenant "${tenantSlug}".`)
    process.exit(1)
  }

  payload.logger.info(`Page type "${pageTypeSlug}" fields:`)
  console.log(JSON.stringify(pageType.docs[0].fields, null, 2))

  process.exit(0)
}

run().catch((error) => {
  console.error(error)
  process.exit(1)
})

