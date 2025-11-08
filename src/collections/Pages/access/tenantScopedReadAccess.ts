import type { Access } from 'payload'

import { getUserTenantIDs } from '@/utilities/getUserTenantIDs'
import { isSuperAdmin } from '@/access/isSuperAdmin'

export const tenantScopedReadAccess: Access = ({ req }) => {
  // Allow public reads when no user is present (frontend queries)
  if (!req.user) {
    return true
  }

  if (isSuperAdmin(req.user)) {
    return true
  }

  const tenantIDs = getUserTenantIDs(req.user)

  if (tenantIDs.length === 0) {
    return false
  }

  return {
    tenant: {
      in: tenantIDs,
    },
  }
}
