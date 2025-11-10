import type { CollectionConfig, FieldHook } from 'payload'

import { buildDefaultEditorState } from '@payloadcms/richtext-lexical'

import { assignTenantOnCreate } from '../Pages/hooks/assignTenantOnCreate'
import { slugifyInput } from '../Pages/hooks/slugifyInput'
import { ensureUniqueSlug } from './hooks/ensureUniqueSlug'
import { superAdminOrTenantAdminAccess } from '../Pages/access/superAdminOrTenantAdmin'
import { tenantScopedReadAccess } from '../Pages/access/tenantScopedReadAccess'

const ensureLexicalState: FieldHook = ({ value }) => {
  if (value && typeof value === 'object' && 'root' in (value as Record<string, unknown>)) {
    return value
  }

  if (typeof value === 'string') {
    return buildDefaultEditorState({ text: value })
  }

  return buildDefaultEditorState({ text: '' })
}

export const Posts: CollectionConfig = {
  slug: 'posts',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'slug', 'status', 'publishedAt', 'tenant'],
    description: 'Blog posts scoped per tenant.',
  },
  access: {
    create: superAdminOrTenantAdminAccess,
    delete: superAdminOrTenantAdminAccess,
    read: tenantScopedReadAccess,
    update: superAdminOrTenantAdminAccess,
  },
  hooks: {
    beforeValidate: [assignTenantOnCreate],
  },
  timestamps: true,
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: false,
      index: true,
      admin: {
        description: 'Unique per tenant. Used in the post URL.',
      },
      hooks: {
        beforeValidate: [slugifyInput, ensureUniqueSlug],
      },
    },
    {
      name: 'status',
      type: 'select',
      options: [
        { label: 'Draft', value: 'draft' },
        { label: 'Published', value: 'published' },
      ],
      defaultValue: 'draft',
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'excerpt',
      type: 'richText',
      admin: {
        description: 'Short summary for listing views.',
      },
      hooks: {
        beforeValidate: [ensureLexicalState],
        afterRead: [ensureLexicalState],
      },
    },
    {
      name: 'heroImage',
      type: 'text',
      admin: {
        description: 'Full URL to the hero image.',
      },
    },
    {
      name: 'authorName',
      type: 'text',
      admin: {
        description: 'Name displayed as the author.',
      },
    },
    {
      name: 'publishedAt',
      type: 'date',
      admin: {
        position: 'sidebar',
        date: {
          pickerAppearance: 'dayAndTime',
        },
      },
    },
    {
      name: 'content',
      type: 'richText',
      required: true,
      admin: {
        description: 'Full article content.',
      },
      hooks: {
        beforeValidate: [ensureLexicalState],
        afterRead: [ensureLexicalState],
      },
    },
    {
      name: 'tags',
      type: 'array',
      admin: {
        description: 'Optional tags for grouping posts.',
      },
      fields: [
        {
          name: 'value',
          type: 'text',
        },
      ],
    },
  ],
}

