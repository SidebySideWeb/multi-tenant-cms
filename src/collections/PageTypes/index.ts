import type { CollectionConfig, FilterOptionsProps, Where } from 'payload'

import { extractID } from '@/utilities/extractID'
import { getUserTenantIDs } from '@/utilities/getUserTenantIDs'
import { isSuperAdmin } from '@/access/isSuperAdmin'
import { superAdminOrTenantAdminAccess } from '@/collections/Pages/access/superAdminOrTenantAdmin'

export const PageTypes: CollectionConfig = {
  slug: 'page-types',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'slug', 'tenant'],
    description: 'Page templates are unique per tenant and define the form schema for associated pages.',
  },
  access: {
    create: superAdminOrTenantAdminAccess,
    delete: superAdminOrTenantAdminAccess,
    read: ({ req }) => {
      if (!req.user) {
        return false
      }

      if (isSuperAdmin(req.user)) {
        return true
      }

      const tenantIDs = getUserTenantIDs(req.user)
      if (tenantIDs.length === 0) {
        return false
      }

      return {
        tenant: {
          in: tenantIDs,
        },
      }
    },
    update: superAdminOrTenantAdminAccess,
  },
  timestamps: true,
  fields: [
    {
      name: 'tenant',
      type: 'relationship',
      relationTo: 'tenants',
      required: true,
      admin: {
        position: 'sidebar',
        description: 'Tenant that owns this page type',
      },
      filterOptions: ({ user }: FilterOptionsProps<any>) => {
        if (!user) {
          return true
        }

        if (isSuperAdmin(user as any)) {
          return true
        }

        const tenantIDs = getUserTenantIDs(user as any, 'tenant-admin')
        if (tenantIDs.length > 0) {
          return {
            id: {
              in: tenantIDs,
            },
          } as Where
        }

        return false
      },
    },
    {
      name: 'name',
      type: 'text',
      required: true,
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      admin: {
        description: 'Unique per tenant (e.g. landing-ftiaxesite, about-ftiaxesite).',
      },
    },
    {
      name: 'description',
      type: 'textarea',
    },
    {
      name: 'fields',
      type: 'json',
      admin: {
        description:
          'JSON schema describing the editable fields for this page type (e.g. sections, blocks, components).',
      },
    },
    {
      name: 'isDefault',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        description: 'If true, new pages for this tenant default to this page type.',
        position: 'sidebar',
      },
    },
  ],
  hooks: {
    beforeValidate: [
      async ({ data, originalDoc, operation, req }) => {
        const tenantId = extractID(data?.tenant ?? originalDoc?.tenant)
        const slug = data?.slug ?? originalDoc?.slug

        if (!tenantId || !slug) {
          return
        }

        const where: Where = {
          and: [
            {
              tenant: {
                equals: tenantId,
              },
            },
            {
              slug: {
                equals: slug,
              },
            },
          ],
        }

        if (operation === 'update' && originalDoc?.id) {
          where.and.push({
            id: {
              not_equals: originalDoc.id,
            },
          })
        }

        const existing = await req.payload.find({
          collection: 'page-types',
          where,
          depth: 0,
          limit: 1,
        })

        if (existing.docs.length > 0) {
          throw new Error(`Page type slug "${slug}" already exists for this tenant`)
        }
      },
    ],
  },
}
