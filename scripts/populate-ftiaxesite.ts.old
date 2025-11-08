/**
 * Script to populate homepage for the ftiaxesite tenant
 * 
 * Run with: pnpm tsx scripts/populate-ftiaxesite.ts
 * 
 * Note: Make sure your .env file is configured with proper database credentials
 */

import { getPayload } from 'payload'
import config from '../src/payload.config'
import { populateExistingTenant } from '../src/scripts/populateExistingTenant'

async function main() {
  try {
    console.log('🚀 Starting homepage population for ftiaxesite tenant...')
    
    const payload = await getPayload({ config })
    
    await populateExistingTenant(payload, 'ftiaxesite')
    
    console.log('✅ Successfully populated homepage for ftiaxesite tenant!')
    console.log('📝 You can now view/edit it in Payload Admin → Pages')
    
    process.exit(0)
  } catch (error) {
    console.error('❌ Error populating homepage:', error)
    process.exit(1)
  }
}

main()

