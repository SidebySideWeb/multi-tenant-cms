import type { CollectionConfig } from 'payload'

import { isSuperAdminAccess } from '@/access/isSuperAdmin'
import { updateAndDeleteAccess } from './access/updateAndDelete'
import { populateTenantPages } from '@/utilities/populateTenantPages'

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
  },
  hooks: {
    afterChange: [
      async ({ doc, operation, req }) => {
        // Only populate pages when a new tenant is created (not on updates)
        if (operation === 'create' && doc.id) {
          try {
            const templateName = doc.template || 'ftiaxesite'
            await populateTenantPages(
              req.payload,
              doc.id,
              templateName,
              doc.name,
              doc.slug,
            )
            req.payload.logger.info(
              `✅ Pages populated for tenant: ${doc.name} (ID: ${doc.id}, Template: ${templateName})`,
            )
          } catch (error) {
            req.payload.logger.error(
              `❌ Failed to populate pages for tenant ${doc.name}: ${error instanceof Error ? error.message : String(error)}`,
            )
            // Don't throw - allow tenant creation to succeed even if page population fails
          }
        }
      },
    ],
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
    },
    {
      name: 'domain',
      type: 'text',
      admin: {
        description: 'Used for domain-based tenant handling',
      },
    },
    {
      name: 'slug',
      type: 'text',
      admin: {
        description: 'Used for url paths, example: /tenant-slug/page-slug',
      },
      index: true,
      required: true,
    },
    {
      name: 'allowPublicRead',
      type: 'checkbox',
      admin: {
        description:
          'If checked, logging in is not required to read. Useful for building public pages.',
        position: 'sidebar',
      },
      defaultValue: false,
      index: true,
    },
    {
      name: 'template',
      type: 'select',
      required: true,
      defaultValue: 'ftiaxesite',
      options: [
        {
          label: 'ftiaxesite (Landing Page Template)',
          value: 'ftiaxesite',
        },
        // Add more templates as you convert V0.app templates
        // {
        //   label: 'V0 Template 1',
        //   value: 'v0-template-1',
        // },
      ],
      admin: {
        description:
          'Template determines the page structure and which pages are created automatically',
        position: 'sidebar',
      },
    },
  ],
}
