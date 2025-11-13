import type {
  CollectionAfterReadHook,
  CollectionConfig,
  FieldHook,
  FilterOptionsProps,
  Where,
} from 'payload'

import { assignTenantOnCreate } from './hooks/assignTenantOnCreate'
import { ensurePageTypeMatchesTenant } from './hooks/ensurePageTypeMatchesTenant'
import { ensureUniqueSlug } from './hooks/ensureUniqueSlug'
import { slugifyInput } from './hooks/slugifyInput'
import { superAdminOrTenantAdminAccess } from './access/superAdminOrTenantAdmin'
import { tenantScopedReadAccess } from './access/tenantScopedReadAccess'
import { extractID } from '@/utilities/extractID'
import { getUserTenantIDs } from '@/utilities/getUserTenantIDs'
import { isSuperAdmin } from '@/access/isSuperAdmin'
import { buildDefaultEditorState } from '@payloadcms/richtext-lexical'

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

const isLexicalState = (value: unknown): value is { root: Record<string, unknown> } =>
  typeof value === 'object' && value !== null && 'root' in (value as Record<string, unknown>)

const createEmptyParagraph = () => ({
  type: 'paragraph',
  format: '',
  indent: 0,
  direction: 'ltr',
  version: 1,
  children: [],
})

const ensureNonEmptyLexical = (state: any) => {
  if (!state || typeof state !== 'object') {
    return {
      root: {
        type: 'root',
        format: '',
        indent: 0,
        direction: 'ltr',
        version: 1,
        children: [createEmptyParagraph()],
      },
    }
  }

  const root = state.root && typeof state.root === 'object' ? state.root : {}
  const children = Array.isArray((root as any).children) ? (root as any).children : []

  return {
    ...state,
    root: {
      type: 'root',
      format: '',
      indent: 0,
      direction: 'ltr',
      version: 1,
      ...(root as Record<string, unknown>),
      children: children.length > 0 ? children : [createEmptyParagraph()],
    },
  }
}

const ensureLexicalState = (value: unknown) => {
  if (isLexicalState(value)) {
    return ensureNonEmptyLexical(value)
  }

  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value)
      if (isLexicalState(parsed)) {
        return ensureNonEmptyLexical(parsed)
      }
    } catch (error) {
      // ignore parse error and fall back to default state
    }
  }

  const text = typeof value === 'string' ? value : ''
  return ensureNonEmptyLexical(buildDefaultEditorState({ text }))
}

const normalizeFeatureItems = (items: unknown) => {
  if (!Array.isArray(items)) return items

  return items.map((item) => {
    if (!item || typeof item !== 'object') return item
    const entry = item as Record<string, unknown>
    return {
      ...entry,
      description: ensureLexicalState(entry.description),
    }
  })
}

const normalizeProcessSteps = (steps: unknown) => {
  if (!Array.isArray(steps)) return steps

  return steps.map((step) => {
    if (!step || typeof step !== 'object') return step
    const entry = step as Record<string, unknown>
    return {
      ...entry,
      description: ensureLexicalState(entry.description),
    }
  })
}

const normalizeParagraphEntries = (paragraphs: unknown) => {
  if (!Array.isArray(paragraphs)) return paragraphs

  return paragraphs
    .map((entry) => {
      if (!entry) return entry
      if (typeof entry === 'string') {
        return {
          content: ensureLexicalState(entry),
        }
      }
      if (typeof entry === 'object') {
        const record = entry as Record<string, unknown>
        const content =
          record.content ?? record.text ?? record.value ?? (Array.isArray(record.children) ? record : '')
        return {
          ...record,
          content: ensureLexicalState(content),
        }
      }

      return entry
    })
    .filter((entry) => entry !== null && entry !== undefined)
}

const normalizeRichTextFieldOnItems = (items: unknown, fieldName: string) => {
  if (!Array.isArray(items)) return items

  return items.map((item) => {
    if (!item || typeof item !== 'object') return item
    const record = item as Record<string, unknown>
    const fieldValue = record[fieldName]
    return {
      ...record,
      [fieldName]: ensureLexicalState(fieldValue),
    }
  })
}

