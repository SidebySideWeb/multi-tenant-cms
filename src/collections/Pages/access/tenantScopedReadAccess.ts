import type { Access, Where } from 'payload'

import { getUserTenantIDs } from '@/utilities/getUserTenantIDs'
import { isSuperAdmin } from '@/access/isSuperAdmin'

export const tenantScopedReadAccess: Access = async ({ req }) => {
  // For public reads (frontend queries), check X-Tenant-Slug header
  if (!req.user) {
    const tenantSlug = req.headers.get('x-tenant-slug')
    
    if (!tenantSlug) {
      // NO tenant header = deny access (frontend must send it)
      console.error('[tenantScopedReadAccess] No X-Tenant-Slug header provided')
      return false
    }

    try {
      // Look up tenant by slug - MUST succeed or deny access
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

      if (tenants.docs.length === 0) {
        // Tenant not found = deny access
        console.error(`[tenantScopedReadAccess] Tenant with slug "${tenantSlug}" not found`)
        return false
      }

      const tenantId = tenants.docs[0].id
      // ALWAYS return a tenant filter - NEVER return true
      return {
        tenant: {
          equals: tenantId,
        },
      } as Where
    } catch (error) {
      // If lookup fails, deny access
      console.error('[tenantScopedReadAccess] Error looking up tenant:', error)
      return false
    }
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
