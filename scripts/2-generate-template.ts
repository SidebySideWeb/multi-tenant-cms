/**
 * Step 2: Generate Template Definition from Frontend Project
 * 
 * Analyzes the frontend project structure and generates a template definition
 * that can be used to populate Payload CMS pages.
 * 
 * Usage:
 * pnpm tsx scripts/2-generate-template.ts <project-name>
 * 
 * Example:
 * pnpm tsx scripts/2-generate-template.ts mitsos
 */

import * as fs from 'fs'
import * as path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const rootDir = path.resolve(__dirname, '../..')

interface PageAnalysis {
  slug: string
  filePath: string
  route: string
  hasClientComponent: boolean
  imports: string[]
  props: string[]
}

function analyzeFrontendProject(projectName: string) {
  try {
    console.log(`🔍 Analyzing frontend project: ${projectName}\n`)

    const projectDir = path.join(rootDir, '..', projectName)

    if (!fs.existsSync(projectDir)) {
      throw new Error(`Project directory ${projectDir} not found. Run step 1 first.`)
    }

    const appDir = path.join(projectDir, 'app')
    if (!fs.existsSync(appDir)) {
      throw new Error(`App directory not found. Is this a Next.js project?`)
    }

    // Find all page files
    const pages: PageAnalysis[] = []
    const analyzeDirectory = (dir: string, route: string = '') => {
      const entries = fs.readdirSync(dir, { withFileTypes: true })

      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name)
        const routePath = route ? `${route}/${entry.name}` : entry.name

        if (entry.isDirectory()) {
          // Skip special Next.js directories
          if (!['api', '_not-found', 'globals.css'].includes(entry.name)) {
            analyzeDirectory(fullPath, routePath)
          }
        } else if (entry.name === 'page.tsx' || entry.name === 'page.ts') {
          // Found a page
          const slug = route || 'home'
          const content = fs.readFileSync(fullPath, 'utf-8')
          
          // Analyze the page
          const imports = extractImports(content)
          const props = extractProps(content)
          const hasClientComponent = content.includes("'use client'") || content.includes('"use client"')

          pages.push({
            slug: slug === 'page' ? 'home' : slug.replace('/page', ''),
            filePath: fullPath,
            route: routePath.replace('/page', '') || 'home',
            hasClientComponent,
            imports,
            props,
          })
        }
      }
    }

    analyzeDirectory(appDir)

    console.log(`📄 Found ${pages.length} pages:\n`)
    pages.forEach((page) => {
      console.log(`   - ${page.slug} (${page.route})`)
    })

    // Generate template definition
    const templateCode = generateTemplateDefinition(projectName, pages)

    // Save template definition
    const templateDir = path.join(rootDir, 'src', 'templates', 'generated')
    if (!fs.existsSync(templateDir)) {
      fs.mkdirSync(templateDir, { recursive: true })
    }

    const templateFilePath = path.join(templateDir, `${projectName}.ts`)
    fs.writeFileSync(templateFilePath, templateCode)

    console.log(`\n✅ Template definition generated:`)
    console.log(`   ${templateFilePath}\n`)

    console.log(`📋 Next steps:`)
    console.log(`   1. Review and customize the generated template`)
    console.log(`   2. Import it in src/templates/index.ts`)
    console.log(`   3. Run: pnpm tsx scripts/3-create-tenant.ts ${projectName}`)
    console.log(`\n`)

    return templateFilePath
  } catch (error) {
    console.error('❌ Error:', error)
    process.exit(1)
  }
}

function extractImports(content: string): string[] {
  const importRegex = /import\s+.*?\s+from\s+['"](.+?)['"]/g
  const imports: string[] = []
  let match

  while ((match = importRegex.exec(content)) !== null) {
    imports.push(match[1])
  }

  return imports
}

function extractProps(content: string): string[] {
  // Look for component props, data structures, etc.
  const props: string[] = []
  
  // Look for defaultData or similar patterns
  const defaultDataMatch = content.match(/const\s+defaultData\s*=\s*\{([^}]+)\}/s)
  if (defaultDataMatch) {
    // Extract keys from the object
    const keys = defaultDataMatch[1].match(/(\w+):/g)
    if (keys) {
      keys.forEach((key) => {
        props.push(key.replace(':', '').trim())
      })
    }
  }

  return props
}

function generateTemplateDefinition(projectName: string, pages: PageAnalysis[]): string {
  const templateName = projectName.replace(/-/g, '')
  const className = templateName.charAt(0).toUpperCase() + templateName.slice(1)

  let code = `/**
 * Generated Template Definition for ${projectName}
 * 
 * This file was auto-generated from the frontend project structure.
 * Please review and customize the page structures and default content.
 */

import type { TemplateDefinition } from '../types'

export const ${templateName}Template: TemplateDefinition = {
  name: '${projectName}',
  description: 'Template generated from ${projectName} frontend project',
  pages: [
`

  pages.forEach((page) => {
    const isHome = page.slug === 'home'
    const pageType = isHome ? 'landing' : 'standard'

    code += `    {
      slug: '${page.slug}',
      title: '${page.slug.charAt(0).toUpperCase() + page.slug.slice(1)}',
      pageType: '${pageType}',
`

    if (isHome) {
      code += `      sections: {
        // TODO: Add sections based on your V0.app template structure
        // Example structure (customize based on your actual components):
        header: {
          logo_text: '{{tenant-name}}.gr',
          menu: [],
          cta: {
            label: 'Get Started',
            link: '/contact',
          },
        },
        hero: {
          headline: 'Welcome to {{tenant-name}}',
          subheadline: 'Your default headline here',
          cta: 'Get Started',
          stats: [],
        },
        // Add more sections as needed
      },
`
    } else {
      code += `      content: 'Default content for ${page.slug} page',
`
    }

    code += `    },
`
  })

  code += `  ],
}

`

  return code
}

// Parse command line arguments
const args = process.argv.slice(2)

if (args.length < 1) {
  console.error('Usage: pnpm tsx scripts/2-generate-template.ts <project-name>')
  console.error('Example: pnpm tsx scripts/2-generate-template.ts mitsos')
  process.exit(1)
}

const projectName = args[0]
analyzeFrontendProject(projectName)