const normalizeSections = (sections: unknown) => {
  if (!sections || typeof sections !== 'object') return sections

  const input = sections as Record<string, any>
  const result: Record<string, any> = { ...input }

  if (input.hero && typeof input.hero === 'object') {
    result.hero = {
      ...input.hero,
      subheadline: ensureLexicalState(input.hero.subheadline),
    }
  }

  if (input.features && typeof input.features === 'object') {
    const features = input.features as Record<string, any>
    result.features = {
      ...features,
      subtitle: ensureLexicalState(features.subtitle),
      items: normalizeFeatureItems(features.items),
    }
  }

  if (input.welcome && typeof input.welcome === 'object') {
    const welcome = input.welcome as Record<string, any>
    result.welcome = {
      ...welcome,
      paragraphs: normalizeParagraphEntries(welcome.paragraphs),
    }
  }

  if (input.process && typeof input.process === 'object') {
    const process = input.process as Record<string, any>
    result.process = {
      ...process,
      subtitle: ensureLexicalState(process.subtitle),
      steps: normalizeProcessSteps(process.steps),
    }
  }

  if (input.programs && typeof input.programs === 'object') {
    const programs = input.programs as Record<string, any>
    result.programs = {
      ...programs,
      subtitle: ensureLexicalState(programs.subtitle),
      items: normalizeRichTextFieldOnItems(programs.items, 'description'),
    }
  }

  if (input.gallery && typeof input.gallery === 'object') {
    const gallery = input.gallery as Record<string, any>
    result.gallery = {
      ...gallery,
      subtitle: ensureLexicalState(gallery.subtitle),
      items: normalizeRichTextFieldOnItems(gallery.items, 'caption'),
    }
  }

  if (input.news && typeof input.news === 'object') {
    const news = input.news as Record<string, any>
    result.news = {
      ...news,
      subtitle: ensureLexicalState(news.subtitle),
      items: normalizeRichTextFieldOnItems(news.items, 'summary'),
    }
  }

  if (input.contact && typeof input.contact === 'object') {
    const contact = input.contact as Record<string, any>
    result.contact = {
      ...contact,
      subtitle: ensureLexicalState(contact.subtitle),
    }
  }

  if (input.cta && typeof input.cta === 'object') {
    const cta = input.cta as Record<string, any>
    result.cta = {
      ...cta,
      subtitle: ensureLexicalState(cta.subtitle),
    }
  }

  if (input.ctaBanner && typeof input.ctaBanner === 'object') {
    const ctaBanner = input.ctaBanner as Record<string, any>
    result.ctaBanner = {
      ...ctaBanner,
      subtitle: ensureLexicalState(ctaBanner.subtitle),
    }
  }

  return result
}

const getManualSections = (slug: unknown, siblingData: any) => {
  if (typeof slug !== 'string') return undefined

  if (slug === 'ftiaxesite-homepage') {
    return siblingData?.ftiaxesiteSections
  }

  if (slug === 'kallitechnia-homepage') {
    return siblingData?.kallitechniaSections
  }

  if (slug.startsWith('kallitechnia-') && slug !== 'header-footer-kallitechnia') {
    return siblingData?.kallitechniaContentSections
  }

  return undefined
}

const getManualSharedLayout = (slug: unknown, siblingData: any) => {
  if (typeof slug !== 'string') return undefined

  if (slug === 'header-footer-ftiaxesite') {
    return siblingData?.ftiaxesiteSharedLayout
  }

  if (slug === 'header-footer-kallitechnia') {
    return siblingData?.kallitechniaSharedLayout
  }

  return undefined
}

const getDefaultHeaderFooterSlug = (slug?: string | null) => {
  if (!slug) {
    return 'header-footer-ftiaxesite'
  }
  if (slug === 'kallitechnia-homepage' || slug.startsWith('kallitechnia-')) {
    return 'header-footer-kallitechnia'
  }
  return 'header-footer-ftiaxesite'
}

