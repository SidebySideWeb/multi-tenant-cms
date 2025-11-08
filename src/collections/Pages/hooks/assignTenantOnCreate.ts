import type { CollectionBeforeValidateHook } from 'payload'

import { extractID } from '@/utilities/extractID'
import { getUserTenantIDs } from '@/utilities/getUserTenantIDs'

export const assignTenantOnCreate: CollectionBeforeValidateHook = async ({ data, originalDoc, operation, req }) => {
  // Always preserve the existing tenant on update operations
  if (operation === 'update') {
    if (!data.tenant && originalDoc?.tenant) {
      data.tenant = extractID(originalDoc.tenant)
    }
    return
  }

  // If tenant already provided explicitly, nothing to do
  if (data?.tenant) {
    return
  }

  // If the request context already resolved a tenant (e.g. via cookie/domain), re-use it
  const contextTenant = (req as any)?.context?.tenant || (req as any)?.context?.tenantId
  if (contextTenant) {
    data.tenant = contextTenant
    return
  }

  // Attempt to infer tenant from the authenticated user
  if (req.user) {
    const tenantIDs = getUserTenantIDs(req.user, 'tenant-admin')
    if (tenantIDs.length === 1) {
      data.tenant = tenantIDs[0]
      return
    }

    // Fallback: if user has any tenant access, use the first tenant
    if (tenantIDs.length > 1) {
      data.tenant = tenantIDs[0]
    }
  }
}
