/**
 * SEED FILE - DISABLED BY DEFAULT
 *
 * This file is left in the repo for documentation purposes. The actual seeding
 * logic has been commented out to avoid accidental execution in production.
 */

import type { Config } from 'payload'

// import { convertStringToLexical } from './collections/Pages/hooks/convertRichTextValue'

// const ensureSuperAdmin = async (
//   payload: Parameters<NonNullable<Config['onInit']>>[0],
//   email: string,
//   password: string,
// ) => {
//   const existing = await payload.find({
//     collection: 'users',
//     where: {
//       email: {
//         equals: email,
//       },
//     },
//     limit: 1,
//     depth: 0,
//   })

//   if (existing.docs.length > 0) {
//    await (payload as any).update({
//      collection: 'users',
//      id: existing.docs[0].id,
//      data: {
//        email,
//        password,
//        roles: ['super-admin'],
//      },
//    })
//   } else {
//     await (payload as any).create({
//       collection: 'users',
//       data: {
//         email,
//         password,
//         roles: ['super-admin'],
//       },
//     })
//   }
// }

// export const seed: NonNullable<Config['onInit']> = async (payload) => {
//   const tenantSlug = 'ftiaxesite'
//
//   const existingTenant = await payload.find({
//     collection: 'tenants',
//     where: {
//       slug: {
//         equals: tenantSlug,
//       },
//     },
//     limit: 1,
//     depth: 0,
//   })

//   let tenantId: number | string
//
//   if (existingTenant.docs.length > 0) {
//     tenantId = existingTenant.docs[0].id
//   } else {
//     const tenant = await (payload as any).create({
//       collection: 'tenants',
//       data: {
//         name: 'ftiaxesite',
//         slug: tenantSlug,
//         domain: 'ftiaxesite.gr',
//       },
//     })
//
//     tenantId = tenant.id
//   }
//
//   const existingPage = await payload.find({
//     collection: 'pages',
//     where: {
//       and: [
//         {
//           slug: {
//             equals: 'ftiaxesite-homepage',
//           },
//         },
//         {
//           tenant: {
//             equals: tenantId,
//           },
//         },
//       ],
//     },
//     limit: 1,
//     depth: 0,
//   })
//
//   const landingSections = { /* ...omitted for brevity... */ }
//
//   const pagePayload = {
//     slug: 'ftiaxesite-homepage',
//     tenant: tenantId,
//     title: 'Ftiaxesite-homepage',
//     pageType: 'landing',
//     description: 'AI-powered websites σε 48 ώρες',
//     sections: landingSections,
//     meta: {
//       title: 'ftiaxesite.gr - AI Websites σε 48 Ώρες',
//       description:
//         'Φτιάξε το site σου σε 48 ώρες με τη δύναμη της Τεχνητής Νοημοσύνης. Οικονομικά, γρήγορα και επαγγελματικά websites από 250€.',
//     },
//   }
//
//   if (existingPage.docs.length > 0) {
//     await (payload as any).update({
//       collection: 'pages',
//       id: existingPage.docs[0].id,
//       data: pagePayload,
//     })
//   } else {
//     await (payload as any).create({
//       collection: 'pages',
//       data: pagePayload,
//     })
//   }
//
//   await ensureSuperAdmin(payload, 'demo@payloadcms.com', 'demo')
//   await ensureSuperAdmin(payload, 'dgeronikolos@sidebysideweb.gr', 'DimiGero1984!!!')
// }

export const seed: NonNullable<Config['onInit']> = async () => {
  // Seed disabled
  return Promise.resolve()
}
