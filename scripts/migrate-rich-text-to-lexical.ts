/**
 * Migration script to convert all string values in richText fields to Lexical format
 * Run this script once to migrate existing data in the database
 * 
 * Usage: npx tsx scripts/migrate-rich-text-to-lexical.ts
 */

import 'dotenv/config'
import { getPayload } from 'payload'
import config from '../src/payload.config'
import { convertStringToLexical } from '../src/collections/Pages/hooks/convertRichTextValue'

async function migrateRichTextFields() {
  const payload = await getPayload({ config })

  try {
    console.log('Starting migration of richText fields to Lexical format...')

    // Get all pages
    const pages = await payload.find({
      collection: 'pages',
      limit: 1000,
      depth: 0,
    })

    console.log(`Found ${pages.totalDocs} pages to migrate`)

    let migrated = 0

    for (const page of pages.docs) {
      let needsUpdate = false
      const updateData: any = {}

      // Process sections
      if (page.sections) {
        const sections: any = { ...page.sections }

        // Hero section
        if (sections.hero?.subheadline && typeof sections.hero.subheadline === 'string') {
          sections.hero.subheadline = convertStringToLexical(sections.hero.subheadline)
          needsUpdate = true
        }

        // Features section
        if (sections.features) {
          if (sections.features.subtitle && typeof sections.features.subtitle === 'string') {
            sections.features.subtitle = convertStringToLexical(sections.features.subtitle)
            needsUpdate = true
          }
          if (Array.isArray(sections.features.items)) {
            sections.features.items = sections.features.items.map((item: any) => {
              if (item?.description && typeof item.description === 'string') {
                needsUpdate = true
                return { ...item, description: convertStringToLexical(item.description) }
              }
              return item
            })
          }
        }

        // Process section
        if (sections.process) {
          if (sections.process.subtitle && typeof sections.process.subtitle === 'string') {
            sections.process.subtitle = convertStringToLexical(sections.process.subtitle)
            needsUpdate = true
          }
          if (Array.isArray(sections.process.steps)) {
            sections.process.steps = sections.process.steps.map((step: any) => {
              if (step?.description && typeof step.description === 'string') {
                needsUpdate = true
                return { ...step, description: convertStringToLexical(step.description) }
              }
              return step
            })
          }
        }

        // Contact section
        if (sections.contact?.subtitle && typeof sections.contact.subtitle === 'string') {
          sections.contact.subtitle = convertStringToLexical(sections.contact.subtitle)
          needsUpdate = true
        }

        if (needsUpdate) {
          updateData.sections = sections
        }
      }

      if (needsUpdate) {
        await payload.update({
          collection: 'pages',
          id: page.id,
          data: updateData,
        })
        migrated++
        console.log(`✓ Migrated page: ${page.title} (${page.slug})`)
      }
    }

    console.log(`\n✅ Migration complete! Migrated ${migrated} pages.`)
  } catch (error) {
    console.error('❌ Migration failed:', error)
    process.exit(1)
  } finally {
    await payload.db.destroy()
  }
}

migrateRichTextFields()

