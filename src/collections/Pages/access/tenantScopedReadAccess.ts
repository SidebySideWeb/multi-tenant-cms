import type { Access, Where } from 'payload'

import { getUserTenantIDs } from '@/utilities/getUserTenantIDs'
import { isSuperAdmin } from '@/access/isSuperAdmin'

export const tenantScopedReadAccess: Access = async ({ req }) => {
  // For public reads (frontend queries), check X-Tenant-Slug header
  if (!req.user) {
    const tenantSlug = req.headers.get('x-tenant-slug')
    
    if (tenantSlug) {
      try {
        // Look up tenant by slug
        const tenants = await req.payload.find({
          collection: 'tenants',
          where: {
            slug: {
              equals: tenantSlug,
            },
          },
          limit: 1,
          depth: 0,
        })

        if (tenants.docs.length > 0) {
          const tenantId = tenants.docs[0].id
          return {
            tenant: {
              equals: tenantId,
            },
          } as Where
        }
      } catch (error) {
        // If lookup fails, fall through to allow access (will be filtered by where clause)
        console.error('[tenantScopedReadAccess] Error looking up tenant:', error)
      }
    }

    // If no tenant slug header, allow access (frontend should send it)
    // The where clause in the query will still be respected
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
