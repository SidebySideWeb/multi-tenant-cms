import type { CollectionConfig } from 'payload'

import { isSuperAdminAccess } from '@/access/isSuperAdmin'
import { updateAndDeleteAccess } from './access/updateAndDelete'

export const Tenants: CollectionConfig = {
  slug: 'tenants',
  access: {
    create: isSuperAdminAccess,
    delete: updateAndDeleteAccess,
    read: ({ req }) => Boolean(req.user),
    update: updateAndDeleteAccess,
  },
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'slug', 'domain'],
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      index: true,
      unique: true,
      admin: {
        description: 'Used for URLs and identifying the tenant across the system',
      },
    },
    {
      name: 'domain',
      type: 'text',
      admin: {
        description: 'Optional domain used to map requests to this tenant (e.g. www.example.com)',
      },
    },
    {
      name: 'defaultLocale',
      type: 'select',
      defaultValue: 'el',
      options: [
        { label: 'Greek', value: 'el' },
        { label: 'English', value: 'en' },
      ],
      admin: {
        description: 'Primary locale for this tenant',
      },
    },
    {
      name: 'theme',
      type: 'json',
      admin: {
        description: 'Optional JSON blob storing tenant specific theme settings (colours, fonts, etc.)',
      },
    },
    {
      name: 'settings',
      type: 'json',
      admin: {
        description: 'Arbitrary tenant level configuration (header/footer references, integrations, etc.)',
      },
    },
  ],
}
