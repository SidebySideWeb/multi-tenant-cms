/**
 * Test script to verify tenant access control is working
 * Run this after deploying to see if access control is being called correctly
 */

import { getPayload } from 'payload'
import configPromise from '../src/payload.config'

async function testTenantAccess() {
  const payload = await getPayload({ config: configPromise })

  console.log('Testing tenant access control...\n')

  // Test 1: Query pages without tenant header (should fail or return empty)
  console.log('Test 1: Query pages without X-Tenant-Slug header')
  try {
    const result1 = await payload.find({
      collection: 'pages',
      where: {
        slug: {
          equals: 'kallitechnia-homepage',
        },
      },
      limit: 1,
    })
    console.log('Result:', {
      count: result1.docs.length,
      pages: result1.docs.map((doc) => ({
        id: doc.id,
        slug: doc.slug,
        tenant: typeof doc.tenant === 'object' ? doc.tenant.id : doc.tenant,
      })),
    })
  } catch (error) {
    console.error('Error:', error)
  }

  console.log('\n')

  // Test 2: Query pages with X-Tenant-Slug header (should work)
  console.log('Test 2: Query pages with X-Tenant-Slug: kallitechnia header')
  try {
    // Simulate request with header
    const mockHeaders = new Headers()
    mockHeaders.set('X-Tenant-Slug', 'kallitechnia')

    // Note: This won't actually work because we can't pass headers to payload.find
    // This is just to show what we expect
    console.log('Note: This test requires actual HTTP request with headers')
  } catch (error) {
    console.error('Error:', error)
  }

  console.log('\n')

  // Test 3: Check what tenants exist
  console.log('Test 3: Check existing tenants')
  try {
    const tenants = await payload.find({
      collection: 'tenants',
      limit: 10,
    })
    console.log('Tenants:', tenants.docs.map((t) => ({ id: t.id, slug: t.slug, name: t.name })))
  } catch (error) {
    console.error('Error:', error)
  }

  console.log('\n')

  // Test 4: Check pages and their tenants
  console.log('Test 4: Check all pages and their tenants')
  try {
    const pages = await payload.find({
      collection: 'pages',
      limit: 10,
    })
    console.log('Pages:', pages.docs.map((p) => ({
      id: p.id,
      slug: p.slug,
      tenant: typeof p.tenant === 'object' ? p.tenant.id : p.tenant,
      tenantSlug: typeof p.tenant === 'object' ? p.tenant.slug : 'N/A',
    })))
  } catch (error) {
    console.error('Error:', error)
  }

  process.exit(0)
}

testTenantAccess().catch(console.error)

