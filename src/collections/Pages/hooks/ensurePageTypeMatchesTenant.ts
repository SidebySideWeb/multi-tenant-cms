import type { CollectionBeforeValidateHook } from 'payload'

import { extractID } from '@/utilities/extractID'

export const ensurePageTypeMatchesTenant: CollectionBeforeValidateHook = async ({ data = {}, originalDoc, operation, req }) => {
  const pageTypeId = extractID(data?.pageType ?? originalDoc?.pageType)

  if (!pageTypeId) {
    return
  }

  const pageType = await req.payload.findByID({
    collection: 'page-types',
    id: pageTypeId,
    depth: 0,
  })

  if (!pageType) {
    throw new Error('Selected page type could not be found')
  }

  const pageTypeTenantId = extractID(pageType.tenant)
  if (!pageTypeTenantId) {
    throw new Error('Selected page type is missing tenant information')
  }

  const incomingTenantId = extractID(data?.tenant)
  const existingTenantId = extractID(originalDoc?.tenant)
  const tenantId = incomingTenantId ?? existingTenantId

  if (!tenantId) {
    data.tenant = pageTypeTenantId
    return
  }

  if (`${tenantId}` !== `${pageTypeTenantId}`) {
    throw new Error('Selected page type belongs to a different tenant')
  }
}
