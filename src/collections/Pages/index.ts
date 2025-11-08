import type { CollectionConfig, FieldHook, FilterOptionsProps, Where } from 'payload'

import { assignTenantOnCreate } from './hooks/assignTenantOnCreate'
import { ensurePageTypeMatchesTenant } from './hooks/ensurePageTypeMatchesTenant'
import { ensureUniqueSlug } from './hooks/ensureUniqueSlug'
import { slugifyInput } from './hooks/slugifyInput'
import { superAdminOrTenantAdminAccess } from './access/superAdminOrTenantAdmin'
import { tenantScopedReadAccess } from './access/tenantScopedReadAccess'
import { extractID } from '@/utilities/extractID'
import { getUserTenantIDs } from '@/utilities/getUserTenantIDs'
import { isSuperAdmin } from '@/access/isSuperAdmin'

const inferTenantFromData = ({ data }: { data?: any }): string | number | null => {
  if (!data) {
    return null
  }

  const tenantField = data.tenant ?? data?.tenant?.id

  if (!tenantField) {
    return null
  }

  return extractID(tenantField)
}

export const Pages: CollectionConfig = {
  slug: 'pages',
  access: {
    create: superAdminOrTenantAdminAccess,
    delete: superAdminOrTenantAdminAccess,
    read: tenantScopedReadAccess,
    update: superAdminOrTenantAdminAccess,
  },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'slug', 'pageType', 'tenant'],
    description:
      'Pages are scoped per tenant. Each page is linked to a tenant-specific page type and stores its editable content as JSON data.',
  },
  hooks: {
    beforeValidate: [assignTenantOnCreate, ensurePageTypeMatchesTenant],
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
      hooks: {
        beforeValidate: [slugifyInput as FieldHook, ensureUniqueSlug],
      },
      admin: {
        description: 'Unique per tenant. Used in the page URL. Example: home, about, header-footer-ftiaxesite.',
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
      name: 'pageType',
      type: 'relationship',
      relationTo: 'page-types',
      required: true,
      admin: {
        position: 'sidebar',
        description: 'Page template that defines the editable fields and layout for this tenant.',
      },
      filterOptions: ({ data, user }: FilterOptionsProps<any>) => {
        const tenantId = inferTenantFromData({ data })

        if (tenantId) {
          return {
            tenant: {
              equals: tenantId,
            },
          } as Where
        }

        if (user && isSuperAdmin(user as any)) {
          return true
        }

        if (user) {
          const tenantIDs = getUserTenantIDs(user as any)
          if (tenantIDs.length === 1) {
            return {
              tenant: {
                equals: tenantIDs[0],
              },
            } as Where
          }

          if (tenantIDs.length > 1) {
            return {
              tenant: {
                in: tenantIDs,
              },
            } as Where
          }
        }

        return true
      },
    },
    {
      name: 'summary',
      type: 'textarea',
      admin: {
        description: 'Optional internal summary describing the purpose of this page.',
      },
    },
    {
      name: 'headerFooterPageSlug',
      type: 'text',
      defaultValue: 'header-footer-ftiaxesite',
      admin: {
        description: 'Slug of the shared header/footer page used by this homepage.',
        condition: (data) => typeof data?.slug === 'string' && data.slug === 'ftiaxesite-homepage',
        placeholder: 'header-footer-ftiaxesite',
      },
      hooks: {
        beforeValidate: [
          ({ value, siblingData }) =>
            value ??
            siblingData?.content?.shared?.headerFooterPageSlug ??
            'header-footer-ftiaxesite',
        ],
        afterRead: [
          ({ value, siblingData }) =>
            value ??
            siblingData?.content?.shared?.headerFooterPageSlug ??
            'header-footer-ftiaxesite',
        ],
      },
    },
    {
      name: 'sections',
      type: 'group',
      admin: {
        description: 'Διαχειριστείτε τα περιεχόμενα των ενοτήτων της σελίδας.',
        condition: (data) => {
          const slug = data?.slug
          if (typeof slug === 'string' && slug === 'ftiaxesite-homepage') {
            return true
          }
          return false
        },
      },
      hooks: {
        beforeValidate: [
          ({ value, siblingData }) => {
            if (value && typeof value === 'object' && Object.keys(value).length > 0) {
              return value
            }
            const sections = siblingData?.content?.sections
            if (sections && typeof sections === 'object') {
              return sections
            }
            return value
          },
        ],
        afterRead: [
          ({ value, siblingData }) => {
            if (value && typeof value === 'object' && Object.keys(value).length > 0) {
              return value
            }
            const sections = siblingData?.content?.sections
            if (sections && typeof sections === 'object') {
              return sections
            }
            return value
          },
        ],
      },
      fields: [
        {
          name: 'hero',
          type: 'group',
          admin: {
            description: 'Hero section στην αρχή της σελίδας.',
          },
          fields: [
            {
              name: 'headline',
              type: 'text',
              required: true,
            },
            {
              name: 'subheadline',
              type: 'richText',
              admin: {
                description: 'Υπότιτλος hero με πολλαπλές γραμμές.',
              },
            },
            {
              name: 'cta',
              type: 'text',
              admin: {
                placeholder: 'Ξεκίνα τώρα',
              },
            },
            {
              name: 'image',
              type: 'upload',
              relationTo: 'media',
              admin: {
                description: 'Εικόνα hero.',
              },
            },
            {
              name: 'stats',
              type: 'array',
              admin: {
                description: 'Στατιστικά κάτω από το CTA.',
              },
              fields: [
                {
                  name: 'value',
                  type: 'text',
                  required: true,
                },
                {
                  name: 'label',
                  type: 'text',
                  required: true,
                },
              ],
            },
          ],
        },
        {
          name: 'features',
          type: 'group',
          admin: {
            description: 'Ενότητα λειτουργιών / πλεονεκτημάτων.',
          },
          fields: [
            {
              name: 'title',
              type: 'text',
            },
            {
              name: 'subtitle',
              type: 'textarea',
            },
            {
              name: 'items',
              type: 'array',
              admin: {
                description: 'Λίστα λειτουργιών.',
              },
              fields: [
                {
                  name: 'icon',
                  type: 'select',
                  options: [
                    { label: 'Clock', value: 'clock' },
                    { label: 'Euro', value: 'euro' },
                    { label: 'Trending Up', value: 'trendingUp' },
                    { label: 'Shield', value: 'shield' },
                    { label: 'Smartphone', value: 'smartphone' },
                    { label: 'Zap', value: 'zap' },
                  ],
                  defaultValue: 'clock',
                },
                {
                  name: 'title',
                  type: 'text',
                  required: true,
                },
                {
                  name: 'description',
                  type: 'textarea',
                  required: true,
                },
              ],
            },
          ],
        },
        {
          name: 'process',
          type: 'group',
          admin: {
            description: 'Ενότητα βημάτων διαδικασίας.',
          },
          fields: [
            {
              name: 'title',
              type: 'text',
            },
            {
              name: 'subtitle',
              type: 'textarea',
            },
            {
              name: 'steps',
              type: 'array',
              admin: {
                description: 'Βήματα διαδικασίας.',
              },
              fields: [
                {
                  name: 'number',
                  type: 'text',
                  admin: {
                    placeholder: '01',
                  },
                },
                {
                  name: 'icon',
                  type: 'select',
                  options: [
                    { label: 'File Text', value: 'fileText' },
                    { label: 'Wand', value: 'wand2' },
                    { label: 'Check Circle', value: 'checkCircle2' },
                  ],
                  defaultValue: 'fileText',
                },
                {
                  name: 'title',
                  type: 'text',
                  required: true,
                },
                {
                  name: 'description',
                  type: 'textarea',
                  required: true,
                },
                {
                  name: 'color',
                  type: 'select',
                  options: [
                    { label: 'Teal', value: 'teal' },
                    { label: 'Navy', value: 'navy' },
                  ],
                  defaultValue: 'teal',
                },
              ],
            },
          ],
        },
        {
          name: 'contact',
          type: 'group',
          admin: {
            description: 'Ενότητα φόρμας επικοινωνίας.',
          },
          fields: [
            {
              name: 'title',
              type: 'text',
            },
            {
              name: 'subtitle',
              type: 'textarea',
            },
            {
              name: 'form',
              type: 'group',
              fields: [
                {
                  name: 'name',
                  type: 'text',
                  defaultValue: 'Όνομα',
                },
                {
                  name: 'email',
                  type: 'text',
                  defaultValue: 'Email',
                },
                {
                  name: 'phone',
                  type: 'text',
                  defaultValue: 'Τηλέφωνο',
                },
                {
                  name: 'voicePrompt',
                  type: 'text',
                  defaultValue: 'Πάτησε το μικρόφωνο και πες μας για το project σου',
                },
                {
                  name: 'voiceListening',
                  type: 'text',
                  defaultValue: 'Σε ακούω... Μίλα τώρα!',
                },
                {
                  name: 'voiceTranscript',
                  type: 'text',
                  defaultValue: 'Αυτό που είπες:',
                },
                {
                  name: 'submit',
                  type: 'text',
                  defaultValue: 'Αποστολή',
                },
              ],
            },
          ],
        },
      ],
    },
    {
      name: 'sharedLayout',
      type: 'group',
      admin: {
        description: 'Κοινό header/footer για όλες τις σελίδες του tenant.',
        condition: (data) => {
          const slug = data?.slug
          if (typeof slug === 'string' && slug === 'header-footer-ftiaxesite') {
            return true
          }
          return false
        },
      },
      hooks: {
        beforeValidate: [
          ({ value, siblingData }) => {
            if (value && typeof value === 'object' && Object.keys(value).length > 0) {
              return value
            }
            const layout = siblingData?.content?.shared?.layout ?? siblingData?.content
            if (layout && typeof layout === 'object') {
              return layout
            }
            return value
          },
        ],
        afterRead: [
          ({ value, siblingData }) => {
            if (value && typeof value === 'object' && Object.keys(value).length > 0) {
              return value
            }
            const layout = siblingData?.content?.shared?.layout ?? siblingData?.content
            if (layout && typeof layout === 'object') {
              return layout
            }
            return value
          },
        ],
      },
      fields: [
        {
          name: 'header',
          type: 'group',
          admin: {
            description: 'Ρυθμίσεις κεφαλίδας.',
          },
          fields: [
            {
              name: 'logo_text',
              type: 'text',
              admin: {
                description: 'Κείμενο λογοτύπου.',
              },
              defaultValue: 'ftiaxesite.gr',
            },
            {
              name: 'menu',
              type: 'array',
              admin: {
                description: 'Μενού πλοήγησης.',
              },
              fields: [
                {
                  name: 'label',
                  type: 'text',
                  required: true,
                },
                {
                  name: 'link',
                  type: 'text',
                  required: true,
                },
              ],
            },
            {
              name: 'cta',
              type: 'group',
              fields: [
                {
                  name: 'label',
                  type: 'text',
                },
                {
                  name: 'link',
                  type: 'text',
                },
              ],
            },
          ],
        },
        {
          name: 'footer',
          type: 'group',
          admin: {
            description: 'Ρυθμίσεις υποσέλιδου.',
          },
          fields: [
            {
              name: 'brand',
              type: 'group',
              fields: [
                {
                  name: 'name',
                  type: 'text',
                },
                {
                  name: 'tagline',
                  type: 'text',
                },
              ],
            },
            {
              name: 'contact',
              type: 'group',
              fields: [
                {
                  name: 'title',
                  type: 'text',
                },
                {
                  name: 'email',
                  type: 'email',
                },
                {
                  name: 'phone',
                  type: 'text',
                },
              ],
            },
            {
              name: 'links',
              type: 'group',
              fields: [
                {
                  name: 'title',
                  type: 'text',
                },
                {
                  name: 'items',
                  type: 'array',
                  fields: [
                    {
                      name: 'label',
                      type: 'text',
                      required: true,
                    },
                    {
                      name: 'href',
                      type: 'text',
                      required: true,
                    },
                  ],
                },
              ],
            },
            {
              name: 'copyright',
              type: 'text',
            },
          ],
        },
      ],
    },
    {
      name: 'content',
      type: 'json',
      admin: {
        hidden: true,
        readOnly: true,
      },
      hooks: {
        beforeValidate: [
          ({ siblingData }) => {
            const slug = siblingData?.slug

            if (slug === 'header-footer-ftiaxesite') {
              return siblingData?.sharedLayout ?? siblingData?.content ?? {}
            }

            const sections = siblingData?.sections ?? siblingData?.content?.sections ?? {}
            const headerFooterSlug =
              siblingData?.headerFooterPageSlug ??
              siblingData?.content?.shared?.headerFooterPageSlug ??
              'header-footer-ftiaxesite'

            const sharedLayout = siblingData?.sharedLayout ?? siblingData?.content?.shared?.layout ?? {}

            const result: Record<string, any> = {
              sections,
              shared: {
                headerFooterPageSlug: headerFooterSlug,
              },
            }

            if (Object.keys(sharedLayout).length > 0) {
              result.shared.layout = sharedLayout
            }

            return result
          },
        ],
      },
    },
    {
      name: 'seo',
      type: 'group',
      admin: {
        description: 'Search engine metadata for this page.',
      },
      fields: [
        {
          name: 'title',
          type: 'text',
          admin: {
            description: 'Overrides the default meta title (defaults to page title).',
          },
        },
        {
          name: 'description',
          type: 'textarea',
        },
        {
          name: 'image',
          type: 'upload',
          relationTo: 'media',
        },
      ],
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
  ],
}
