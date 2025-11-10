import { mongooseAdapter } from '@payloadcms/db-mongodb'
import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { s3Storage } from '@payloadcms/storage-s3'
import path from 'path'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'

import { Media } from './collections/Media'
import { Posts } from './collections/Posts'
import { PageTypes } from './collections/PageTypes'
import { Pages } from './collections/Pages'
import { Tenants } from './collections/Tenants'
import Users from './collections/Users'
import { multiTenantPlugin } from '@payloadcms/plugin-multi-tenant'
import { isSuperAdmin } from './access/isSuperAdmin'
import type { Config } from './payload-types'
import { getUserTenantIDs } from './utilities/getUserTenantIDs'
import { seed } from './seed'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

// CORS configuration for client websites
// Set ALLOWED_ORIGINS env var with comma-separated list of client domains
// Example: ALLOWED_ORIGINS=https://client1.com,https://client2.com
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',').map((origin) => origin.trim())
  : ['*'] // Allow all origins in development

// eslint-disable-next-line no-restricted-exports
export default buildConfig({
  admin: {
    user: 'users',
  },
  cors: allowedOrigins,
  serverURL: process.env.PAYLOAD_PUBLIC_SERVER_URL || process.env.NEXT_PUBLIC_PAYLOAD_URL || 'http://localhost:3000',
  collections: [Pages, PageTypes, Posts, Users, Tenants, Media],
  localization: {
    locales: ['el', 'en'],
    defaultLocale: 'el',
  },
  // db: mongooseAdapter({
  //   url: process.env.DATABASE_URI as string,
  // }),
  db: postgresAdapter({
    pool: {
      connectionString: process.env.POSTGRES_URL,
    },
  }),
  onInit: async (args) => {
    if (process.env.SEED_DB) {
      await seed(args)
    }
  },
  editor: lexicalEditor({}),
  graphQL: {
    schemaOutputFile: path.resolve(dirname, 'generated-schema.graphql'),
  },
  secret: process.env.PAYLOAD_SECRET as string,
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  plugins: [
    // S3 Storage plugin for Supabase Storage
    s3Storage({
      collections: {
        media: {
          prefix: 'media', // Files will be stored in media/ folder
        },
      },
      bucket: process.env.S3_BUCKET_NAME || 'payload-media',
      config: {
        forcePathStyle: true, // Required for Supabase S3-compatible API
        credentials: {
          accessKeyId: process.env.S3_ACCESS_KEY_ID as string,
          secretAccessKey: process.env.S3_SECRET_ACCESS_KEY as string,
        },
        region: process.env.S3_REGION || 'us-east-1',
        // Supabase S3 endpoint: use full S3 API endpoint
        endpoint: process.env.S3_ENDPOINT?.includes('/storage/v1/s3')
          ? process.env.S3_ENDPOINT
          : `${process.env.S3_ENDPOINT}/storage/v1/s3`,
      },
    }),
    multiTenantPlugin<Config>({
      collections: {
        pages: {},
        posts: {},
        media: {},
      },
      tenantField: {
        access: {
          read: () => true,
          update: ({ req }) => {
            if (isSuperAdmin(req.user)) {
              return true
            }
            return getUserTenantIDs(req.user).length > 0
          },
        },
      },
      tenantsArrayField: {
        includeDefaultField: false,
      },
      userHasAccessToAllTenants: (user) => isSuperAdmin(user),
    }),
  ],
})
