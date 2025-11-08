import 'dotenv/config'

import { Pool } from 'pg'

async function dropSchema() {
  const connectionString = process.env.POSTGRES_URL

  if (!connectionString) {
    throw new Error('POSTGRES_URL env var not set')
  }

  const pool = new Pool({ connectionString })

  try {
    console.log('🚨 Dropping schema public CASCADE...')
    await pool.query('DROP SCHEMA public CASCADE;')

    console.log('🛠  Recreating schema public...')
    await pool.query('CREATE SCHEMA public;')
    await pool.query('GRANT ALL ON SCHEMA public TO postgres;')
    await pool.query('GRANT ALL ON SCHEMA public TO public;')

    console.log('✅ Schema reset complete.')
  } finally {
    await pool.end()
  }
}

dropSchema().catch((error) => {
  console.error('❌ Failed to reset schema:', error)
  process.exit(1)
})