const isKallitechniaSlug = (slug: unknown) =>
  typeof slug === 'string' && (slug === 'kallitechnia-homepage' || slug.startsWith('kallitechnia-'))

/**
 * Removes tenant.slug from where clause since Payload doesn't support it
 * Access control already filters by tenant ID based on X-Tenant-Slug header
 */
const enforceTenantFilter = async ({ req, where }: { req: any; where?: Where }): Promise<Where | undefined> => {
  // Only apply for public requests (frontend queries)
  if (req.user) {
    return where
  }

  const whereObj = where as Where | undefined
  
  if (!whereObj || typeof whereObj !== 'object') {
    return where
  }

  // Remove tenant.slug and tenant.domain from where clause
  // Access control already filters by tenant ID
  const newWhere: any = { ...whereObj }
  
  let hasInvalidTenantFilter = false
  
  // Remove tenant.slug if present
  if ('tenant.slug' in newWhere) {
    delete newWhere['tenant.slug']
    hasInvalidTenantFilter = true
  }
  
  // Remove tenant.domain if present
  if ('tenant.domain' in newWhere) {
    delete newWhere['tenant.domain']
    hasInvalidTenantFilter = true
  }

  // Also check in 'and' array if present
  if ('and' in newWhere && Array.isArray(newWhere.and)) {
    newWhere.and = newWhere.and.filter((condition: any) => {
      if (condition?.['tenant.slug'] || condition?.['tenant.domain']) {
        hasInvalidTenantFilter = true
        return false
      }
      return true
    })
  }

  if (hasInvalidTenantFilter) {
    console.warn('[enforceTenantFilter] Removed tenant.slug/tenant.domain from where clause - use X-Tenant-Slug header instead')
  }

  return newWhere as Where
}

