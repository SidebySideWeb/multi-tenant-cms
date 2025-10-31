import type { CollectionConfig } from 'payload'

import { ensureUniqueSlug } from './hooks/ensureUniqueSlug'
import { superAdminOrTenantAdminAccess } from '@/collections/Pages/access/superAdminOrTenantAdmin'

export const Pages: CollectionConfig = {
  slug: 'pages',
  access: {
    create: superAdminOrTenantAdminAccess,
    delete: superAdminOrTenantAdminAccess,
    read: () => true,
    update: superAdminOrTenantAdminAccess,
  },
  admin: {
    useAsTitle: 'title',
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      name: 'slug',
      type: 'text',
      defaultValue: 'home',
      hooks: {
        beforeValidate: [ensureUniqueSlug],
      },
      index: true,
      required: true,
    },
    {
      name: 'pageType',
      type: 'select',
      options: [
        { label: 'Standard Page', value: 'standard' },
        { label: 'Landing Page', value: 'landing' },
        { label: 'Blog Post', value: 'blog' },
        { label: 'Custom', value: 'custom' },
      ],
      defaultValue: 'standard',
      admin: {
        description: 'Page type determines which fields are available',
        position: 'sidebar',
      },
    },
    {
      name: 'description',
      type: 'textarea',
      admin: {
        description: 'Meta description for SEO',
      },
    },
    {
      name: 'content',
      type: 'richText',
      admin: {
        description: 'Main page content (used for standard pages and blog posts)',
      },
    },
    {
      name: 'featuredImage',
      type: 'upload',
      relationTo: 'media',
      admin: {
        description: 'Featured image for the page',
      },
    },
    {
      name: 'meta',
      type: 'group',
      fields: [
        {
          name: 'title',
          type: 'text',
          admin: {
            description: 'Custom meta title (defaults to page title)',
          },
        },
        {
          name: 'description',
          type: 'textarea',
          admin: {
            description: 'Custom meta description',
          },
        },
        {
          name: 'ogImage',
          type: 'upload',
          relationTo: 'media',
          admin: {
            description: 'Open Graph image for social sharing',
          },
        },
      ],
    },
    {
      name: 'publishedAt',
      type: 'date',
      admin: {
        description: 'Publication date',
        date: {
          pickerAppearance: 'dayAndTime',
        },
      },
    },
    // ============================================
    // Landing Page Sections (conditional - only for landing pages)
    // ============================================
    {
      name: 'sections',
      type: 'group',
      admin: {
        description: 'Page sections for landing pages (only shown when pageType is "landing")',
        condition: (data) => data.pageType === 'landing',
      },
      fields: [
        // Header Section
        {
          name: 'header',
          type: 'group',
          admin: {
            description: 'Header/Navigation configuration',
          },
          fields: [
            {
              name: 'logo_text',
              type: 'text',
              defaultValue: 'ftiaxesite.gr',
            },
            {
              name: 'menu',
              type: 'array',
              admin: {
                description: 'Navigation menu items. Use anchor links like "features", "process", or "contact" for sections on the same page, or full URLs like "/about" for other pages.',
              },
              fields: [
                {
                  name: 'label',
                  type: 'text',
                  required: true,
                  admin: {
                    description: 'Menu item label (e.g., "Λειτουργίες", "Διαδικασία")',
                  },
                },
                {
                  name: 'link',
                  type: 'text',
                  required: true,
                  admin: {
                    description: 'Anchor link (e.g., "features", "process", "contact") or page URL (e.g., "/about"). Anchor links scroll to sections on the same page.',
                    placeholder: 'features',
                  },
                },
              ],
            },
            {
              name: 'cta',
              type: 'group',
              admin: {
                description: 'Call-to-action button in header',
              },
              fields: [
                {
                  name: 'label',
                  type: 'text',
                  admin: {
                    description: 'Button label (e.g., "Φτιάξε το site σου")',
                  },
                },
                {
                  name: 'link',
                  type: 'text',
                  admin: {
                    description: 'Anchor link (e.g., "contact") or page URL. Anchor links scroll to sections on the same page.',
                    placeholder: 'contact',
                  },
                },
              ],
            },
          ],
        },
        // Hero Section
        {
          name: 'hero',
          type: 'group',
          admin: {
            description: 'Hero section at the top of the page',
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
                description: 'Hero subtitle with rich text formatting (bold, italic, links)',
              },
            },
            {
              name: 'cta',
              type: 'text',
              defaultValue: 'Ξεκίνα τώρα',
            },
            {
              name: 'image',
              type: 'upload',
              relationTo: 'media',
              admin: {
                description: 'Hero image/illustration',
              },
            },
            {
              name: 'stats',
              type: 'array',
              admin: {
                description: 'Statistics displayed below CTA',
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
        // Features Section
        {
          name: 'features',
          type: 'group',
          admin: {
            description: 'Features/benefits section',
          },
          fields: [
            {
              name: 'title',
              type: 'text',
            },
            {
              name: 'subtitle',
              type: 'richText',
              admin: {
                description: 'Section subtitle with rich text formatting',
              },
            },
            {
              name: 'items',
              type: 'array',
              admin: {
                description: 'Feature items',
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
                  defaultValue: 'zap',
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
                  admin: {
                    description: 'Feature description with rich text formatting',
                  },
                },
              ],
            },
          ],
        },
        // Process Section
        {
          name: 'process',
          type: 'group',
          admin: {
            description: 'Process/steps section',
          },
          fields: [
            {
              name: 'title',
              type: 'text',
            },
            {
              name: 'subtitle',
              type: 'richText',
              admin: {
                description: 'Section subtitle with rich text formatting',
              },
            },
            {
              name: 'steps',
              type: 'array',
              admin: {
                description: 'Process steps',
              },
              fields: [
                {
                  name: 'number',
                  type: 'text',
                  defaultValue: '01',
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
                  admin: {
                    description: 'Step description with rich text formatting',
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
        // Contact Section
        {
          name: 'contact',
          type: 'group',
          admin: {
            description: 'Contact form section',
          },
          fields: [
            {
              name: 'title',
              type: 'text',
            },
            {
              name: 'subtitle',
              type: 'richText',
              admin: {
                description: 'Section subtitle with rich text formatting',
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
        // Footer Section
        {
          name: 'footer',
          type: 'group',
          admin: {
            description: 'Footer configuration',
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
                  defaultValue: 'Επικοινωνία',
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
                  defaultValue: 'Χρήσιμα',
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
  ],
}
