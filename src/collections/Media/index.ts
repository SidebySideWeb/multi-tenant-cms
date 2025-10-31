import type { CollectionConfig } from 'payload'

import { superAdminOrTenantAdminAccess } from '@/collections/Pages/access/superAdminOrTenantAdmin'

export const Media: CollectionConfig = {
  slug: 'media',
  access: {
    create: superAdminOrTenantAdminAccess,
    delete: superAdminOrTenantAdminAccess,
    read: () => true, // Public read for frontend access
    update: superAdminOrTenantAdminAccess,
  },
  upload: true,
  fields: [
    {
      name: 'alt',
      type: 'text',
      admin: {
        description: 'Alternative text for accessibility',
      },
    },
  ],
  admin: {
    useAsTitle: 'filename',
  },
}

