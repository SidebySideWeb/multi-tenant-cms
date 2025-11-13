import type { Access, Where } from 'payload'

import { getUserTenantIDs } from '@/utilities/getUserTenantIDs'
import { isSuperAdmin } from '@/access/isSuperAdmin'

export const tenantScopedReadAccess: Access = async ({ req }) => {
  // Log all tenant-related headers for debugging
  const allHeaders = req.headers as any
  const headerKeys = Object.keys(allHeaders)
  const tenantHeaders = headerKeys.filter((key) => 
    key.toLowerCase().includes('tenant')
  )
  
  console.error('[tenantScopedReadAccess] Called', {
    hasUser: !!req.user,
    headerKeys,
    tenantHeaders,
    'x-tenant-slug': req.headers.get('x-tenant-slug'),
    'X-Tenant-Slug': req.headers.get('X-Tenant-Slug'),
    'headers-object': typeof allHeaders === 'object' ? Object.keys(allHeaders) : 'not object',
  })
  
  // For public reads (frontend queries), check X-Tenant-Slug header
  if (!req.user) {
    // Try multiple ways to get the header (case sensitivity)
    let tenantSlug = 
      req.headers.get('x-tenant-slug') || 
      req.headers.get('X-Tenant-Slug') ||
      (allHeaders['x-tenant-slug'] as string) ||
      (allHeaders['X-Tenant-Slug'] as string)
    
    // Also check if headers is an object with properties
    if (!tenantSlug && typeof allHeaders === 'object') {
      for (const key of Object.keys(allHeaders)) {
        if (key.toLowerCase() === 'x-tenant-slug') {
          tenantSlug = allHeaders[key] as string
          break
        }
      }
    }
    
    console.error('[tenantScopedReadAccess] Public request', {
      tenantSlug,
      headerKeys: Object.keys(allHeaders),
      headersType: typeof allHeaders,
      headersKeys: typeof allHeaders === 'object' ? Object.keys(allHeaders) : 'not object',
    })
    
    if (!tenantSlug) {
      // NO tenant header = deny access (frontend must send it)
      console.error('[tenantScopedReadAccess] No X-Tenant-Slug header provided. Available headers:', headerKeys)
      return false
    }

    try {
      // Look up tenant by slug - MUST succeed or deny access
      console.error('[tenantScopedReadAccess] Looking up tenant with slug:', tenantSlug)
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

      console.error('[tenantScopedReadAccess] Tenant lookup result:', {
        found: tenants.docs.length > 0,
        tenantId: tenants.docs[0]?.id,
        tenantSlug: tenants.docs[0]?.slug,
      })

      if (tenants.docs.length === 0) {
        // Tenant not found = deny access
        console.error(`[tenantScopedReadAccess] Tenant with slug "${tenantSlug}" not found`)
        return false
      }

      const tenantId = tenants.docs[0].id
      const whereClause = {
        tenant: {
          equals: tenantId,
        },
      } as Where
      
      console.error('[tenantScopedReadAccess] Returning where clause:', whereClause)
      
      // ALWAYS return a tenant filter - NEVER return true
      return whereClause
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
