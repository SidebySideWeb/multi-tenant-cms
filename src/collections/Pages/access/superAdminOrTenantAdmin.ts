import { Access } from 'payload'

import { getUserTenantIDs } from '@/utilities/getUserTenantIDs'
import { isSuperAdmin } from '@/access/isSuperAdmin'
import { extractID } from '@/utilities/extractID'

/**
 * Tenant admins and super admins can access page mutations.
 * For create operations we ensure the target tenant is one the user manages.
 * For update/delete we allow when the document tenant matches the admin's tenant list.
 */
export const superAdminOrTenantAdminAccess: Access = ({ req, id, data }) => {
  if (!req.user) {
    return false
  }

  if (isSuperAdmin(req.user)) {
    return true
  }

  const adminTenantAccessIDs = getUserTenantIDs(req.user, 'tenant-admin')

  if (adminTenantAccessIDs.length === 0) {
    return false
  }

  const requestedTenant = extractID(data?.tenant)

  if (requestedTenant && adminTenantAccessIDs.map(String).includes(String(requestedTenant))) {
    return true
  }

  if (id) {
    return {
      tenant: {
        in: adminTenantAccessIDs,
      },
    }
  }

  // Allow tenant admins to initiate create operations—hook will assign the tenant if omitted
  return true
}
