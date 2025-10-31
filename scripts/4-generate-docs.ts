/**
 * Step 4: Generate Documentation for Tenant
 * 
 * Creates a comprehensive manual for editing content, creating pages, etc.
 * 
 * Usage:
 * pnpm tsx scripts/4-generate-docs.ts <project-name> <tenant-slug>
 * 
 * Example:
 * pnpm tsx scripts/4-generate-docs.ts mitsos mitsos
 */

import { getPayloadClient } from '../src/utilities/remotePayloadClient'
import { getTemplate } from '../src/templates'
import * as fs from 'fs'
import * as path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const rootDir = path.resolve(__dirname, '../..')

async function generateDocumentation(projectName: string, tenantSlug: string) {
  try {
    console.log(`📚 Generating documentation for ${projectName} (${tenantSlug})\n`)

    const payload = await getPayloadClient()
    const template = getTemplate(projectName)
    
    // Check if connecting to remote API
    const apiUrl = process.env.PAYLOAD_API_URL || process.env.NEXT_PUBLIC_PAYLOAD_URL
    if (apiUrl) {
      console.log(`🌐 Connecting to deployed CMS: ${apiUrl}\n`)
    }

    if (!template) {
      throw new Error(`Template "${projectName}" not found`)
    }

    // Get tenant info
    const tenantResult = await payload.find({
      collection: 'tenants',
      where: {
        slug: {
          equals: tenantSlug,
        },
      },
      limit: 1,
    })

    if (tenantResult.docs.length === 0) {
      throw new Error(`Tenant with slug "${tenantSlug}" not found`)
    }

    const tenant = tenantResult.docs[0]

    // Get pages for this tenant
    const pagesResult = await payload.find({
      collection: 'pages',
      where: {
        tenant: {
          equals: tenant.id,
        },
      },
    })

    const pages = pagesResult.docs

    // Generate documentation
    const docs = generateDocsContent(projectName, tenant, template, pages)

    // Save documentation
    const docsDir = path.join(rootDir, '..', projectName, 'docs')
    if (!fs.existsSync(docsDir)) {
      fs.mkdirSync(docsDir, { recursive: true })
    }

    const docsPath = path.join(docsDir, 'CONTENT_MANAGEMENT.md')
    fs.writeFileSync(docsPath, docs)

    console.log(`✅ Documentation generated:`)
    console.log(`   ${docsPath}\n`)

    process.exit(0)
  } catch (error) {
    console.error('❌ Error:', error)
    process.exit(1)
  }
}

function generateDocsContent(
  projectName: string,
  tenant: any,
  template: any,
  pages: any[],
): string {
  const tenantName = tenant.name
  const tenantSlug = tenant.slug

  let docs = `# Content Management Guide - ${tenantName}

This guide explains how to manage content for **${tenantName}** in Payload CMS.

## 🎯 Overview

- **Tenant Name**: ${tenantName}
- **Tenant Slug**: ${tenantSlug}
- **Template**: ${template.name}
- **Total Pages**: ${pages.length}

## 📝 Accessing Payload CMS

1. Go to: https://cms.ftiaxesite.gr/admin
2. Log in with your credentials
3. Navigate to **Pages** collection
4. Filter by tenant: **${tenantSlug}**

## 📄 Managing Pages

### Existing Pages

Your site currently has ${pages.length} page(s):

`

  pages.forEach((page, index) => {
    docs += `${index + 1}. **${page.title}** (\`${page.slug}\`)
   - Type: ${page.pageType}
   - URL: /${page.slug === 'home' ? '' : page.slug}
   - Edit: Payload Admin → Pages → ${page.title}
`
  })

  docs += `
### Editing a Page

1. Go to **Payload Admin → Pages**
2. Filter by tenant: **${tenantSlug}**
3. Click on the page you want to edit
4. Make your changes
5. Click **Save**

### Creating a New Page

1. Go to **Payload Admin → Pages**
2. Click **Create New**
3. Fill in:
   - **Title**: Page title
   - **Slug**: URL slug (e.g., "about", "contact")
   - **Tenant**: Select **${tenantName}**
   - **Page Type**: Choose appropriate type
4. Add content based on page type
5. Click **Save**

### Page Types

`

  const pageTypes = {
    landing: '**Landing Page** - Full sections (header, hero, features, process, contact, footer)',
    standard: '**Standard Page** - Simple content page with rich text editor',
    blog: '**Blog Post** - Article/blog post structure',
    custom: '**Custom** - Custom structure',
  }

  Object.entries(pageTypes).forEach(([type, desc]) => {
    docs += `- ${desc}\n`
  })

  docs += `
## 🎨 Page Sections (Landing Pages)

If your page type is **landing**, you can edit these sections:

`

  if (template.pages.some((p: any) => p.pageType === 'landing')) {
    const landingPage = template.pages.find((p: any) => p.pageType === 'landing')
    if (landingPage?.sections) {
      Object.keys(landingPage.sections).forEach((section) => {
        docs += `### ${section.charAt(0).toUpperCase() + section.slice(1)} Section\n`
        docs += `Edit the ${section} section content, styling, and configuration.\n\n`
      })
    }
  }

  docs += `
## 📸 Managing Media

### Uploading Images

1. Go to **Payload Admin → Media**
2. Click **Upload**
3. Select your image file
4. Add alt text for accessibility
5. Click **Save**

### Using Images in Pages

1. When editing a page, find image fields
2. Click **Select Media** or **Upload New**
3. Choose or upload your image
4. The image will be automatically linked

## 🔗 Creating Blog Posts

1. Go to **Payload Admin → Pages**
2. Click **Create New**
3. Set **Page Type** to **blog**
4. Fill in:
   - Title
   - Slug
   - Content (rich text)
   - Featured Image
   - Publication Date
5. Click **Save**

## 🔍 SEO Settings

Each page has SEO fields:

- **Meta Title**: SEO title (defaults to page title)
- **Meta Description**: SEO description
- **OG Image**: Social sharing image

Edit these in the **Meta** section when editing a page.

## 📋 Quick Reference

### Common Tasks

- **Edit homepage**: Pages → Home → Edit
- **Add new page**: Pages → Create New
- **Upload image**: Media → Upload
- **Change tenant settings**: Tenants → ${tenantName} → Edit

### Field Descriptions

`

  // Add field descriptions based on template
  docs += `- **Title**: Page title (shown in browser tab and navigation)
- **Slug**: URL path (e.g., "about" creates /about page)
- **Page Type**: Determines which fields are available
- **Content**: Main page content (for standard pages)
- **Sections**: Structured content blocks (for landing pages)
- **Featured Image**: Main image for the page
- **Meta**: SEO and social media settings

## 🆘 Need Help?

- Check Payload CMS documentation: https://payloadcms.com/docs
- Review template structure in: \`src/templates/${projectName}.ts\`
- Check frontend code in: \`../${projectName}/\`

---

**Last Updated**: ${new Date().toLocaleDateString()}
`

  return docs
}

// Parse command line arguments
const args = process.argv.slice(2)

if (args.length < 2) {
  console.error('Usage: pnpm tsx scripts/4-generate-docs.ts <project-name> <tenant-slug>')
  console.error('Example: pnpm tsx scripts/4-generate-docs.ts mitsos mitsos')
  process.exit(1)
}

const [projectName, tenantSlug] = args
generateDocumentation(projectName, tenantSlug)

