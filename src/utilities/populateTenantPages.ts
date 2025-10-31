import type { Payload } from 'payload'
import type { RemotePayloadClient } from './remotePayloadClient'
import { getTemplate } from '@/templates'

/**
 * Replace template variables in strings
 * Example: "{{tenant-name}}" → "mitsos"
 */
function replaceTemplateVars(
  data: any,
  tenantName: string,
  tenantSlug: string,
): any {
  if (typeof data === 'string') {
    return data
      .replace(/\{\{tenant-name\}\}/g, tenantName)
      .replace(/\{\{tenant-slug\}\}/g, tenantSlug)
  }

  if (Array.isArray(data)) {
    return data.map((item) => replaceTemplateVars(item, tenantName, tenantSlug))
  }

  if (data && typeof data === 'object') {
    const result: any = {}
    for (const [key, value] of Object.entries(data)) {
      result[key] = replaceTemplateVars(value, tenantName, tenantSlug)
    }
    return result
  }

  return data
}

/**
 * Populates all pages for a tenant based on their template
 * @param payload - Payload instance (local or remote)
 * @param tenantId - The tenant ID
 * @param templateName - Template name (e.g., 'ftiaxesite')
 * @param tenantName - Tenant name for variable replacement
 * @param tenantSlug - Tenant slug for variable replacement
 */
export async function populateTenantPages(
  payload: Payload | RemotePayloadClient,
  tenantId: string | number,
  templateName: string,
  tenantName: string,
  tenantSlug: string,
): Promise<void> {
  const template = getTemplate(templateName)

  if (!template) {
    throw new Error(`Template "${templateName}" not found`)
  }

  payload.logger.info(
    `📄 Populating pages for tenant "${tenantName}" using template "${templateName}"...`,
  )

  // Create each page defined in the template
  for (const pageTemplate of template.pages) {
    try {
      // Check if page already exists
      const existingPage = await payload.find({
        collection: 'pages',
        where: {
          and: [
            {
              slug: {
                equals: pageTemplate.slug,
              },
            },
            {
              tenant: {
                equals: tenantId,
              },
            },
          ],
        },
        limit: 1,
      })

      // Replace template variables in page data
      const pageData: any = {
        slug: pageTemplate.slug,
        tenant: tenantId,
        title: replaceTemplateVars(pageTemplate.title, tenantName, tenantSlug),
        pageType: pageTemplate.pageType,
      }

      if (pageTemplate.description) {
        pageData.description = replaceTemplateVars(pageTemplate.description, tenantName, tenantSlug)
      }
      if (pageTemplate.content) {
        pageData.content = replaceTemplateVars(pageTemplate.content, tenantName, tenantSlug)
      }
      if (pageTemplate.sections) {
        pageData.sections = replaceTemplateVars(pageTemplate.sections, tenantName, tenantSlug)
      }
      if (pageTemplate.meta) {
        pageData.meta = replaceTemplateVars(pageTemplate.meta, tenantName, tenantSlug)
      }

      if (existingPage.docs.length > 0) {
        // Update existing page
        await payload.update({
          collection: 'pages',
          id: existingPage.docs[0].id,
          data: pageData,
        })
        payload.logger.info(`  ✅ Updated page: ${pageTemplate.slug}`)
      } else {
        // Create new page
        await payload.create({
          collection: 'pages',
          data: pageData,
        })
        payload.logger.info(`  ✅ Created page: ${pageTemplate.slug}`)
      }
    } catch (error) {
      payload.logger.error(
        `  ❌ Failed to create/update page "${pageTemplate.slug}":`,
        error,
      )
      // Continue with other pages even if one fails
    }
  }

  payload.logger.info(
    `✅ Finished populating pages for tenant "${tenantName}"`,
  )
}

