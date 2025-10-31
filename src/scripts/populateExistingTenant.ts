/**
 * Script to populate homepage for an existing tenant
 * 
 * Usage:
 * 1. Import this function
 * 2. Call it with the tenant slug or ID
 * 
 * Example:
 * import { populateExistingTenant } from './scripts/populateExistingTenant'
 * await populateExistingTenant(payload, 'ftiaxesite')
 */

import type { Payload } from 'payload'
import { populateTenantHomepage } from '@/utilities/populateTenantHomepage'

/**
 * Populates homepage for an existing tenant by slug or ID
 * @param payload - Payload instance
 * @param tenantIdentifier - Tenant slug or ID
 */
export async function populateExistingTenant(
  payload: Payload,
  tenantIdentifier: string | number,
): Promise<void> {
  try {
    // Try to find tenant by slug first
    let tenantId: string | number

    if (typeof tenantIdentifier === 'string' && isNaN(Number(tenantIdentifier))) {
      // It's a slug, find the tenant
      const tenantResult = await payload.find({
        collection: 'tenants',
        where: {
          slug: {
            equals: tenantIdentifier,
          },
        },
        limit: 1,
      })

      if (tenantResult.docs.length === 0) {
        throw new Error(`Tenant with slug "${tenantIdentifier}" not found`)
      }

      tenantId = tenantResult.docs[0].id
    } else {
      // It's an ID
      tenantId = tenantIdentifier
    }

    // Populate the homepage
    await populateTenantHomepage(payload, tenantId)

    payload.logger.info(
      `✅ Successfully populated homepage for tenant: ${tenantIdentifier}`,
    )
  } catch (error) {
    payload.logger.error(
      `❌ Failed to populate homepage for tenant ${tenantIdentifier}: ${error instanceof Error ? error.message : String(error)}`,
    )
    throw error
  }
}

