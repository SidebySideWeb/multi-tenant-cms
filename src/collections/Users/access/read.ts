import type { User } from '@/payload-types'
import type { Access, Where } from 'payload'
import { getTenantFromCookie } from '@payloadcms/plugin-multi-tenant/utilities'

import { isSuperAdmin } from '../../../access/isSuperAdmin'
import { getUserTenantIDs } from '../../../utilities/getUserTenantIDs'
import { isAccessingSelf } from './isAccessingSelf'
import { getCollectionIDType } from '@/utilities/getCollectionIDType'

export const readAccess: Access<User> = ({ req, id }) => {
  if (!req?.user) {
    return false
  }

  // Super admins can always read any user
  if (isSuperAdmin(req.user)) {
    return true
  }

  // Users can always read themselves
  if (isAccessingSelf({ id, user: req.user })) {
    return true
  }

  // For specific user ID lookups (after creation/update)
  if (id) {
    const adminTenantAccessIDs = getUserTenantIDs(req.user, 'tenant-admin')
    
    // Allow if user is in one of their tenants
    return {
      or: [
        {
          id: {
            equals: req.user.id,
          },
        },
        {
          'tenants.tenant': {
            in: adminTenantAccessIDs,
          },
        },
      ],
    } as Where
  }

  // For list queries (no specific ID)
  const selectedTenant = getTenantFromCookie(
    req.headers,
    getCollectionIDType({ payload: req.payload, collectionSlug: 'tenants' }),
  )
  const adminTenantAccessIDs = getUserTenantIDs(req.user, 'tenant-admin')

  if (selectedTenant) {
    // If they have access to the tenant ID set in cookie
    const hasTenantAccess = adminTenantAccessIDs.some((tid) => tid === selectedTenant)
    if (hasTenantAccess) {
      return {
        'tenants.tenant': {
          equals: selectedTenant,
        },
      }
    }
  }

  // Tenant admins can read users from their tenants
  return {
    or: [
      {
        id: {
          equals: req.user.id,
        },
      },
      {
        'tenants.tenant': {
          in: adminTenantAccessIDs,
        },
      },
    ],
  } as Where
}