const stripFtiaxesiteFieldsForKallitechnia: CollectionAfterReadHook = ({ doc }) => {
  if (!doc || typeof doc !== 'object') {
    return doc
  }

  const record = doc as Record<string, any>
  const slug = record.slug

  const tenantSlug =
    typeof record.tenant === 'object' && record.tenant !== null
      ? (record.tenant as Record<string, any>).slug
      : undefined

  if (isKallitechniaSlug(slug) || tenantSlug === 'kallitechnia') {
    if ('ftiaxesiteSections' in record) {
      delete record.ftiaxesiteSections
    }
    if ('ftiaxesiteSharedLayout' in record) {
      delete record.ftiaxesiteSharedLayout
    }
  }

  return record
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
    beforeFind: [enforceTenantFilter],
    beforeValidate: [assignTenantOnCreate, ensurePageTypeMatchesTenant],
    afterRead: [stripFtiaxesiteFieldsForKallitechnia],
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
      type: 'richText',
      admin: {
        description: 'Optional internal summary describing the purpose of this page.',
      },
      hooks: {
        beforeValidate: [({ value }) => ensureLexicalState(value)],
        afterRead: [({ value }) => ensureLexicalState(value)],
      },
    },
    {
      name: 'headerFooterPageSlug',
      type: 'text',
      defaultValue: 'header-footer-ftiaxesite',
      admin: {
        description: 'Slug of the shared header/footer page used by this homepage.',
        condition: (data) => {
          const slug = data?.slug
          return typeof slug === 'string' && (slug === 'ftiaxesite-homepage' || slug === 'kallitechnia-homepage')
        },
        placeholder: 'header-footer-ftiaxesite',
      },
      hooks: {
        beforeValidate: [
          ({ value, siblingData }) =>
            value ??
            siblingData?.content?.shared?.headerFooterPageSlug ??
            getDefaultHeaderFooterSlug(siblingData?.slug),
        ],
        afterRead: [
          ({ value, siblingData }) =>
            value ??
            siblingData?.content?.shared?.headerFooterPageSlug ??
            getDefaultHeaderFooterSlug(siblingData?.slug),
        ],
      },
    },
    {
      name: 'ftiaxesiteSections',
      type: 'group',
      admin: {
        description: 'Διαχειριστείτε τα περιεχόμενα των ενοτήτων της σελίδας (ftiaxesite).',
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
            const slug = siblingData?.slug
            if (slug !== 'ftiaxesite-homepage') {
              return normalizeSections(value)
            }
            if (value && typeof value === 'object' && Object.keys(value).length > 0) {
              return normalizeSections(value)
            }
            const sections = siblingData?.content?.sections
            if (sections && typeof sections === 'object') {
              return normalizeSections(sections)
            }
            return normalizeSections(value)
          },
        ],
        afterRead: [
          ({ value, siblingData }) => {
            const slug = siblingData?.slug
            if (slug !== 'ftiaxesite-homepage') {
              return normalizeSections(value)
            }
            if (value && typeof value === 'object' && Object.keys(value).length > 0) {
              return normalizeSections(value)
            }
            const sections = siblingData?.content?.sections
            if (sections && typeof sections === 'object') {
              return normalizeSections(sections)
            }
            return normalizeSections(value)
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
              type: 'richText',
              hooks: {
                beforeValidate: [({ value }) => ensureLexicalState(value)],
                afterRead: [({ value }) => ensureLexicalState(value)],
              },
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
                  type: 'richText',
                  required: true,
                  hooks: {
                    beforeValidate: [({ value }) => ensureLexicalState(value)],
                    afterRead: [({ value }) => ensureLexicalState(value)],
                  },
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
              type: 'richText',
              hooks: {
                beforeValidate: [({ value }) => ensureLexicalState(value)],
                afterRead: [({ value }) => ensureLexicalState(value)],
              },
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
                  type: 'richText',
                  required: true,
                  hooks: {
                    beforeValidate: [({ value }) => ensureLexicalState(value)],
                    afterRead: [({ value }) => ensureLexicalState(value)],
                  },
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
              type: 'richText',
              hooks: {
                beforeValidate: [({ value }) => ensureLexicalState(value)],
                afterRead: [({ value }) => ensureLexicalState(value)],
              },
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
      name: 'kallitechniaSections',
      type: 'group',
      admin: {
        description: 'Διαχειριστείτε τα περιεχόμενα της αρχικής σελίδας (Kallitechnia).',
        condition: (data) => typeof data?.slug === 'string' && data.slug === 'kallitechnia-homepage',
      },
      hooks: {
        beforeValidate: [
          ({ value, siblingData }) => {
            const slug = siblingData?.slug
            if (slug !== 'kallitechnia-homepage') {
              return normalizeSections(value)
            }
            if (value && typeof value === 'object' && Object.keys(value).length > 0) {
              return normalizeSections(value)
            }
            const sections = siblingData?.content?.sections
            if (sections && typeof sections === 'object') {
              return normalizeSections(sections)
            }
            return normalizeSections(value)
          },
        ],
        afterRead: [
          ({ value, siblingData }) => {
            const slug = siblingData?.slug
            if (slug !== 'kallitechnia-homepage') {
              return normalizeSections(value)
            }
            if (value && typeof value === 'object' && Object.keys(value).length > 0) {
              return normalizeSections(value)
            }
            const sections = siblingData?.content?.sections
            if (sections && typeof sections === 'object') {
              return normalizeSections(sections)
            }
            return normalizeSections(value)
          },
        ],
      },
      fields: [
        {
          name: 'hero',
          type: 'group',
          admin: {
            description: 'Hero section της αρχικής σελίδας.',
          },
          fields: [
            { name: 'headline', type: 'text' },
            {
              name: 'subheadline',
              type: 'richText',
              hooks: {
                beforeValidate: [({ value }) => ensureLexicalState(value)],
                afterRead: [({ value }) => ensureLexicalState(value)],
              },
            },
            { name: 'ctaLabel', type: 'text', admin: { placeholder: 'Δες τα Τμήματά μας' } },
            { name: 'ctaHref', type: 'text', admin: { placeholder: '/programs' } },
            {
              name: 'backgroundImage',
              type: 'upload',
              relationTo: 'media',
              admin: {
                description: 'Ανεβάστε ή επιλέξτε την εικόνα φόντου του hero.',
              },
            },
          ],
        },
        {
          name: 'welcome',
          type: 'group',
          admin: {
            description: 'Ενότητα καλωσορίσματος.',
          },
          fields: [
            { name: 'title', type: 'text' },
            {
              name: 'paragraphs',
              type: 'array',
              admin: {
                description: 'Παράγραφοι κειμένου.',
              },
              fields: [
                {
                  name: 'content',
                  type: 'richText',
                  hooks: {
                    beforeValidate: [({ value }) => ensureLexicalState(value)],
                    afterRead: [({ value }) => ensureLexicalState(value)],
                  },
                },
              ],
            },
            {
              name: 'image',
              type: 'upload',
              relationTo: 'media',
              admin: {
                description: 'Ανεβάστε ή επιλέξτε εικόνα για την ενότητα καλωσορίσματος.',
              },
            },
          ],
        },
        {
          name: 'programs',
          type: 'group',
          admin: {
            description: 'Ενότητα προγραμμάτων.',
          },
          fields: [
            { name: 'title', type: 'text' },
            {
              name: 'subtitle',
              type: 'richText',
              hooks: {
                beforeValidate: [({ value }) => ensureLexicalState(value)],
                afterRead: [({ value }) => ensureLexicalState(value)],
              },
            },
            {
              name: 'items',
              type: 'array',
              fields: [
                { name: 'title', type: 'text' },
                {
                  name: 'description',
                  type: 'richText',
                  hooks: {
                    beforeValidate: [({ value }) => ensureLexicalState(value)],
                    afterRead: [({ value }) => ensureLexicalState(value)],
                  },
                },
                {
                  name: 'image',
                  type: 'upload',
                  relationTo: 'media',
                  admin: {
                    description: 'Ανεβάστε ή επιλέξτε εικόνα για την κάρτα προγράμματος.',
                  },
                },
                { name: 'linkLabel', type: 'text', admin: { placeholder: 'Μάθετε Περισσότερα' } },
                { name: 'linkHref', type: 'text', admin: { placeholder: '/programs#anchor' } },
                { name: 'anchor', type: 'text', admin: { description: 'Anchor ID για το πρόγραμμα.' } },
              ],
            },
          ],
        },
        {
          name: 'gallery',
          type: 'group',
          admin: {
            description: 'Συλλογή φωτογραφιών.',
          },
          fields: [
            { name: 'title', type: 'text' },
            {
              name: 'subtitle',
              type: 'richText',
              hooks: {
                beforeValidate: [({ value }) => ensureLexicalState(value)],
                afterRead: [({ value }) => ensureLexicalState(value)],
              },
            },
            {
              name: 'items',
              type: 'array',
              fields: [
                { name: 'title', type: 'text' },
                {
                  name: 'caption',
                  type: 'richText',
                  hooks: {
                    beforeValidate: [({ value }) => ensureLexicalState(value)],
                    afterRead: [({ value }) => ensureLexicalState(value)],
                  },
                },
                {
                  name: 'image',
                  type: 'upload',
                  relationTo: 'media',
                  admin: {
                    description: 'Ανεβάστε ή επιλέξτε εικόνα για τη συλλογή.',
                  },
                },
              ],
            },
          ],
        },
        {
          name: 'news',
          type: 'group',
          admin: {
            description: 'Ενότητα ειδήσεων.',
          },
          fields: [
            { name: 'title', type: 'text' },
            {
              name: 'subtitle',
              type: 'richText',
              hooks: {
                beforeValidate: [({ value }) => ensureLexicalState(value)],
                afterRead: [({ value }) => ensureLexicalState(value)],
              },
            },
            {
              name: 'items',
              type: 'array',
              fields: [
                { name: 'title', type: 'text' },
                {
                  name: 'summary',
                  type: 'richText',
                  hooks: {
                    beforeValidate: [({ value }) => ensureLexicalState(value)],
                    afterRead: [({ value }) => ensureLexicalState(value)],
                  },
                },
                { name: 'date', type: 'text' },
                { name: 'href', type: 'text', admin: { description: 'URL άρθρου.' } },
                {
                  name: 'image',
                  type: 'upload',
                  relationTo: 'media',
                  admin: {
                    description: 'Ανεβάστε ή επιλέξτε εικόνα για το νέο.',
                  },
                },
              ],
            },
          ],
        },
        {
          name: 'sponsors',
          type: 'group',
          admin: {
            description: 'Υποστηρικτές.',
          },
          fields: [
            { name: 'title', type: 'text' },
            {
              name: 'subtitle',
              type: 'richText',
              hooks: {
                beforeValidate: [({ value }) => ensureLexicalState(value)],
                afterRead: [({ value }) => ensureLexicalState(value)],
              },
            },
            {
              name: 'items',
              type: 'array',
              fields: [{ name: 'name', type: 'text' }],
            },
          ],
        },
        {
          name: 'cta',
          type: 'group',
          admin: {
            description: 'Ενότητα Call To Action.',
          },
          fields: [
            { name: 'title', type: 'text' },
            {
              name: 'subtitle',
              type: 'richText',
              hooks: {
                beforeValidate: [({ value }) => ensureLexicalState(value)],
                afterRead: [({ value }) => ensureLexicalState(value)],
              },
            },
            { name: 'buttonLabel', type: 'text' },
            { name: 'buttonHref', type: 'text' },
          ],
        },
      ],
    },
    {
      name: 'ftiaxesiteSharedLayout',
      type: 'group',
      admin: {
        description: 'Κοινό header/footer layout για το ftiaxesite.',
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
            const slug = siblingData?.slug
            if (slug !== 'header-footer-ftiaxesite') {
              return value
            }
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
            const slug = siblingData?.slug
            if (slug !== 'header-footer-ftiaxesite') {
              return value
            }
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
      name: 'kallitechniaSharedLayout',
      type: 'group',
      admin: {
        description: 'Κοινό header/footer layout για την Kallitechnia.',
        condition: (data) => typeof data?.slug === 'string' && data.slug === 'header-footer-kallitechnia',
      },
      hooks: {
        beforeValidate: [
          ({ value, siblingData }) => {
            const slug = siblingData?.slug
            if (slug !== 'header-footer-kallitechnia') {
              return value
            }
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
            const slug = siblingData?.slug
            if (slug !== 'header-footer-kallitechnia') {
              return value
            }
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
          admin: { description: 'Ρυθμίσεις κεφαλίδας.' },
          fields: [
            { name: 'logo_text', type: 'text' },
            {
              name: 'logo_image',
              type: 'upload',
              relationTo: 'media',
              admin: {
                description: 'Ανεβάστε ή επιλέξτε το λογότυπο.',
              },
            },
            {
              name: 'menu',
              type: 'array',
              fields: [
                { name: 'label', type: 'text', required: true },
                { name: 'link', type: 'text', required: true },
              ],
            },
            {
              name: 'cta',
              type: 'group',
              fields: [
                { name: 'label', type: 'text' },
                { name: 'link', type: 'text' },
              ],
            },
          ],
        },
        {
          name: 'footer',
          type: 'group',
          admin: { description: 'Ρυθμίσεις υποσέλιδου.' },
          fields: [
            {
              name: 'brand',
              type: 'group',
              fields: [
                { name: 'name', type: 'text' },
                { name: 'tagline', type: 'text' },
                { name: 'description', type: 'text' },
                {
                  name: 'logo_image',
                  type: 'upload',
                  relationTo: 'media',
                  admin: {
                    description: 'Ανεβάστε ή επιλέξτε το λογότυπο.',
                  },
                },
              ],
            },
            {
              name: 'contact',
              type: 'group',
              fields: [
                { name: 'title', type: 'text' },
                { name: 'address', type: 'text' },
                { name: 'phone', type: 'text' },
                { name: 'email', type: 'email' },
              ],
            },
            {
              name: 'links',
              type: 'group',
              fields: [
                { name: 'title', type: 'text' },
                {
                  name: 'items',
                  type: 'array',
                  fields: [
                    { name: 'label', type: 'text', required: true },
                    { name: 'href', type: 'text', required: true },
                  ],
                },
              ],
            },
            {
              name: 'socials',
              type: 'array',
              fields: [
                { name: 'label', type: 'text', required: true },
                { name: 'icon', type: 'text' },
                { name: 'href', type: 'text', required: true },
              ],
            },
            {
              name: 'externalLinks',
              type: 'array',
              fields: [
                { name: 'label', type: 'text', required: true },
                { name: 'href', type: 'text', required: true },
              ],
            },
            {
              name: 'legalLinks',
              type: 'array',
              fields: [
                { name: 'label', type: 'text', required: true },
                { name: 'href', type: 'text', required: true },
              ],
            },
            { name: 'copyright', type: 'text' },
          ],
        },
      ],
    },
    {
      name: 'kallitechniaContentSections',
      type: 'json',
      admin: {
        description: 'Επεξεργασία ενοτήτων περιεχομένου για σελίδες της Kallitechnia βάσει του page type.',
        condition: (data) => {
          const slug = data?.slug
          return (
            typeof slug === 'string' &&
            slug.startsWith('kallitechnia-') &&
            slug !== 'kallitechnia-homepage' &&
            slug !== 'header-footer-kallitechnia'
          )
        },
        components: {
          Field: '@/admin/components/PageContentField#default' as unknown as never,
        },
      },
      hooks: {
        beforeValidate: [
          ({ value, siblingData }) => {
            if (value && typeof value === 'object' && Object.keys(value).length > 0) {
              return normalizeSections(value)
            }
            const sections = siblingData?.content?.sections
            if (sections && typeof sections === 'object') {
              return normalizeSections(sections)
            }
            return normalizeSections(value)
          },
        ],
        afterRead: [
          ({ value, siblingData }) => {
            if (value && typeof value === 'object' && Object.keys(value).length > 0) {
              return normalizeSections(value)
            }
            const sections = siblingData?.content?.sections
            if (sections && typeof sections === 'object') {
              return normalizeSections(sections)
            }
            return normalizeSections(value)
          },
        ],
      },
    },
    {
      name: 'content',
      type: 'json',
      admin: {
        description:
          'Το περιεχόμενο της σελίδας. Τα διαθέσιμα πεδία εξαρτώνται από το επιλεγμένο Page Type του tenant.',
        components: {
          Field: '@/admin/components/PageContentField#default' as unknown as never,
        },
      },
      hooks: {
        beforeValidate: [
          ({ siblingData }) => {
            const slug = siblingData?.slug

            if (slug === 'header-footer-ftiaxesite') {
              return siblingData?.ftiaxesiteSharedLayout ?? siblingData?.content ?? {}
            }

            if (slug === 'header-footer-kallitechnia') {
              return siblingData?.kallitechniaSharedLayout ?? siblingData?.content ?? {}
            }

            const sections = normalizeSections(
              getManualSections(slug, siblingData) ?? siblingData?.content?.sections ?? {},
            )
            const headerFooterSlug =
              siblingData?.headerFooterPageSlug ??
              siblingData?.content?.shared?.headerFooterPageSlug ??
              getDefaultHeaderFooterSlug(siblingData?.slug)

            const sharedLayout =
              getManualSharedLayout(slug, siblingData) ?? siblingData?.content?.shared?.layout ?? {}

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
          type: 'richText',
          hooks: {
            beforeValidate: [({ value }) => ensureLexicalState(value)],
            afterRead: [({ value }) => ensureLexicalState(value)],
          },
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
