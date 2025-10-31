/**
 * Step 3: Create Tenant and Populate with Template
 * 
 * Creates a tenant in Payload CMS and populates it with pages from the template
 * 
 * Usage:
 * pnpm tsx scripts/3-create-tenant.ts <project-name> <tenant-name> [tenant-slug] [domain]
 * 
 * Example:
 * pnpm tsx scripts/3-create-tenant.ts mitsos "Mitsos Site" mitsos mitsos.localhost
 */

import { getPayloadClient } from '../src/utilities/remotePayloadClient'
import { getTemplate } from '../src/templates'
import { populateTenantPages } from '../src/utilities/populateTenantPages'
import * as fs from 'fs'
import * as path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const rootDir = path.resolve(__dirname, '../..')

async function createTenant(
  projectName: string,
  tenantName: string,
  tenantSlug?: string,
  domain?: string,
) {
  try {
    console.log(`🚀 Creating tenant for project: ${projectName}\n`)

    // Use project name as slug if not provided
    const slug = tenantSlug || projectName

    // Check if template exists
    const template = getTemplate(projectName)
    if (!template) {
      const { getAvailableTemplates } = await import('../src/templates')
      const available = getAvailableTemplates().join(', ')
      console.error(`❌ Template "${projectName}" not found.`)
      console.error(`   Available templates: ${available}`)
      console.error(`\n   Make sure you've:`)
      console.error(`   1. Generated the template (step 2)`)
      console.error(`   2. Imported it in src/templates/index.ts`)
      console.error(`   3. Added it to Tenants collection template options`)
      process.exit(1)
    }

    console.log(`📝 Template found: ${template.name}`)
    console.log(`   Pages: ${template.pages.length}\n`)

    // Initialize Payload (connects to database directly, or API if PAYLOAD_API_URL is set)
    const payload = await getPayloadClient()
    
    // Check connection method
    const apiUrl = process.env.PAYLOAD_API_URL || process.env.NEXT_PUBLIC_PAYLOAD_URL
    if (apiUrl) {
      console.log(`🌐 Connecting to deployed CMS via API: ${apiUrl}\n`)
    } else {
      console.log(`💾 Connecting directly to database (Supabase PostgreSQL)\n`)
    }

    // Check if tenant already exists
    const existingTenant = await payload.find({
      collection: 'tenants',
      where: {
        slug: {
          equals: slug,
        },
      },
      limit: 1,
    })

    if (existingTenant.docs.length > 0) {
      console.log(`⚠️  Tenant with slug "${slug}" already exists.`)
      console.log(`   Updating existing tenant...\n`)
      
      const tenant = existingTenant.docs[0]
      
      // Update tenant
      await payload.update({
        collection: 'tenants',
        id: tenant.id,
        data: {
          name: tenantName,
          template: projectName as any, // Template type will be expanded as more templates are added
          domain: domain,
        },
      })

      // Re-populate pages
      await populateTenantPages(payload, tenant.id, projectName, tenantName, slug)

      console.log(`✅ Tenant updated and pages re-populated!\n`)
    } else {
      // Create new tenant
      console.log(`📝 Creating tenant in Payload CMS...`)
      const tenant = await payload.create({
        collection: 'tenants',
        data: {
          name: tenantName,
          slug: slug,
          template: projectName as any, // Template type will be expanded as more templates are added
          domain: domain,
          allowPublicRead: true,
        },
      })

      console.log(`✅ Tenant created: ${tenant.name} (ID: ${tenant.id})\n`)

      // Pages should be auto-populated by hook, but verify
      const pages = await payload.find({
        collection: 'pages',
        where: {
          tenant: {
            equals: tenant.id,
          },
        },
      })

      console.log(`📄 Pages created: ${pages.docs.length}`)
      pages.docs.forEach((page) => {
        console.log(`   - ${page.slug} (${page.pageType})`)
      })
      console.log(`\n`)
    }

    console.log(`📋 Next steps:`)
    console.log(`   1. Go to Payload Admin: http://localhost:3000/admin`)
    console.log(`   2. Navigate to Pages → Filter by tenant: "${slug}"`)
    console.log(`   3. Edit page content as needed`)
    console.log(`   4. Run: pnpm tsx scripts/4-generate-docs.ts ${projectName} ${slug}`)
    console.log(`\n`)

    process.exit(0)
  } catch (error) {
    console.error('❌ Error:', error)
    process.exit(1)
  }
}

// Parse command line arguments
const args = process.argv.slice(2)

if (args.length < 2) {
  console.error('Usage: pnpm tsx scripts/3-create-tenant.ts <project-name> <tenant-name> [tenant-slug] [domain]')
  console.error('Example: pnpm tsx scripts/3-create-tenant.ts mitsos "Mitsos Site" mitsos mitsos.localhost')
  process.exit(1)
}

const [projectName, tenantName, tenantSlug, domain] = args
createTenant(projectName, tenantName, tenantSlug, domain)

