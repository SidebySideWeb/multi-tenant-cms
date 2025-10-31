/**
 * Database migration script to convert text columns to jsonb for richText fields
 * Run this BEFORE the data migration script
 * 
 * Usage: npx tsx scripts/migrate-db-schema-to-jsonb.ts
 */

import 'dotenv/config'
import pg from 'pg'

const { Pool } = pg

async function migrateSchema() {
  const connectionString = process.env.POSTGRES_URL || process.env.DATABASE_URI

  if (!connectionString) {
    console.error('❌ Error: POSTGRES_URL or DATABASE_URI not found in environment variables')
    process.exit(1)
  }

  console.log('🔄 Connecting to database...')
  
  const pool = new Pool({
    connectionString,
    ssl: { rejectUnauthorized: false },
    max: 1,
  })

  try {
    console.log('🔄 Starting database schema migration...')
    console.log('Converting text columns to jsonb for richText fields...\n')

    // List of columns to migrate
    const columns = [
      'sections_hero_subheadline',
      'sections_features_subtitle',
      'sections_process_subtitle',
      'sections_contact_subtitle',
    ]

    for (const column of columns) {
      try {
        console.log(`  ⏳ Converting ${column}...`)
        
        // First, convert string data to jsonb format using CASE
        await pool.query(`
          UPDATE pages 
          SET ${column} = (
            CASE 
              WHEN ${column} IS NULL THEN NULL
              WHEN ${column}::text = '' THEN NULL
              ELSE jsonb_build_object(
                'root', jsonb_build_object(
                  'type', 'root',
                  'format', '',
                  'indent', 0,
                  'version', 1,
                  'direction', 'ltr',
                  'children', jsonb_build_array(
                    jsonb_build_object(
                      'type', 'paragraph',
                      'format', '',
                      'indent', 0,
                      'version', 1,
                      'direction', 'ltr',
                      'children', jsonb_build_array(
                        jsonb_build_object(
                          'mode', 'normal',
                          'text', ${column}::text,
                          'type', 'text',
                          'style', '',
                          'detail', 0,
                          'format', 0,
                          'version', 1
                        )
                      )
                    )
                  )
                )
              )
            END
          )
          WHERE ${column} IS NOT NULL 
          AND ${column}::text != ''
          AND ${column}::text !~ '^\\s*\\{.*\\}\\s*$'
        `)
        
        // Then alter the column type to jsonb
        await pool.query(`
          ALTER TABLE pages 
          ALTER COLUMN ${column} 
          TYPE jsonb 
          USING ${column}::jsonb
        `)
        
        console.log(`  ✅ ${column} migrated successfully`)
      } catch (error: any) {
        if (error.message?.includes('cannot be cast automatically')) {
          console.log(`  ⚠️  ${column}: Already jsonb or needs manual conversion`)
        } else {
          console.error(`  ❌ Error migrating ${column}:`, error.message)
        }
      }
    }

    console.log('\n✅ Database schema migration complete!')
  } catch (error) {
    console.error('❌ Migration failed:', error)
    process.exit(1)
  } finally {
    await pool.end()
  }
}

migrateSchema()

