/**
 * Master script to create a tenant AND generate its frontend Next.js project
 * 
 * Usage:
 * pnpm tsx scripts/createTenantWithFrontend.ts <tenant-name> <tenant-slug> [template] [domain]
 * 
 * Example:
 * pnpm tsx scripts/createTenantWithFrontend.ts "Mitsos Site" mitsos ftiaxesite mitsos.localhost
 */

import { getPayload } from 'payload'
import config from '../src/payload.config'
import { getTemplate, getAvailableTemplates } from '../src/templates'
import { execSync } from 'child_process'
import * as fs from 'fs'
import * as path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const rootDir = path.resolve(__dirname, '../..')

async function createTenantWithFrontend(
  tenantName: string,
  tenantSlug: string,
  templateName: string = 'ftiaxesite',
  domain?: string,
) {
  try {
    console.log(`🚀 Creating tenant "${tenantName}" with frontend project...`)
    console.log(`   Slug: ${tenantSlug}`)
    console.log(`   Template: ${templateName}`)
    console.log(`   Domain: ${domain || 'not set'}\n`)

    // 1. Validate template exists
    const template = getTemplate(templateName)
    if (!template) {
      const available = getAvailableTemplates().join(', ')
      throw new Error(`Template "${templateName}" not found. Available: ${available}`)
    }

    // 2. Initialize Payload
    const payload = await getPayload({ config })

    // 3. Create tenant in Payload CMS
    console.log('📝 Creating tenant in Payload CMS...')
    const tenant = await payload.create({
      collection: 'tenants',
      data: {
        name: tenantName,
        slug: tenantSlug,
        template: templateName,
        domain: domain,
        allowPublicRead: true, // Allow public read for frontend sites
      },
    })

    console.log(`✅ Tenant created: ${tenant.name} (ID: ${tenant.id})\n`)

    // 4. Pages should be auto-populated by the hook, but verify
    const pages = await payload.find({
      collection: 'pages',
      where: {
        tenant: {
          equals: tenant.id,
        },
      },
    })
    console.log(`📄 Pages created: ${pages.docs.length}\n`)

    // 5. Generate Next.js frontend project
    console.log('⚙️  Generating Next.js frontend project...')
    const frontendDir = path.join(rootDir, '..', tenantSlug)

    if (fs.existsSync(frontendDir)) {
      console.log(`⚠️  Directory ${frontendDir} already exists. Skipping project creation.`)
      console.log(`   You can manually copy from ftiaxesite template if needed.\n`)
    } else {
      // Copy ftiaxesite as template
      const templateDir = path.join(rootDir, '..', 'ftiaxesite')
      if (!fs.existsSync(templateDir)) {
        throw new Error(`Template directory ${templateDir} not found. Please ensure ftiaxesite project exists.`)
      }

      console.log(`   Copying template from ${templateDir}...`)
      // Use cross-platform copy
      if (process.platform === 'win32') {
        execSync(`xcopy /E /I /Y "${templateDir}" "${frontendDir}"`, { stdio: 'inherit' })
      } else {
        execSync(`cp -r "${templateDir}" "${frontendDir}"`, { stdio: 'inherit' })
      }

      // Update package.json
      const packageJsonPath = path.join(frontendDir, 'package.json')
      if (fs.existsSync(packageJsonPath)) {
        const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'))
        packageJson.name = tenantSlug
        fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2))
      }

      // Update .env.local.example if it exists
      const envExamplePath = path.join(frontendDir, '.env.local.example')
      if (fs.existsSync(envExamplePath)) {
        let envContent = fs.readFileSync(envExamplePath, 'utf-8')
        // Update any tenant-specific values if needed
        envContent = envContent.replace(/ftiaxesite/g, tenantSlug)
        fs.writeFileSync(envExamplePath, envContent)
      }

      console.log(`✅ Frontend project created at: ${frontendDir}\n`)
      console.log(`📋 Next steps:`)
      console.log(`   1. cd ${frontendDir}`)
      console.log(`   2. Copy .env.local.example to .env.local (if exists)`)
      console.log(`   3. Update NEXT_PUBLIC_PAYLOAD_URL in .env.local`)
      console.log(`   4. npm install`)
      console.log(`   5. npm run dev\n`)
    }

    console.log(`🎉 Tenant "${tenantName}" setup complete!`)
    console.log(`   CMS: http://localhost:3000/admin`)
    console.log(`   Frontend: http://localhost:3001 (when running)\n`)

    process.exit(0)
  } catch (error) {
    console.error('❌ Error:', error)
    process.exit(1)
  }
}

// Parse command line arguments
const args = process.argv.slice(2)

if (args.length < 2) {
  console.error('Usage: pnpm tsx scripts/createTenantWithFrontend.ts <tenant-name> <tenant-slug> [template] [domain]')
  console.error('Example: pnpm tsx scripts/createTenantWithFrontend.ts "Mitsos Site" mitsos ftiaxesite mitsos.localhost')
  process.exit(1)
}

const [tenantName, tenantSlug, templateName = 'ftiaxesite', domain] = args

createTenantWithFrontend(tenantName, tenantSlug, templateName, domain)

