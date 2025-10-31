/**
 * Step 1: Create Frontend Project
 * 
 * Copies ftiaxesite template and renames it to new project name
 * 
 * Usage:
 * pnpm tsx scripts/1-create-frontend-project.ts <new-project-name>
 * 
 * Example:
 * pnpm tsx scripts/1-create-frontend-project.ts mitsos
 */

import * as fs from 'fs'
import * as path from 'path'
import { execSync } from 'child_process'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const rootDir = path.resolve(__dirname, '../..')

function createFrontendProject(projectName: string) {
  try {
    console.log(`🚀 Creating frontend project: ${projectName}\n`)

    const templateDir = path.join(rootDir, '..', 'ftiaxesite')
    const projectDir = path.join(rootDir, '..', projectName)

    // Check if template exists
    if (!fs.existsSync(templateDir)) {
      throw new Error(`Template directory ${templateDir} not found. Please ensure ftiaxesite project exists.`)
    }

    // Check if project already exists
    if (fs.existsSync(projectDir)) {
      throw new Error(`Project directory ${projectDir} already exists. Please choose a different name.`)
    }

    console.log(`📁 Copying template from ${templateDir}...`)
    
    // Cross-platform copy
    if (process.platform === 'win32') {
      execSync(`xcopy /E /I /Y "${templateDir}" "${projectDir}"`, { stdio: 'inherit' })
    } else {
      execSync(`cp -r "${templateDir}" "${projectDir}"`, { stdio: 'inherit' })
    }

    // Update package.json
    const packageJsonPath = path.join(projectDir, 'package.json')
    if (fs.existsSync(packageJsonPath)) {
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'))
      packageJson.name = projectName
      fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2))
      console.log(`✅ Updated package.json\n`)
    }

    // Update .env.local.example if exists
    const envExamplePath = path.join(projectDir, '.env.local.example')
    if (fs.existsSync(envExamplePath)) {
      let envContent = fs.readFileSync(envExamplePath, 'utf-8')
      envContent = envContent.replace(/ftiaxesite/g, projectName)
      fs.writeFileSync(envExamplePath, envContent)
      console.log(`✅ Updated .env.local.example\n`)
    }

    // Update any references in README or config files
    const readmePath = path.join(projectDir, 'README.md')
    if (fs.existsSync(readmePath)) {
      let readmeContent = fs.readFileSync(readmePath, 'utf-8')
      readmeContent = readmeContent.replace(/ftiaxesite/g, projectName)
      fs.writeFileSync(readmePath, readmeContent)
    }

    console.log(`✅ Frontend project created successfully!\n`)
    console.log(`📋 Next steps:`)
    console.log(`   1. cd ../${projectName}`)
    console.log(`   2. Add your V0.app template code`)
    console.log(`   3. Run: pnpm tsx ../multi-tenant/scripts/2-generate-template.ts ${projectName}`)
    console.log(`\n`)

    process.exit(0)
  } catch (error) {
    console.error('❌ Error:', error)
    process.exit(1)
  }
}

// Parse command line arguments
const args = process.argv.slice(2)

if (args.length < 1) {
  console.error('Usage: pnpm tsx scripts/1-create-frontend-project.ts <project-name>')
  console.error('Example: pnpm tsx scripts/1-create-frontend-project.ts mitsos')
  process.exit(1)
}

const projectName = args[0]

if (!/^[a-z0-9-]+$/.test(projectName)) {
  console.error('❌ Project name must be lowercase letters, numbers, and hyphens only')
  console.error('   Example: mitsos, my-site, project-123')
  process.exit(1)
}

createFrontendProject(projectName)

