/**
 * Gets tenant ID from X-Tenant-Slug header
 * This works with Payload's multi-tenant plugin for public API requests
 */
export async function getTenantFromHeader(
  req: any,
): Promise<{ id: number | string; slug: string } | null> {
  if (!req || !req.payload) {
    return null
  }

  // Try to get tenant slug from header
  const allHeaders = req.headers as any
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

  if (!tenantSlug) {
    return null
  }

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

    if (tenants.docs.length === 0) {
      return null
    }

    return {
      id: tenants.docs[0].id,
      slug: tenants.docs[0].slug,
    }
  } catch (error) {
    console.error('[getTenantFromHeader] Error looking up tenant:', error)
    return null
  }
}

