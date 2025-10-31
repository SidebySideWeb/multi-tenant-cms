/**
 * SEED FILE - COMMENTED OUT FOR PRODUCTION USE
 * 
 * This file was used for initial database seeding during development.
 * It creates demo tenants, users, and pages for testing purposes.
 * 
 * DISABLED: This seed file is disabled by default (SEED_DB=false in .env).
 * 
 * To use this seed file:
 * 1. Set SEED_DB=true in your .env file
 * 2. Run: npm run seed:fresh (WARNING: This will drop your database!)
 * 
 * For production, create tenants and users manually through the Payload admin panel.
 */

import { Config } from 'payload'

// export const seed: NonNullable<Config['onInit']> = async (payload): Promise<void> => {
//   const tenant1 = await payload.create({
//     collection: 'tenants',
//     data: {
//       name: 'Tenant 1',
//       slug: 'gold',
//       domain: 'gold.localhost',
//     },
//   })

//   const tenant2 = await payload.create({
//     collection: 'tenants',
//     data: {
//       name: 'Tenant 2',
//       slug: 'silver',
//       domain: 'silver.localhost',
//     },
//   })

//   const tenant3 = await payload.create({
//     collection: 'tenants',
//     data: {
//       name: 'Tenant 3',
//       slug: 'bronze',
//       domain: 'bronze.localhost',
//     },
//   })

//   await payload.create({
//     collection: 'users',
//     data: {
//       email: 'demo@payloadcms.com',
//       password: 'demo',
//       roles: ['super-admin'],
//     },
//   })

//   await payload.create({
//     collection: 'users',
//     data: {
//       email: 'tenant1@payloadcms.com',
//       password: 'demo',
//       tenants: [
//         {
//           roles: ['tenant-admin'],
//           tenant: tenant1.id,
//         },
//       ],
//       username: 'tenant1',
//     },
//   })

//   await payload.create({
//     collection: 'users',
//     data: {
//       email: 'tenant2@payloadcms.com',
//       password: 'demo',
//       tenants: [
//         {
//           roles: ['tenant-admin'],
//           tenant: tenant2.id,
//         },
//       ],
//       username: 'tenant2',
//     },
//   })

//   await payload.create({
//     collection: 'users',
//     data: {
//       email: 'tenant3@payloadcms.com',
//       password: 'demo',
//       tenants: [
//         {
//           roles: ['tenant-admin'],
//           tenant: tenant3.id,
//         },
//       ],
//       username: 'tenant3',
//     },
//   })

//   await payload.create({
//     collection: 'users',
//     data: {
//       email: 'multi-admin@payloadcms.com',
//       password: 'demo',
//       tenants: [
//         {
//           roles: ['tenant-admin'],
//           tenant: tenant1.id,
//         },
//         {
//           roles: ['tenant-admin'],
//           tenant: tenant2.id,
//         },
//         {
//           roles: ['tenant-admin'],
//           tenant: tenant3.id,
//         },
//       ],
//       username: 'multi-admin',
//     },
//   })

//   await payload.create({
//     collection: 'pages',
//     data: {
//       slug: 'home',
//       tenant: tenant1.id,
//       title: 'Page for Tenant 1',
//     },
//   })

//   await payload.create({
//     collection: 'pages',
//     data: {
//       slug: 'home',
//       tenant: tenant2.id,
//       title: 'Page for Tenant 2',
//     },
//   })

//   await payload.create({
//     collection: 'pages',
//     data: {
//       slug: 'home',
//       tenant: tenant3.id,
//       title: 'Page for Tenant 3',
//     },
//   })
// }

// Export an empty function to prevent TypeScript errors
export const seed: NonNullable<Config['onInit']> = async (): Promise<void> => {
  // Seed function is disabled - see comments above
  return Promise.resolve()
}
