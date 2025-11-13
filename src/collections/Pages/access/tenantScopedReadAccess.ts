import type { Access, Where } from 'payload'

import { getUserTenantIDs } from '@/utilities/getUserTenantIDs'
import { isSuperAdmin } from '@/access/isSuperAdmin'
import { getTenantFromHeader } from '@/utilities/getTenantFromHeader'

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
    const tenantInfo = await getTenantFromHeader(req)
    
    console.error('[tenantScopedReadAccess] Public request', {
      tenantInfo,
      headerKeys: Object.keys(allHeaders),
      headersType: typeof allHeaders,
    })
    
    if (!tenantInfo) {
      // NO tenant header = deny access (frontend must send it)
      console.error('[tenantScopedReadAccess] No X-Tenant-Slug header provided or tenant not found. Available headers:', headerKeys)
      return false
    }

    const whereClause = {
      tenant: {
        equals: tenantInfo.id,
      },
    } as Where
    
    console.error('[tenantScopedReadAccess] Returning where clause:', whereClause)
    
    // ALWAYS return a tenant filter - NEVER return true
    return whereClause
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
