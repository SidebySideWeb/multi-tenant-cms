import 'dotenv/config'
import path from 'path'
import { fileURLToPath } from 'url'
import payload from 'payload'
import { buildDefaultEditorState } from '@payloadcms/richtext-lexical'

import config from '../src/payload.config'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const lexical = (text: string) => buildDefaultEditorState({ text })

const toRichTextArray = (paragraphs: string[]) => paragraphs.map((content) => ({ content: lexical(content) }))

const ensureTenant = async () => {
const tenantSlug = 'kallitechnia'

  const existing = await payload.find({
    collection: 'tenants',
    where: {
      slug: {
        equals: tenantSlug,
      },
    },
    depth: 0,
    limit: 1,
    overrideAccess: true,
  })

  if (existing.docs.length > 0) {
    const tenant = existing.docs[0]
    await payload.update({
      collection: 'tenants',
      id: tenant.id,
      data: {
        name: 'Καλλιτεχνία',
        slug: tenantSlug,
        domain: 'kallitechnia.gr',
        defaultLocale: 'el',
      },
      overrideAccess: true,
    })
    return Number(tenant.id)
  }

  const created = await payload.create({
    collection: 'tenants',
    data: {
      name: 'Καλλιτεχνία',
      slug: tenantSlug,
      domain: 'kallitechnia.gr',
      defaultLocale: 'el',
    },
    overrideAccess: true,
  })

  return Number(created.id)
}

const upsertPageType = async (
  tenantId: string | number,
  data: { slug: string; name: string; description?: string; fields?: Record<string, unknown>; isDefault?: boolean },
) => {
  const tenantDoc = await payload.findByID({
    collection: 'tenants',
    id: tenantId,
    depth: 0,
    overrideAccess: true,
  })

  const tenantRef = tenantDoc.id

  const existing = await payload.find({
    collection: 'page-types',
    where: {
      and: [
        {
          slug: {
            equals: data.slug,
          },
        },
        {
          tenant: {
            equals: tenantRef,
          },
        },
      ],
    },
    depth: 0,
    limit: 1,
    overrideAccess: true,
  })

  if (existing.docs.length > 0) {
    const updated = await payload.update({
      collection: 'page-types',
      id: existing.docs[0].id,
      data: {
        tenant: tenantRef,
        name: data.name,
        slug: data.slug,
        description: data.description,
        fields: data.fields,
        isDefault: data.isDefault ?? existing.docs[0].isDefault,
      },
      overrideAccess: true,
    })

    return updated.id
  }

  const created = await payload.create({
    collection: 'page-types',
    data: {
      tenant: tenantRef,
      name: data.name,
      slug: data.slug,
      description: data.description,
      fields: data.fields,
      isDefault: data.isDefault ?? false,
    },
    overrideAccess: true,
  })

  return created.id
}

const upsertPage = async (
  tenantId: string | number,
  pageTypeId: string | number,
  pageData: {
    slug: string
    title: string
    status?: 'draft' | 'published'
    summary?: unknown
    content: Record<string, unknown>
    seo?: Record<string, unknown>
  },
) => {
  const tenantDoc = await payload.findByID({
    collection: 'tenants',
    id: tenantId,
    depth: 0,
    overrideAccess: true,
  })
  const tenantRef = tenantDoc.id

  const pageTypeDoc = await payload.findByID({
    collection: 'page-types',
    id: pageTypeId,
    depth: 0,
    overrideAccess: true,
  })
  const pageTypeRef = pageTypeDoc.id

  const existing = await payload.find({
    collection: 'pages',
    where: {
      and: [
        {
          slug: {
            equals: pageData.slug,
          },
        },
        {
          tenant: {
            equals: tenantRef,
          },
        },
      ],
    },
    depth: 0,
    limit: 1,
    overrideAccess: true,
  })

  const data = {
    tenant: tenantRef,
    title: pageData.title,
    slug: pageData.slug,
    pageType: pageTypeRef,
    status: pageData.status ?? 'published',
    summary: pageData.summary,
    content: pageData.content,
    seo: pageData.seo,
    publishedAt: new Date().toISOString(),
  }

  if (existing.docs.length > 0) {
    await payload.update({
      collection: 'pages',
      id: existing.docs[0].id,
      data,
      overrideAccess: true,
    })

    return existing.docs[0].id
  }

  const created = await payload.create({
    collection: 'pages',
    data,
    overrideAccess: true,
  })

  return created.id
}

const upsertPost = async (
  tenantId: string | number,
  postData: {
    slug: string
    title: string
    status?: 'draft' | 'published'
    excerpt?: unknown
    content: unknown
    heroImage?: string
    authorName?: string
    publishedAt?: string
    tags?: Array<string | { value: string }>
  },
) => {
  const tenantDoc = await payload.findByID({
    collection: 'tenants',
    id: tenantId,
    depth: 0,
    overrideAccess: true,
  })
  const tenantRef = tenantDoc.id

  const existing = await payload.find({
    collection: 'posts',
    where: {
      and: [
        {
          slug: {
            equals: postData.slug,
          },
        },
        {
          tenant: {
            equals: tenantRef,
          },
        },
      ],
    },
    depth: 0,
    limit: 1,
    overrideAccess: true,
  })

  const tags =
    Array.isArray(postData.tags) && postData.tags.length > 0
      ? postData.tags.map((tag) => (typeof tag === 'string' ? { value: tag } : tag))
      : undefined

  const data = {
    tenant: tenantRef,
    title: postData.title,
    slug: postData.slug,
    status: postData.status ?? 'published',
    excerpt: postData.excerpt,
    content: postData.content,
    heroImage: postData.heroImage,
    authorName: postData.authorName,
    publishedAt: postData.publishedAt ?? new Date().toISOString(),
    tags,
  }

  if (existing.docs.length > 0) {
    await payload.update({
      collection: 'posts',
      id: existing.docs[0].id,
      data,
      overrideAccess: true,
    })

    return existing.docs[0].id
  }

  const created = await payload.create({
    collection: 'posts',
    data,
    overrideAccess: true,
  })

  return created.id
}

const getKalitechniaSeedData = () => {
  const headerFooterSchema = {
    groups: [
      {
        key: 'header',
        label: 'Header',
        fields: [
          { name: 'logo_text', label: 'Logo Text', type: 'text', required: true },
          { name: 'logo_image', label: 'Logo Image URL', type: 'text' },
          {
            name: 'menu',
            label: 'Menu Items',
            type: 'array',
            minRows: 1,
            fields: [
              { name: 'label', label: 'Label', type: 'text', required: true },
              { name: 'link', label: 'Link / Path', type: 'text', required: true },
            ],
          },
          {
            name: 'cta',
            label: 'Call to Action',
            type: 'group',
            fields: [
              { name: 'label', label: 'Button Label', type: 'text' },
              { name: 'link', label: 'URL', type: 'text' },
            ],
          },
        ],
      },
      {
        key: 'footer',
        label: 'Footer',
        fields: [
          {
            name: 'brand',
            label: 'Brand',
            type: 'group',
            fields: [
              { name: 'name', label: 'Name', type: 'text', required: true },
              { name: 'tagline', label: 'Tagline', type: 'text' },
              { name: 'description', label: 'Description', type: 'textarea' },
              { name: 'logo_image', label: 'Logo Image URL', type: 'text' },
            ],
          },
          {
            name: 'contact',
            label: 'Contact Details',
            type: 'group',
            fields: [
              { name: 'title', label: 'Section Title', type: 'text' },
              { name: 'address', label: 'Address', type: 'text' },
              { name: 'phone', label: 'Phone', type: 'text' },
              { name: 'email', label: 'Email', type: 'text' },
            ],
          },
          {
            name: 'links',
            label: 'Quick Links',
            type: 'group',
            fields: [
              { name: 'title', label: 'Section Title', type: 'text' },
              {
                name: 'items',
                label: 'Links',
                type: 'array',
                minRows: 1,
                fields: [
                  { name: 'label', label: 'Label', type: 'text', required: true },
                  { name: 'href', label: 'URL', type: 'text', required: true },
                ],
              },
            ],
          },
          {
            name: 'socials',
            label: 'Social Links',
            type: 'array',
            fields: [
              { name: 'label', label: 'Label', type: 'text', required: true },
              { name: 'icon', label: 'Icon', type: 'text' },
              { name: 'href', label: 'URL', type: 'text', required: true },
            ],
          },
          {
            name: 'externalLinks',
            label: 'External Mentions',
            type: 'array',
            fields: [
              { name: 'label', label: 'Label', type: 'text', required: true },
              { name: 'href', label: 'URL', type: 'text', required: true },
            ],
          },
          {
            name: 'legalLinks',
            label: 'Legal Links',
            type: 'array',
            fields: [
              { name: 'label', label: 'Label', type: 'text', required: true },
              { name: 'href', label: 'URL', type: 'text', required: true },
            ],
          },
          { name: 'copyright', label: 'Copyright', type: 'text' },
        ],
      },
    ],
  }

  const homepageSchema = {
    groups: [
      {
        key: 'shared',
        label: 'Shared Settings',
        fields: [
          { name: 'headerFooterPageSlug', label: 'Header/Footer Page Slug', type: 'text', required: true },
        ],
      },
      {
        key: 'hero',
        label: 'Hero Section',
        fields: [
          { name: 'headline', label: 'Headline', type: 'text', required: true },
          { name: 'subheadline', label: 'Subheadline', type: 'richText' },
          { name: 'ctaLabel', label: 'CTA Label', type: 'text' },
          { name: 'ctaHref', label: 'CTA Link', type: 'text' },
          { name: 'backgroundImage', label: 'Background Image URL', type: 'text' },
        ],
      },
      {
        key: 'welcome',
        label: 'Welcome Section',
        fields: [
          { name: 'title', label: 'Title', type: 'text', required: true },
          {
            name: 'paragraphs',
            label: 'Paragraphs',
            type: 'array',
            minRows: 1,
            fields: [{ name: 'content', label: 'Paragraph', type: 'richText' }],
          },
          { name: 'image', label: 'Image URL', type: 'text' },
        ],
      },
      {
        key: 'programs',
        label: 'Programs Section',
        fields: [
          { name: 'title', label: 'Title', type: 'text', required: true },
          { name: 'subtitle', label: 'Subtitle', type: 'richText' },
          {
            name: 'items',
            label: 'Program Cards',
            type: 'array',
            minRows: 1,
            fields: [
              { name: 'title', label: 'Title', type: 'text', required: true },
              { name: 'description', label: 'Description', type: 'richText' },
              { name: 'image', label: 'Image URL', type: 'text' },
              { name: 'linkLabel', label: 'Button Label', type: 'text' },
              { name: 'linkHref', label: 'Button Link', type: 'text' },
              { name: 'anchor', label: 'Anchor ID', type: 'text' },
            ],
          },
        ],
      },
      {
        key: 'gallery',
        label: 'Gallery Section',
        fields: [
          { name: 'title', label: 'Title', type: 'text', required: true },
          { name: 'subtitle', label: 'Subtitle', type: 'richText' },
          {
            name: 'items',
            label: 'Gallery Items',
            type: 'array',
            minRows: 1,
            fields: [
              { name: 'title', label: 'Title', type: 'text', required: true },
              { name: 'caption', label: 'Caption', type: 'richText' },
              { name: 'image', label: 'Image URL', type: 'text', required: true },
            ],
          },
        ],
      },
      {
        key: 'news',
        label: 'News Section',
        fields: [
          { name: 'title', label: 'Title', type: 'text', required: true },
          { name: 'subtitle', label: 'Subtitle', type: 'richText' },
          {
            name: 'items',
            label: 'News Cards',
            type: 'array',
            minRows: 1,
            fields: [
              { name: 'title', label: 'Title', type: 'text', required: true },
              { name: 'summary', label: 'Summary', type: 'richText' },
              { name: 'date', label: 'Date', type: 'text' },
              { name: 'href', label: 'Link URL', type: 'text' },
              { name: 'image', label: 'Image URL', type: 'text' },
            ],
          },
        ],
      },
      {
        key: 'sponsors',
        label: 'Sponsors Section',
        fields: [
          { name: 'title', label: 'Title', type: 'text', required: true },
          { name: 'subtitle', label: 'Subtitle', type: 'richText' },
          {
            name: 'items',
            label: 'Sponsor Names',
            type: 'array',
            minRows: 1,
            fields: [{ name: 'name', label: 'Name', type: 'text', required: true }],
          },
        ],
      },
      {
        key: 'cta',
        label: 'CTA Banner',
        fields: [
          { name: 'title', label: 'Title', type: 'text', required: true },
          { name: 'subtitle', label: 'Subtitle', type: 'richText' },
          { name: 'buttonLabel', label: 'Button Label', type: 'text' },
          { name: 'buttonHref', label: 'Button Link', type: 'text' },
        ],
      },
    ],
  }

  const aboutSchema = {
    groups: [
      {
        key: 'hero',
        label: 'Hero',
        fields: [{ name: 'title', label: 'Title', type: 'text', required: true }],
      },
      {
        key: 'intro',
        label: 'Intro Paragraphs',
        fields: [
          {
            name: 'paragraphs',
            label: 'Paragraphs',
            type: 'array',
            minRows: 1,
            fields: [{ name: 'content', label: 'Paragraph', type: 'richText' }],
          },
        ],
      },
      {
        key: 'quote',
        label: 'Quote',
        fields: [{ name: 'text', label: 'Quote Text', type: 'richText' }],
      },
      {
        key: 'motto',
        label: 'Motto',
        fields: [
          { name: 'title', label: 'Title', type: 'text' },
          {
            name: 'lines',
            label: 'Lines',
            type: 'array',
            minRows: 1,
            fields: [{ name: 'content', label: 'Line', type: 'richText' }],
          },
        ],
      },
      {
        key: 'art',
        label: 'Art Section',
        fields: [
          { name: 'title', label: 'Title', type: 'text', required: true },
          { name: 'subtitle', label: 'Subtitle', type: 'richText' },
          {
            name: 'paragraphs',
            label: 'Paragraphs',
            type: 'array',
            minRows: 1,
            fields: [{ name: 'content', label: 'Paragraph', type: 'richText' }],
          },
        ],
      },
      {
        key: 'storySections',
        label: 'Story Sections',
        fields: [
          {
            name: 'items',
            label: 'Sections',
            type: 'array',
            minRows: 1,
            fields: [
              { name: 'title', label: 'Title', type: 'text', required: true },
              {
                name: 'paragraphs',
                label: 'Paragraphs',
                type: 'array',
                fields: [{ name: 'content', label: 'Paragraph', type: 'richText' }],
              },
              { name: 'image', label: 'Image URL', type: 'text' },
              {
                name: 'imagePosition',
                label: 'Image Position',
                type: 'select',
                options: [
                  { label: 'Left', value: 'left' },
                  { label: 'Right', value: 'right' },
                ],
              },
            ],
          },
        ],
      },
      {
        key: 'spaces',
        label: 'Spaces',
        fields: [
          { name: 'title', label: 'Title', type: 'text' },
          {
            name: 'items',
            label: 'Space Cards',
            type: 'array',
            minRows: 1,
            fields: [
              { name: 'title', label: 'Title', type: 'text', required: true },
              { name: 'image', label: 'Image URL', type: 'text' },
            ],
          },
        ],
      },
    ],
  }

  const programsSchema = {
    groups: [
      {
        key: 'hero',
        label: 'Hero',
        fields: [
          { name: 'title', label: 'Title', type: 'text', required: true },
          { name: 'subtitle', label: 'Subtitle', type: 'richText' },
        ],
      },
      {
        key: 'programs',
        label: 'Programs',
        fields: [
          {
            name: 'items',
            label: 'Program Sections',
            type: 'array',
            minRows: 1,
            fields: [
              { name: 'title', label: 'Title', type: 'text', required: true },
              { name: 'description', label: 'Description', type: 'richText' },
              { name: 'image', label: 'Image URL', type: 'text' },
              {
                name: 'imagePosition',
                label: 'Image Position',
                type: 'select',
                options: [
                  { label: 'Left', value: 'left' },
                  { label: 'Right', value: 'right' },
                ],
              },
              {
                name: 'additionalInfo',
                label: 'Additional Info',
                type: 'richText',
              },
              {
                name: 'schedule',
                label: 'Schedule Rows',
                type: 'array',
                minRows: 1,
                fields: [
                  { name: 'day', label: 'Day', type: 'text', required: true },
                  { name: 'time', label: 'Time', type: 'text', required: true },
                  { name: 'level', label: 'Level', type: 'text' },
                ],
              },
              {
                name: 'coach',
                label: 'Coach',
                type: 'group',
                fields: [
                  { name: 'name', label: 'Name', type: 'text', required: true },
                  { name: 'photo', label: 'Photo URL', type: 'text' },
                  { name: 'studies', label: 'Studies', type: 'text' },
                  { name: 'bio', label: 'Biography', type: 'richText' },
                ],
              },
            ],
          },
        ],
      },
    ],
  }

  const contactSchema = {
    groups: [
      {
        key: 'hero',
        label: 'Hero',
        fields: [
          { name: 'title', label: 'Title', type: 'text', required: true },
          { name: 'subtitle', label: 'Subtitle', type: 'richText' },
        ],
      },
      {
        key: 'form',
        label: 'Contact Form',
        fields: [
          { name: 'title', label: 'Title', type: 'text', required: true },
          { name: 'description', label: 'Description', type: 'richText' },
          { name: 'submitLabel', label: 'Submit Label', type: 'text' },
          {
            name: 'fields',
            label: 'Form Fields',
            type: 'array',
            minRows: 1,
            fields: [
              { name: 'id', label: 'Field ID', type: 'text', required: true },
              { name: 'label', label: 'Label', type: 'text', required: true },
              {
                name: 'type',
                label: 'Type',
                type: 'select',
                options: [
                  { label: 'Text', value: 'text' },
                  { label: 'Email', value: 'email' },
                  { label: 'Telephone', value: 'tel' },
                  { label: 'Textarea', value: 'textarea' },
                ],
              },
              { name: 'placeholder', label: 'Placeholder', type: 'text' },
              { name: 'required', label: 'Required', type: 'checkbox' },
            ],
          },
        ],
      },
      {
        key: 'infoCards',
        label: 'Info Cards',
        fields: [
          {
            name: 'items',
            label: 'Cards',
            type: 'array',
            minRows: 1,
            fields: [
              { name: 'icon', label: 'Icon', type: 'text' },
              { name: 'title', label: 'Title', type: 'text', required: true },
              {
                name: 'lines',
                label: 'Lines',
                type: 'array',
                minRows: 1,
                fields: [{ name: 'content', label: 'Line', type: 'richText' }],
              },
            ],
          },
        ],
      },
      {
        key: 'map',
        label: 'Map',
        fields: [
          { name: 'title', label: 'Title', type: 'text', required: true },
          { name: 'embedUrl', label: 'Embed URL', type: 'text' },
        ],
      },
    ],
  }

  const registrationSchema = {
    groups: [
      {
        key: 'hero',
        label: 'Hero',
        fields: [
          { name: 'title', label: 'Title', type: 'text', required: true },
          { name: 'subtitle', label: 'Subtitle', type: 'richText' },
        ],
      },
      {
        key: 'welcome',
        label: 'Welcome',
        fields: [
          { name: 'headline', label: 'Headline', type: 'text' },
          { name: 'subheadline', label: 'Subheadline', type: 'richText' },
        ],
      },
      {
        key: 'documents',
        label: 'Required Documents',
        fields: [
          { name: 'title', label: 'Title', type: 'text', required: true },
          { name: 'description', label: 'Description', type: 'richText' },
          { name: 'downloadLabel', label: 'Download Label', type: 'text' },
          { name: 'downloadUrl', label: 'Download URL', type: 'text' },
          {
            name: 'requirements',
            label: 'Requirements',
            type: 'array',
            minRows: 1,
            fields: [{ name: 'content', label: 'Requirement', type: 'richText' }],
          },
        ],
      },
      {
        key: 'infoCards',
        label: 'Contact Highlights',
        fields: [
          {
            name: 'items',
            label: 'Cards',
            type: 'array',
            minRows: 1,
            fields: [
              { name: 'icon', label: 'Icon', type: 'text' },
              { name: 'title', label: 'Title', type: 'text', required: true },
              {
                name: 'lines',
                label: 'Lines',
                type: 'array',
                minRows: 1,
                fields: [{ name: 'content', label: 'Line', type: 'richText' }],
              },
            ],
          },
        ],
      },
      {
        key: 'form',
        label: 'Enrollment Form',
        fields: [
          {
            name: 'fields',
            label: 'Form Fields',
            type: 'array',
            minRows: 1,
            fields: [
              { name: 'id', label: 'Field ID', type: 'text', required: true },
              { name: 'label', label: 'Label', type: 'text', required: true },
              {
                name: 'type',
                label: 'Type',
                type: 'select',
                options: [
                  { label: 'Text', value: 'text' },
                  { label: 'Email', value: 'email' },
                  { label: 'Telephone', value: 'tel' },
                  { label: 'Textarea', value: 'textarea' },
                ],
              },
              { name: 'placeholder', label: 'Placeholder', type: 'text' },
              { name: 'required', label: 'Required', type: 'checkbox' },
            ],
          },
          { name: 'consentLabel', label: 'Consent Label', type: 'richText' },
          { name: 'ctaLabel', label: 'Submit Label', type: 'text' },
          { name: 'termsLink', label: 'Terms Link', type: 'text' },
          { name: 'privacyLink', label: 'Privacy Link', type: 'text' },
        ],
      },
      {
        key: 'cta',
        label: 'Call to Action',
        fields: [
          { name: 'title', label: 'Title', type: 'text', required: true },
          { name: 'subtitle', label: 'Subtitle', type: 'richText' },
          { name: 'buttonLabel', label: 'Button Label', type: 'text' },
          { name: 'buttonHref', label: 'Button Link', type: 'text' },
        ],
      },
    ],
  }

  const mediaSchema = {
    groups: [
      {
        key: 'hero',
        label: 'Hero',
        fields: [
          { name: 'title', label: 'Title', type: 'text', required: true },
          { name: 'subtitle', label: 'Subtitle', type: 'richText' },
        ],
      },
      {
        key: 'logos',
        label: 'Official Logos',
        fields: [
          {
            name: 'items',
            label: 'Logos',
            type: 'array',
            minRows: 1,
            fields: [
              { name: 'title', label: 'Title', type: 'text', required: true },
              { name: 'image', label: 'Image URL', type: 'text', required: true },
              {
                name: 'formats',
                label: 'Available Formats',
                type: 'array',
                fields: [{ name: 'value', label: 'Format', type: 'text' }],
              },
              { name: 'downloadUrl', label: 'Download URL', type: 'text' },
            ],
          },
        ],
      },
      {
        key: 'photos',
        label: 'Photos',
        fields: [
          {
            name: 'items',
            label: 'Photo Grid',
            type: 'array',
            minRows: 1,
            fields: [
              { name: 'title', label: 'Title', type: 'text', required: true },
              { name: 'image', label: 'Image URL', type: 'text', required: true },
            ],
          },
        ],
      },
      {
        key: 'banners',
        label: 'Banners',
        fields: [
          {
            name: 'items',
            label: 'Banner Assets',
            type: 'array',
            fields: [
              { name: 'title', label: 'Title', type: 'text', required: true },
              { name: 'image', label: 'Image URL', type: 'text', required: true },
              { name: 'downloadUrl', label: 'Download URL', type: 'text' },
            ],
          },
        ],
      },
      {
        key: 'socials',
        label: 'Social Media',
        fields: [
          {
            name: 'items',
            label: 'Profiles',
            type: 'array',
            fields: [
              { name: 'platform', label: 'Platform', type: 'text', required: true },
              { name: 'icon', label: 'Icon', type: 'text' },
              { name: 'url', label: 'URL', type: 'text', required: true },
            ],
          },
        ],
      },
    ],
  }

  const newsSchema = {
    groups: [
      {
        key: 'hero',
        label: 'Hero',
        fields: [
          { name: 'title', label: 'Title', type: 'text', required: true },
          { name: 'subtitle', label: 'Subtitle', type: 'richText' },
        ],
      },
    ],
  }

  const termsSchema = {
    groups: [
      {
        key: 'general',
        label: 'General',
        fields: [
          { name: 'heroTitle', label: 'Hero Title', type: 'text', required: true },
          { name: 'lastUpdated', label: 'Last Updated Label', type: 'text' },
          {
            name: 'sections',
            label: 'Sections',
            type: 'array',
            minRows: 1,
            fields: [
              { name: 'heading', label: 'Heading', type: 'text', required: true },
              {
                name: 'paragraphs',
                label: 'Paragraphs',
                type: 'array',
                minRows: 1,
                fields: [{ name: 'content', label: 'Paragraph', type: 'richText' }],
              },
            ],
          },
        ],
      },
    ],
  }

  const headerFooterContent = {
    header: {
      logo_text: 'kallitechnia.gr',
      logo_image: null,
      menu: [
        { label: 'Αρχική', link: '/' },
        { label: 'Ο Σύλλογος', link: '/about' },
        { label: 'Νέα', link: '/news' },
        { label: 'Πρόγραμμα', link: '/programs' },
        { label: 'Εγγραφές', link: '/registration' },
        { label: 'Επικοινωνία', link: '/contact' },
      ],
      cta: {
        label: 'Κλείσε ραντεβού',
        link: '/contact',
      },
    },
    footer: {
      brand: {
        name: 'Καλλιτεχνία',
        tagline: 'Σύλλογος Ρυθμικής & Καλλιτεχνικής Γυμναστικής',
        description:
          'Σύλλογος Γυμναστικής Καλλιτεχνίας στην Κεφαλονιά. Προάγουμε την αθλητική αριστεία και την υγιή ανάπτυξη των παιδιών.',
        logo_image: null,
      },
      contact: {
        title: 'Επικοινωνία',
        address: 'Αργοστόλι, Κεφαλονιά',
        phone: '+30 26710 00000',
        email: 'info@kallitechnia.gr',
      },
      links: {
        title: 'Γρήγοροι Σύνδεσμοι',
        items: [
          { label: 'Αρχική', href: '/' },
          { label: 'Ο Σύλλογος', href: '/about' },
          { label: 'Νέα', href: '/news' },
          { label: 'Πρόγραμμα', href: '/programs' },
          { label: 'Εγγραφές', href: '/registration' },
          { label: 'Επικοινωνία', href: '/contact' },
        ],
      },
      socials: [
        {
          label: 'Facebook',
          icon: 'facebook',
          href: 'https://www.facebook.com/share/1CrWN7pqCy/?mibextid=wwXIfr',
        },
        {
          label: 'Instagram',
          icon: 'instagram',
          href: 'https://www.instagram.com/kallitechniagymnastics?igsh=MTRodDdpdW02c3MyYg%3D%3D&utm_source=qr',
        },
        {
          label: 'YouTube',
          icon: 'youtube',
          href: 'https://youtube.com/@kallitechniagymnastics?si=sZvo_JM4gkKPu0Lp',
        },
      ],
      externalLinks: [
        {
          label: 'FIG - International Gymnastics Federation',
          href: 'https://www.gymnastics.sport/site/',
        },
        {
          label: 'ΕΓΟ - Ελληνική Γυμναστική Ομοσπονδία',
          href: 'https://www.ego-gymnastics.gr/',
        },
      ],
      legalLinks: [
        { label: 'Όροι Χρήσης', href: '/terms' },
        { label: 'Πολιτική Απορρήτου', href: '/privacy' },
      ],
      copyright: '© 2025 Καλλιτεχνία – Όλα τα δικαιώματα διατηρούνται.',
    },
  }

  const lexParagraphs = [
    lexical('Είμαι η Ελένη Δαρδαμάνη, ιδρύτρια του συλλόγου μας. Με πάθος και αφοσίωση, δημιουργήσαμε έναν χώρο όπου κάθε παιδί μπορεί να εκφραστεί, να αναπτυχθεί και να λάμψει μέσα από τη γυμναστική.'),
    lexical('Η Καλλιτεχνία δεν είναι απλώς ένας σύλλογος - είναι μια οικογένεια που υποστηρίζει κάθε αθλητή στο ταξίδι του προς την αριστεία.'),
    lexical('Ελάτε να γνωρίσετε τον κόσμο της γυμναστικής μαζί μας!'),
  ]

  const homepageSections = {
    hero: {
      headline: 'Η Γυμναστική είναι δύναμη, χαρά, δημιουργία.',
      subheadline: lexical('Ανακαλύψτε τη μαγεία της γυμναστικής στον σύλλογό μας.'),
      ctaLabel: 'Δες τα Τμήματά μας',
      ctaHref: '/programs',
      backgroundImage: null,
    },
    welcome: {
      title: 'Καλώς ήρθατε στην Καλλιτεχνία!',
      paragraphs: lexParagraphs.map((content) => ({ content })),
      image: null,
    },
    programs: {
      title: 'Τα Τμήματά μας',
      subtitle: lexical('Προσφέρουμε προγράμματα για όλες τις ηλικίες και τα επίπεδα'),
      items: [
        {
          title: 'Καλλιτεχνική',
          description: lexical('Αναπτύξτε δύναμη, ευλυγισία και χάρη μέσα από την καλλιτεχνική γυμναστική'),
          image: null,
          linkLabel: 'Μάθετε Περισσότερα',
          linkHref: '/programs#kallitexniki',
          anchor: 'kallitexniki',
        },
        {
          title: 'Ρυθμική',
          description: lexical('Συνδυάστε χορό, μουσική και γυμναστική με όργανα όπως κορδέλα και μπάλα'),
          image: null,
          linkLabel: 'Μάθετε Περισσότερα',
          linkHref: '/programs#rythmiki',
          anchor: 'rythmiki',
        },
        {
          title: 'Προαγωνιστικά',
          description: lexical('Εντατική προετοιμασία για αθλητές που στοχεύουν σε αγώνες και διακρίσεις'),
          image: null,
          linkLabel: 'Μάθετε Περισσότερα',
          linkHref: '/programs#proagonistika',
          anchor: 'proagonistika',
        },
        {
          title: 'Παιδικά',
          description: lexical('Εισαγωγή στη γυμναστική για παιδιά 4-7 ετών με παιχνίδι και διασκέδαση'),
          image: null,
          linkLabel: 'Μάθετε Περισσότερα',
          linkHref: '/programs#paidika',
          anchor: 'paidika',
        },
      ],
    },
    gallery: {
      title: 'Οι Στιγμές μας',
      subtitle: lexical('Ζήστε τη μαγεία των παραστάσεων και των προπονήσεών μας'),
      items: [
        {
          title: 'UV Παράσταση',
          caption: lexical('Μοναδικές στιγμές στη σκηνή'),
          image: null,
        },
        {
          title: 'Ομαδική Παράσταση',
          caption: lexical('Συγχρονισμός και αρμονία'),
          image: null,
        },
        {
          title: 'Νεαρές Αθλήτριες',
          caption: lexical('Το μέλλον της γυμνασικής'),
          image: null,
        },
      ],
    },
    news: {
      title: 'Νέα & Ανακοινώσεις',
      subtitle: lexical('Μείνετε ενημερωμένοι με τα τελευταία μας νέα'),
      items: [
        {
          title: 'Επιτυχημένη Συμμετοχή στους Πανελλήνιους Αγώνες',
          summary: lexical('Οι αθλήτριές μας διακρίθηκαν στους πρόσφατους αγώνες, κερδίζοντας 5 μετάλλια και κάνοντας υπερήφανο τον σύλλογο.'),
          date: '15 Ιανουαρίου 2025',
          href: '/news',
          image: null,
        },
        {
          title: 'Ανοίγουν Νέα Τμήματα για τη Σεζόν 2025',
          summary: lexical('Ξεκινούν οι εγγραφές για τα νέα τμήματα! Προσφέρουμε δωρεάν δοκιμαστικό μάθημα για όλους τους νέους αθλητές.'),
          date: '8 Ιανουαρίου 2025',
          href: '/news',
          image: null,
        },
        {
          title: 'Μαγική Ετήσια Παράσταση 2024',
          summary: lexical('Η ετήσια παράστασή μας ήταν μια απόλυτη επιτυχία! Ευχαριστούμε όλους όσους μας τίμησαν με την παρουσία τους.'),
          date: '20 Δεκεμβρίου 2024',
          href: '/news',
          image: null,
        },
      ],
    },
    sponsors: {
      title: 'Οι Υποστηρικτές μας',
      subtitle: lexical('Ευχαριστούμε θερμά τους υποστηρικτές μας'),
      items: [
        { name: 'Χορηγός 1' },
        { name: 'Χορηγός 2' },
        { name: 'Χορηγός 3' },
        { name: 'Χορηγός 4' },
        { name: 'Χορηγός 5' },
        { name: 'Χορηγός 6' },
      ],
    },
    cta: {
      title: 'Έλα κι εσύ στην οικογένεια της Καλλιτεχνίας!',
      subtitle: lexical('Ξεκινήστε το ταξίδι σας στον κόσμο της γυμναστικής. Προσφέρουμε δωρεάν δοκιμαστικό μάθημα!'),
      buttonLabel: 'Επικοινώνησε μαζί μας',
      buttonHref: '/contact',
    },
  }

  const homepageContent = {
    sections: homepageSections,
    shared: {
      headerFooterPageSlug: 'header-footer-kallitechnia',
    },
  }

  const aboutContent = {
    shared: {
      headerFooterPageSlug: 'header-footer-kallitechnia',
    },
    sections: {
      hero: {
        title: 'Ο Σύλλογος',
      },
      intro: {
        paragraphs: toRichTextArray([
          'Όραμά μας είναι να μεταδώσουμε στα παιδιά την αγάπη μας για τη Γυμναστική και να συμβάλλουμε στη σωματική, ψυχική, πνευματική και κοινωνική τους ανάπτυξη.',
          'Στόχος μας είναι να τους διδάξουμε εκτός από Γυμναστική και τις αξίες της ζωής και να τους δώσουμε χαρά, αγάπη και μοναδικές εμπειρίες μέσα από τη Γυμναστική.',
        ]),
      },
      quote: {
        text: lexical('Υπάρχει ομορφότερο πράγμα από το να φωτίζεις τις ψυχές των παιδιών;'),
      },
      motto: {
        title: '•Καλλιτεχνία•',
        lines: toRichTextArray(['Η Τέχνη της Κίνησης – Η Ψυχή της Γυμναστικής']),
      },
      art: {
        title: 'Καλλιτεχνία',
        subtitle: lexical('Η Τέχνη της Κίνησης – Η Ψυχή της Γυμναστικής'),
        paragraphs: toRichTextArray([
          'Στα αθλήματα της Γυμναστικής όπως η Γυμναστική για Όλους, η Ρυθμική, η Ενόργανη, η Ακροβατική, η καλλιτεχνία δεν είναι λεπτομέρεια – είναι ουσία. Είναι αυτή που ενώνει την τεχνική με το συναίσθημα.',
          'Η ροή της κίνησης, η σύνδεση των ασκήσεων με τη μουσική, η έκφραση των αθλητών, η δυναμική, η απόδοση της χορογραφίας, η παρουσία – όλα αξιολογούνται και βαθμολογούνται και συνθέτουν αυτό που ονομάζουμε καλλιτεχνία.',
          'Ένα πρόγραμμα τεχνικά άρτιο, αλλά χωρίς ψυχή, μένει ημιτελές. Αντίθετα, όταν η τεχνική συνοδεύεται από καλλιτεχνική αρτιότητα, το αποτέλεσμα είναι μαγικό. Η συναισθηματική σύνδεση που δημιουργεί ένας αθλητής με τους θεατές και τους κριτές, είναι αυτή που μπορεί να κάνει τη διαφορά.',
          'Η γυμναστική δεν είναι απλώς άσκηση – είναι έκφραση, ρυθμός, παρουσία. Είναι Καλλιτεχνία.',
        ]),
      },
      storySections: [
        {
          title: 'Σχετικά με εμάς',
          paragraphs: toRichTextArray([
            'Η Γυμναστική Καλλιτεχνία Κεφαλονιάς ιδρύθηκε από μια ομάδα ανθρώπων με κοινό γνώρισμά τους την αγάπη τους για τα παιδιά. Όραμά τους είναι να προσφέρουν στα παιδιά της Κεφαλονιάς την ευκαιρία να ασχοληθούν με τη Γυμναστική, καλλιεργώντας το σώμα και τη ψυχή τους με σεβασμό και αγάπη.',
          ]),
          image: null,
          imagePosition: 'left',
        },
        {
          title: 'Σκοπός',
          paragraphs: toRichTextArray([
            'Ο κύριος σκοπός του συλλόγου μας είναι η προώθηση της Γυμναστικής στην Κεφαλονιά, προσφέροντας ποιοτικά προγράμματα εκπαίδευσης για όλες τις ηλικίες και τα επίπεδα.',
            'Επιδιώκουμε να αναπτύξουμε τις σωματικές και ψυχικές ικανότητες των αθλητών μας, καλλιεργώντας παράλληλα αξίες όπως η ομαδικότητα, ο σεβασμός, η επιμονή και η πειθαρχία.',
            'Στόχος μας είναι να δημιουργήσουμε ένα ασφαλές και υποστηρικτικό περιβάλλον όπου κάθε αθλητής μπορεί να εξελιχθεί στο μέγιστο των δυνατοτήτων του, είτε επιδιώκει την αθλητική του εξέλιξη είτε απλά την προσωπική του ανάπτυξη μέσω του αθλήματος.',
          ]),
          image: null,
          imagePosition: 'right',
        },
        {
          title: 'Φιλοσοφία',
          paragraphs: toRichTextArray([
            'Πιστεύουμε ότι η γυμναστική είναι πολύ περισσότερο από ένα άθλημα - είναι ένας τρόπος ζωής που διαμορφώνει χαρακτήρες και χτίζει μελλοντικούς πρωταθλητές, όχι μόνο στον αθλητισμό αλλά και στη ζωή.',
            'Η φιλοσοφία μας βασίζεται στην ισορροπία μεταξύ της αγωνιστικής αριστείας και της προσωπικής ανάπτυξης. Κάθε αθλητής είναι μοναδικός και αξίζει εξατομικευμένη προσοχή και καθοδήγηση.',
            'Προάγουμε ένα περιβάλλον θετικής ενέργειας, όπου τα λάθη είναι ευκαιρίες μάθησης, οι προκλήσεις είναι ευκαιρίες ανάπτυξης και κάθε επιτυχία, μικρή ή μεγάλη, γιορτάζεται με ενθουσιασμό. Η χαρά της γυμναστικής είναι στο ταξίδι, όχι μόνο στον προορισμό.',
          ]),
          image: null,
          imagePosition: 'left',
        },
      ],
      spaces: {
        title: 'Χώροι Εκγύμνασης',
        items: [
          {
            title: 'Χώρος προπόνησης 1',
            image: null,
          },
          {
            title: 'Χώρος προπόνησης 2',
            image: null,
          },
          {
            title: 'Χώρος προπόνησης 3',
            image: null,
          },
          {
            title: 'Χώρος προπόνησης 4',
            image: null,
          },
        ],
      },
    },
  }

  const programsContent = {
    shared: {
      headerFooterPageSlug: 'header-footer-kallitechnia',
    },
    sections: {
      hero: {
        title: 'Τμήματα',
        subtitle: lexical('Ανακαλύψτε τα προγράμματά μας και βρείτε το ιδανικό τμήμα για εσάς ή το παιδί σας'),
      },
      programs: {
        items: [
          {
            title: 'Καλλιτεχνική Γυμναστική',
            description: lexical(
              'Η καλλιτεχνική γυμναστική είναι ένα ολοκληρωμένο άθλημα που αναπτύσσει δύναμη, ευλυγισία, ισορροπία και συντονισμό. Οι αθλητές μας εκπαιδεύονται σε όλα τα όργανα (δοκός, παράλληλες, έδαφος, ίππος) με έμφαση στην τεχνική και την ασφάλεια. Το πρόγραμμα προσαρμόζεται στις ανάγκες κάθε αθλητή, από αρχάριους έως προχωρημένους.',
            ),
            image: null,
            imagePosition: 'left',
            schedule: [
              { day: 'Δευτέρα', time: '17:00 - 19:00', level: 'Αρχάριοι' },
              { day: 'Τρίτη', time: '17:00 - 19:00', level: 'Μεσαίοι' },
              { day: 'Τετάρτη', time: '17:00 - 19:00', level: 'Αρχάριοι' },
              { day: 'Πέμπτη', time: '17:00 - 19:00', level: 'Προχωρημένοι' },
              { day: 'Παρασκευή', time: '17:00 - 19:00', level: 'Όλα τα επίπεδα' },
            ],
            coach: {
              name: 'Ελένη Δαρδαμάνη',
              photo: '/female-gymnastics-coach.jpg',
              studies: 'Πτυχίο Φυσικής Αγωγής, Πιστοποίηση Καλλιτεχνικής Γυμναστικής',
              bio: lexical(
                'Με πάνω από 15 χρόνια εμπειρίας στην καλλιτεχνική γυμναστική, η Ελένη έχει εκπαιδεύσει δεκάδες αθλητές που έχουν διακριθεί σε πανελλήνιους αγώνες. Η φιλοσοφία της βασίζεται στην ολιστική ανάπτυξη του αθλητή.',
              ),
            },
          },
          {
            title: 'Ρυθμική Γυμναστική',
            description: lexical(
              'Η ρυθμική γυμναστική συνδυάζει τη χάρη του χορού με την αθλητική τεχνική. Οι αθλήτριές μας εκπαιδεύονται με όργανα (σχοινί, στεφάνι, μπάλα, κορδέλα, κλαβ) αναπτύσσοντας μουσικότητα, έκφραση και καλλιτεχνική ερμηνεία. Το πρόγραμμα περιλαμβάνει χορογραφίες και συμμετοχή σε επιδείξεις.',
            ),
            image: null,
            imagePosition: 'right',
            schedule: [
              { day: 'Δευτέρα', time: '16:00 - 18:00', level: 'Αρχάριοι' },
              { day: 'Τρίτη', time: '16:00 - 18:00', level: 'Μεσαίοι' },
              { day: 'Τετάρτη', time: '16:00 - 18:00', level: 'Αρχάριοι' },
              { day: 'Πέμπτη', time: '16:00 - 18:00', level: 'Προχωρημένοι' },
              { day: 'Σάββατο', time: '10:00 - 12:00', level: 'Όλα τα επίπεδα' },
            ],
            coach: {
              name: 'Μαρία Παπαδοπούλου',
              photo: '/female-rhythmic-gymnastics-coach.jpg',
              studies: 'Πτυχίο Χορού & Ρυθμικής Γυμναστικής, Διεθνής Πιστοποίηση FIG',
              bio: lexical(
                'Πρώην αθλήτρια ρυθμικής γυμναστικής με συμμετοχές σε διεθνείς διοργανώσεις. Η Μαρία φέρνει τη δημιουργικότητα και την καλλιτεχνική της ματιά στην εκπαίδευση των νέων αθλητριών.',
              ),
            },
          },
          {
            title: 'Προαγωνιστικά Τμήματα',
            description: lexical(
              'Τα προαγωνιστικά τμήματα απευθύνονται σε αθλητές που επιθυμούν να συμμετέχουν σε αγώνες και να αναπτύξουν τις δεξιότητές τους σε ανταγωνιστικό επίπεδο. Το πρόγραμμα περιλαμβάνει εντατική προπόνηση, φυσική κατάσταση, τεχνική καθοδήγηση και ψυχολογική υποστήριξη για την επίτευξη των στόχων.',
            ),
            image: null,
            imagePosition: 'left',
            schedule: [
              { day: 'Δευτέρα', time: '18:00 - 20:30', level: "Προαγωνιστικό Α'" },
              { day: 'Τρίτη', time: '18:00 - 20:30', level: "Προαγωνιστικό Β'" },
              { day: 'Τετάρτη', time: '18:00 - 20:30', level: "Προαγωνιστικό Α'" },
              { day: 'Πέμπτη', time: '18:00 - 20:30', level: "Προαγωνιστικό Β'" },
              { day: 'Παρασκευή', time: '18:00 - 20:30', level: 'Όλα τα τμήματα' },
              { day: 'Σάββατο', time: '09:00 - 12:00', level: 'Φυσική κατάσταση' },
            ],
            coach: {
              name: 'Νίκος Αντωνίου',
              photo: '/male-gymnastics-coach.jpg',
              studies: 'Πτυχίο Επιστήμης Φυσικής Αγωγής, Μεταπτυχιακό Αθλητικής Απόδοσης',
              bio: lexical(
                'Ο Νίκος έχει εκπαιδεύσει πολλούς πρωταθλητές που έχουν κατακτήσει μετάλλια σε εθνικό και διεθνές επίπεδο. Η προσέγγισή του συνδυάζει επιστημονική μεθοδολογία με ατομική προσοχή.',
              ),
            },
          },
          {
            title: 'Παιδικά Τμήματα',
            description: lexical(
              'Τα παιδικά τμήματα προσφέρουν μια διασκεδαστική και ασφαλή εισαγωγή στον κόσμο της γυμναστικής για παιδιά ηλικίας 3-7 ετών. Μέσα από παιχνίδι και δημιουργικές δραστηριότητες, τα παιδιά αναπτύσσουν βασικές κινητικές δεξιότητες, ισορροπία, συντονισμό και κοινωνικές ικανότητες σε ένα χαρούμενο περιβάλλον.',
            ),
            image: null,
            imagePosition: 'right',
            schedule: [
              { day: 'Δευτέρα', time: '16:00 - 17:00', level: '3-4 ετών' },
              { day: 'Τρίτη', time: '16:00 - 17:00', level: '5-7 ετών' },
              { day: 'Τετάρτη', time: '16:00 - 17:00', level: '3-4 ετών' },
              { day: 'Πέμπτη', time: '16:00 - 17:00', level: '5-7 ετών' },
              { day: 'Παρασκευή', time: '16:00 - 17:00', level: 'Όλες οι ηλικίες' },
            ],
            coach: {
              name: 'Σοφία Γεωργίου',
              photo: '/female-children-gymnastics-coach.jpg',
              studies: 'Πτυχίο Προσχολικής Αγωγής, Ειδίκευση Παιδικής Γυμναστικής',
              bio: lexical(
                'Η Σοφία ειδικεύεται στην εργασία με μικρά παιδιά και δημιουργεί ένα θετικό και ενθαρρυντικό περιβάλλον όπου κάθε παιδί νιώθει ασφαλές να εξερευνήσει τις δυνατότητές του.',
              ),
            },
          },
          {
            title: 'Γυμναστική για Όλους',
            description: lexical(
              'Πόσοι από εσάς γνωρίζετε το συγκεκριμένο άθλημα; Πολλοί και ιδίως τα μικρά παιδιά το μπερδεύουν με τη ρυθμική ή την ενόργανη. Η Γυμναστική για Όλους (ΓγΟ) αποτελεί ένα από τα βασικά αθλήματα της Ομοσπονδίας Γυμναστικής και απευθύνεται σε άτομα κάθε ηλικίας και επιπέδου φυσικής κατάστασης. Είναι ένα ομαδικό άθλημα χωρίς αγωνιστικούς περιορισμούς, που δίνει έμφαση στη συμμετοχή, στη χαρά της κίνησης και στη συνεργασία μέσα σε ομάδες.',
            ),
            image: null,
            imagePosition: 'left',
            additionalInfo: lexical(
              'Η ΓγΟ περιλαμβάνει στοιχεία ρυθμικής γυμναστικής, ενόργανης, ακροβατικής, αεροβικής και χορού. Οι ομάδες συμμετέχουν σε διάφορα Φεστιβάλ Γυμναστικής καθώς και σε Παγκόσμιες και Ευρωπαϊκές Γυμναστράδες. Επίσης, μπορούν να συμμετέχουν και σε Φεστιβάλ με διαγωνιστικό χαρακτήρα, τα λεγόμενα Contest καθώς και στις διοργανώσεις World ή European Gym for life Challenge.',
            ),
            schedule: [
              { day: 'Δευτέρα', time: '18:00 - 20:00', level: 'Όλα τα επίπεδα' },
              { day: 'Τετάρτη', time: '18:00 - 20:00', level: 'Όλα τα επίπεδα' },
              { day: 'Παρασκευή', time: '18:00 - 20:00', level: 'Χορογραφία' },
            ],
            coach: {
              name: 'Ελένη Δαρδαμάνη',
              photo: '/female-gymnastics-coach.jpg',
              studies: 'Πτυχίο Φυσικής Αγωγής, Πιστοποίηση ΓγΟ',
              bio: lexical(
                'Η Ελένη έχει εκπαιδεύσει ομάδες που έχουν συμμετάσχει σε Παγκόσμιες και Ευρωπαϊκές Γυμναστράδες. Η ΓγΟ εστιάζει στα 4F: Fun (Ψυχαγωγία), Fitness (Υγεία), Fundamentals (Δεξιότητες), Friendship (Φιλία).',
              ),
            },
          },
          {
            title: 'Adults Group GfA',
            description: lexical(
              'Το τμήμα ενηλίκων Γυμναστικής για όλους (ΓγΟ) του συλλόγου μας αποσκοπεί στην εκγύμναση των αθλουμένων (ασκήσεις ενδυνάμωσης, αντοχής, ευλυγισίας, ισορροπίας), στην ψυχική ευεξία, στην έκφρασή τους μέσω της κίνησης και της μουσικής, στη δημιουργία μιας ομάδας που θα συμμετάσχει σε Φεστιβάλ Γυμναστικής με πρόγραμμα γυμναστικής-χορογραφική σύνθεση, στη χαρά της συμμετοχής, στη δημιουργία όμορφων εμπειριών.',
            ),
            image: null,
            imagePosition: 'right',
            additionalInfo: lexical(
              'Στη Γυμναστική για όλους με τον όρο «χορογραφική σύνθεση» εννοούμε τη δημιουργία ομαδικού γυμναστικού προγράμματος που περιέχει στοιχεία ενόργανης, ρυθμικής, ακροβατικής, αεροβικής συνδεδεμένα με χορευτικά στοιχεία. Τα στοιχεία που επιλέγονται είναι ανάλογα με το επίπεδο και την ηλικία των αθλουμένων. Οι προπονήσεις έχουν στόχο να ενώσουν την τέχνη της κίνησης με τη χαρά της συμμετοχής.',
            ),
            schedule: [
              { day: 'Τρίτη', time: '19:00 - 21:00', level: 'Ενήλικες' },
              { day: 'Πέμπτη', time: '19:00 - 21:00', level: 'Ενήλικες' },
              { day: 'Σάββατο', time: '11:00 - 13:00', level: 'Χορογραφία' },
            ],
            coach: {
              name: 'Μαρία Παπαδοπούλου',
              photo: '/female-rhythmic-gymnastics-coach.jpg',
              studies: 'Πτυχίο Χορού & Ρυθμικής Γυμναστικής, Ειδίκευση ΓγΟ',
              bio: lexical(
                'Η Μαρία ειδικεύεται στη δημιουργία χορογραφικών συνθέσεων που συνδυάζουν στοιχεία ενόργανης, ρυθμικής, ακροβατικής και αεροβικής γυμναστικής με χορευτικά στοιχεία.',
              ),
            },
          },
        ],
      },
    },
  }

  const contactContent = {
    shared: {
      headerFooterPageSlug: 'header-footer-kallitechnia',
    },
    sections: {
      hero: {
        title: 'Επικοινωνία',
        subtitle: lexical('Είμαστε πάντα στη διάθεσή σας για οποιαδήποτε πληροφορία.'),
      },
      form: {
        title: 'Στείλτε μας Μήνυμα',
        description: lexical('Συμπληρώστε τη φόρμα και θα επικοινωνήσουμε μαζί σας το συντομότερο δυνατό.'),
        submitLabel: 'Αποστολή Μηνύματος',
        fields: [
          { id: 'firstName', label: 'Όνομα *', type: 'text', placeholder: 'Το όνομά σας', required: true },
          { id: 'lastName', label: 'Επώνυμο *', type: 'text', placeholder: 'Το επώνυμό σας', required: true },
          { id: 'email', label: 'Email *', type: 'email', placeholder: 'email@example.com', required: true },
          { id: 'phone', label: 'Τηλέφωνο', type: 'tel', placeholder: '+30 123 456 7890' },
          { id: 'subject', label: 'Θέμα *', type: 'text', placeholder: 'Πώς μπορούμε να σας βοηθήσουμε;', required: true },
          { id: 'message', label: 'Μήνυμα *', type: 'textarea', placeholder: 'Γράψτε το μήνυμά σας εδώ...', required: true },
        ],
      },
      infoCards: [
        {
          icon: 'mapPin',
          title: 'Διεύθυνση',
          lines: toRichTextArray(['Αργοστόλι', 'Κεφαλονιά, 28100', 'Ελλάδα']),
        },
        {
          icon: 'phone',
          title: 'Τηλέφωνο',
          lines: toRichTextArray(['+30 123 456 7890', '+30 098 765 4321']),
        },
        {
          icon: 'mail',
          title: 'Email',
          lines: toRichTextArray(['info@kallitechnia-kefalonia.gr', 'contact@kallitechnia-kefalonia.gr']),
        },
        {
          icon: 'clock',
          title: 'Ώρες Λειτουργίας',
          lines: toRichTextArray(['Δευτέρα - Παρασκευή: 16:00 - 21:00', 'Σάββατο: 10:00 - 14:00', 'Κυριακή: Κλειστά']),
        },
      ],
      map: {
        title: 'Πού Βρισκόμαστε',
        embedUrl:
          'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d50234.89474920634!2d20.456789!3d38.176944!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x135e4c3e3e3e3e3e%3A0x3e3e3e3e3e3e3e3e!2sArgostoli%2C%20Greece!5e0!3m2!1sen!2s!4v1234567890123!5m2!1sen!2s',
      },
    },
  }

  const registrationContent = {
    shared: {
      headerFooterPageSlug: 'header-footer-kallitechnia',
    },
    sections: {
      hero: {
        title: 'Εγγραφές',
        subtitle: lexical('Γίνε μέλος της οικογένειας της Καλλιτεχνίας!'),
      },
      welcome: {
        headline: 'H Kallitechnia Gymnastics Kefalonia σας καλωσορίζει στην ομάδα της.',
        subheadline: lexical('Τα μαθήματά ξεκινούν από τη Δευτέρα 1 Δεκεμβρίου 2025!'),
      },
      documents: {
        title: 'ΑΠΑΡΑΙΤΗΤΑ ΕΓΓΡΑΦΑ ΓΙΑ ΤΗΝ ΣΥΜΜΕΤΟΧΗ ΣΑΣ',
        description: lexical(
          'Μπορείτε να παραλάβετε την αίτηση εγγραφής από τη Γραμματεία του Συλλόγου ή να την κατεβάσετε σε μορφή PDF και να την τυπώσετε.',
        ),
        downloadLabel: 'Κατέβασε την Αίτηση (PDF)',
        downloadUrl: '#',
        requirements: toRichTextArray([
          'Ιατρική βεβαίωση (πρωτότυπη)',
          'Πιστοποιητικό γέννησης (πρωτότυπο)',
          'Φωτοτυπία ταυτότητας για όσους έχουν εκδώσει',
          'Το ΑΜΚΑ της αθλήτριας',
        ]),
      },
      infoCards: [
        {
          icon: 'mapPin',
          title: 'Διεύθυνση',
          lines: toRichTextArray(['Αργοστόλι', 'Κεφαλονιά, 28100']),
        },
        {
          icon: 'phone',
          title: 'Τηλέφωνο',
          lines: toRichTextArray(['+30 123 456 7890']),
        },
        {
          icon: 'mail',
          title: 'Email',
          lines: toRichTextArray(['info@kallitechnia.gr']),
        },
        {
          icon: 'clock',
          title: 'Ωράριο',
          lines: toRichTextArray(['Δευτέρα - Παρασκευή', '17:00 - 21:00']),
        },
      ],
      form: {
        fields: [
          { id: 'childFirstName', label: 'Όνομα Παιδιού *', type: 'text', placeholder: 'Εισάγετε το όνομα του παιδιού', required: true },
          { id: 'childLastName', label: 'Επώνυμο *', type: 'text', placeholder: 'Εισάγετε το επώνυμο του παιδιού', required: true },
          { id: 'age', label: 'Ηλικία *', type: 'text', placeholder: 'Εισάγετε την ηλικία', required: true },
          { id: 'parentName', label: 'Όνομα Γονέα *', type: 'text', placeholder: 'Εισάγετε το όνομα του γονέα', required: true },
          { id: 'phone', label: 'Τηλέφωνο *', type: 'tel', placeholder: '+30 123 456 7890', required: true },
          { id: 'email', label: 'Email *', type: 'email', placeholder: 'email@example.com', required: true },
          { id: 'department', label: 'Επιλογή Τμήματος *', type: 'text', placeholder: 'Επιλέξτε τμήμα', required: true },
          {
            id: 'message',
            label: 'Μήνυμα',
            type: 'textarea',
            placeholder: 'Πείτε μας περισσότερα για το παιδί σας ή τυχόν ερωτήσεις...',
          },
        ],
        consentLabel: lexical(
          'Αποδέχομαι τους Όρους Χρήσης και την Πολιτική Απορρήτου. Συμφωνώ με την επεξεργασία των προσωπικών μου δεδομένων σύμφωνα με τον GDPR.',
        ),
        ctaLabel: 'Υποβολή Εγγραφής',
        termsLink: '/terms',
        privacyLink: '/terms',
      },
      cta: {
        title: 'Κάνε την εγγραφή σου σήμερα!',
        subtitle: lexical('Ξεκίνα το ταξίδι σου στον κόσμο της γυμναστικής με την Καλλιτεχνία Κεφαλονιάς'),
        buttonLabel: 'Επικοινώνησε μαζί μας',
        buttonHref: '/contact',
      },
    },
  }

  const mediaContent = {
    shared: {
      headerFooterPageSlug: 'header-footer-kallitechnia',
    },
    sections: {
      hero: {
        title: 'Media',
        subtitle: lexical('Κατεβάστε επίσημο υλικό του συλλόγου και ακολουθήστε μας στα social media'),
      },
      logos: [
        {
          title: 'Λογότυπο Κύριο',
          image:
            'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Logo%20KGK%20%CF%85%CF%88%CE%B7%CE%BB%CE%AE%CF%82%20%CE%B1%CE%BD%CE%AC%CE%BB%CF%85%CF%83%CE%B7%CF%82-YP2dWdAD9HKxgCBQOBLccXnxTydRcQ.png',
          formats: ['PNG', 'SVG'],
        },
      ],
      photos: [
        {
          title: 'Παράσταση με Καρδιές',
          image:
            'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/4E61F67B-0337-4478-8A77-8114550D1239%20%281%29-hJCE20zQfhEIr0Zo1h6Mk1Zl1U47lS.jpeg',
        },
        {
          title: 'Δραματική Παράσταση',
          image: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/IMG_6320-Pb93nEudabKTDpdQwN5hOwhW0tlBou.jpeg',
        },
        {
          title: 'Ατμοσφαιρική Παράσταση',
          image: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/IMG_6321-EPivdvbOD9wX1IPMd2dA4e3aZlVtiE.jpeg',
        },
        {
          title: 'Συγχρονισμένες Κινήσεις',
          image: null,
        },
        {
          title: 'Παράσταση με Φώτα',
          image: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/IMG_6323-LZ8D1nFb8q5atienRmdoRw14ABglt6.jpeg',
        },
        {
          title: 'UV Παράσταση',
          image: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/IMG_6064-TbMx7N5nQbbsMsgmstilBpaJCGT83X.jpeg',
        },
      ],
      banners: [
        {
          title: 'Κυματιστό Banner',
          image:
            'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/503CB8FC-1A4E-4DD7-8E71-01239C3390BF.png-kKnLsmzgkUfG8nhQNxqb022nHJnt3l.jpeg',
        },
      ],
      socials: [
        { platform: 'Facebook', icon: 'facebook', url: 'https://facebook.com' },
        { platform: 'Instagram', icon: 'instagram', url: 'https://instagram.com' },
        { platform: 'TikTok', icon: 'tiktok', url: 'https://tiktok.com' },
        { platform: 'YouTube', icon: 'youtube', url: 'https://youtube.com' },
      ],
    },
  }

  const newsPageContent = {
    shared: {
      headerFooterPageSlug: 'header-footer-kallitechnia',
    },
    sections: {
      hero: {
        title: 'Νέα & Ανακοινώσεις',
        subtitle: lexical('Μείνετε ενημερωμένοι με τα τελευταία νέα, εκδηλώσεις και επιτυχίες του συλλόγου μας.'),
      },
    },
  }

  const termsContent = {
    shared: {
      headerFooterPageSlug: 'header-footer-kallitechnia',
    },
    heroTitle: 'Όροι Χρήσης',
    lastUpdated: 'Ιανουάριος 2025',
    sections: [
      {
        heading: 'Όροι Χρήσης Ιστοσελίδας',
        paragraphs: toRichTextArray([
          'Καλώς ήρθατε στην ιστοσελίδα της Γυμναστικής Καλλιτεχνίας Κεφαλονιάς. Η χρήση της παρούσας ιστοσελίδας υπόκειται στους παρακάτω όρους και προϋποθέσεις. Παρακαλούμε διαβάστε τους προσεκτικά πριν από τη χρήση της ιστοσελίδας.',
          'Με την πρόσβαση και χρήση της ιστοσελίδας μας, αποδέχεστε και συμφωνείτε να δεσμεύεστε από τους παρόντες όρους χρήσης. Εάν δεν συμφωνείτε με οποιονδήποτε από τους όρους αυτούς, παρακαλούμε μην χρησιμοποιείτε την ιστοσελίδα μας.',
          'Όλο το περιεχόμενο της ιστοσελίδας, συμπεριλαμβανομένων κειμένων, γραφικών, λογοτύπων, εικόνων, βίντεο και λογισμικού, αποτελεί πνευματική ιδιοκτησία της Γυμναστικής Καλλιτεχνίας Κεφαλονιάς και προστατεύεται από τους νόμους περί πνευματικής ιδιοκτησίας.',
          'Το περιεχόμενο της ιστοσελίδας παρέχεται αποκλειστικά για προσωπική και μη εμπορική χρήση. Δεν επιτρέπεται η αναπαραγωγή, διανομή, τροποποίηση ή δημοσίευση του περιεχομένου χωρίς την προηγούμενη γραπτή άδεια του συλλόγου.',
          'Ο σύλλογος διατηρεί το δικαίωμα να τροποποιεί τους παρόντες όρους χρήσης ανά πάσα στιγμή χωρίς προηγούμενη ειδοποίηση. Οι τροποποιήσεις τίθενται σε ισχύ από τη στιγμή της δημοσίευσής τους στην ιστοσελίδα.',
        ]),
      },
      {
        heading: 'Πολιτική Απορρήτου',
        paragraphs: toRichTextArray([
          'Η Γυμναστική Καλλιτεχνία Κεφαλονιάς δεσμεύεται για την προστασία των προσωπικών σας δεδομένων. Η παρούσα πολιτική απορρήτου περιγράφει τον τρόπο με τον οποίο συλλέγουμε, χρησιμοποιούμε και προστατεύουμε τις πληροφορίες σας.',
          'Συλλέγουμε πληροφορίες που μας παρέχετε εθελοντικά όταν επικοινωνείτε μαζί μας μέσω της φόρμας επικοινωνίας, συμπεριλαμβανομένων του ονόματος, του email και του τηλεφώνου σας.',
          'Οι πληροφορίες που συλλέγουμε χρησιμοποιούνται αποκλειστικά για να απαντήσουμε στα ερωτήματά σας, να σας ενημερώσουμε για τα προγράμματα και τις δραστηριότητές μας, και να βελτιώσουμε τις υπηρεσίες μας.',
          'Λαμβάνουμε κατάλληλα τεχνικά και οργανωτικά μέτρα για την προστασία των προσωπικών σας δεδομένων από μη εξουσιοδοτημένη πρόσβαση, απώλεια ή καταστροφή.',
          'Δεν πουλάμε, δεν ανταλλάσσουμε ούτε μεταβιβάζουμε τα προσωπικά σας δεδομένα σε τρίτους χωρίς τη συγκατάθεσή σας, εκτός εάν απαιτείται από το νόμο.',
        ]),
      },
      {
        heading: 'Συμμόρφωση με τον GDPR',
        paragraphs: toRichTextArray([
          'Η Γυμναστική Καλλιτεχνία Κεφαλονιάς συμμορφώνεται πλήρως με τον Γενικό Κανονισμό Προστασίας Δεδομένων (GDPR) της Ευρωπαϊκής Ένωσης (Κανονισμός 2016/679).',
          'Η επεξεργασία των προσωπικών σας δεδομένων βασίζεται στη συγκατάθεσή σας, την εκτέλεση σύμβασης ή το έννομο συμφέρον του συλλόγου για την παροχή των υπηρεσιών του.',
          'Τα προσωπικά σας δεδομένα διατηρούνται μόνο για όσο χρονικό διάστημα είναι απαραίτητο για την εκπλήρωση των σκοπών για τους οποίους συλλέχθηκαν ή όπως απαιτείται από το νόμο.',
          'Για οποιαδήποτε ερώτηση σχετικά με την επεξεργασία των προσωπικών σας δεδομένων, μπορείτε να επικοινωνήσετε με τον υπεύθυνο προστασίας δεδομένων του συλλόγου στο email: privacy@kallitechnia-kefalonia.gr.',
          'Έχετε το δικαίωμα να υποβάλετε καταγγελία στην Αρχή Προστασίας Δεδομένων Προσωπικού Χαρακτήρα εάν θεωρείτε ότι η επεξεργασία των προσωπικών σας δεδομένων παραβιάζει τον GDPR.',
        ]),
      },
      {
        heading: 'Επικοινωνία',
        paragraphs: toRichTextArray([
          'Για οποιαδήποτε ερώτηση σχετικά με τους όρους χρήσης ή την πολιτική απορρήτου, μπορείτε να επικοινωνήσετε μαζί μας μέσω email στο info@kallitechnia-kefalonia.gr ή στο τηλέφωνο +30 123 456 7890.',
        ]),
      },
    ],
  }

  const seedPosts = [
    {
      title: 'Επιτυχίες στο Πανελλήνιο Πρωτάθλημα Ρυθμικής Γυμναστικής',
      slug: 'epityxies-sto-panelladiko-prwtathlima',
      excerpt: lexical(
        'Με μεγάλη χαρά και υπερηφάνεια ανακοινώνουμε τις εξαιρετικές επιδόσεις των αθλητριών μας στο Πανελλήνιο Πρωτάθλημα Ρυθμικής Γυμναστικής που πραγματοποιήθηκε στην Αθήνα.',
      ),
      content: lexical(
        [
          'Με μεγάλη χαρά και υπερηφάνεια ανακοινώνουμε τις εξαιρετικές επιδόσεις των αθλητριών μας στο Πανελλήνιο Πρωτάθλημα Ρυθμικής Γυμναστικής που πραγματοποιήθηκε στην Αθήνα.',
          'Οι αθλήτριές μας κατάφεραν να ξεχωρίσουν ανάμεσα σε δεκάδες συμμετοχές από όλη την Ελλάδα, αποδεικνύοντας την υψηλή ποιότητα της προπόνησης και την αφοσίωσή τους στο άθλημα.',
          '🏅 Αποτελέσματα',
          'Η Μαρία Παπαδοπούλου κατέκτησε την 1η θέση στην κατηγορία Νεανίδων με εξαιρετικές ασκήσεις στη σφαίρα και την κορδέλα. Η χορογραφία της συνδύαζε τεχνική αρτιότητα με καλλιτεχνική έκφραση, εντυπωσιάζοντας τους κριτές και το κοινό.',
          'Η Ελένη Γεωργίου πέτυχε την 3η θέση στην ίδια κατηγορία, με ιδιαίτερα εντυπωσιακή την άσκησή της με τις μπάλες. Η συγχρονισμένη της κίνηση και η χάρη της έδειξαν την πρόοδο που έχει κάνει τους τελευταίους μήνες.',
          '🗓 Η Προετοιμασία',
          'Η προετοιμασία για το πρωτάθλημα ξεκίνησε πολλούς μήνες πριν, με εντατικές προπονήσεις και αφοσίωση από όλη την ομάδα.',
          'Η ψυχολογική προετοιμασία ήταν εξίσου σημαντική με τη φυσική. Οι αθλήτριες έμαθαν να διαχειρίζονται το άγχος του αγώνα και να μετατρέπουν τη νευρικότητα σε θετική ενέργεια.',
          '🚀 Το Μέλλον',
          'Αυτές οι επιτυχίες μας δίνουν κίνητρο να συνεχίσουμε με τον ίδιο ζήλο και αφοσίωση. Ήδη προγραμματίζουμε τη συμμετοχή μας στο επόμενο διεθνές τουρνουά που θα πραγματοποιηθεί τον Ιούνιο.',
          'Ευχαριστούμε θερμά όλους τους γονείς και τους υποστηρικτές μας που μας συνοδεύουν σε αυτό το ταξίδι. Η υποστήριξή σας είναι ανεκτίμητη!',
        ].join('\n\n'),
      ),
      heroImage: null,
      authorName: 'Ελένη Δαρδαμάνη',
      publishedAt: '2024-03-15T09:00:00.000Z',
      status: 'published' as const,
      tags: ['αγώνες', 'επιτυχίες'],
    },
    {
      title: 'Νέα Τμήματα Γυμναστικής για Όλους',
      slug: 'nea-tmimata-gymnastikis',
      excerpt: lexical(
        'Με μεγάλη χαρά ανακοινώνουμε την έναρξη νέων τμημάτων Γυμναστικής για Όλους στον σύλλογό μας! Η Γυμναστική για Όλους είναι ένα άθλημα που απευθύνεται σε όλες τις ηλικίες και επίπεδα φυσικής κατάστασης.',
      ),
      content: lexical(
        [
          'Με μεγάλη χαρά ανακοινώνουμε την έναρξη νέων τμημάτων Γυμναστικής για Όλους στον σύλλογό μας! Η Γυμναστική για Όλους είναι ένα άθλημα που απευθύνεται σε όλες τις ηλικίες και επίπεδα φυσικής κατάστασης.',
          'Τα νέα τμήματα περιλαμβάνουν προγράμματα για παιδιά, εφήβους και ενήλικες, με έμφαση στη χαρά της κίνησης, την ομαδικότητα και τη δημιουργικότητα.',
          '🔍 Τι είναι η Γυμναστική για Όλους;',
          'Η Γυμναστική για Όλους (Gymnastics for All) είναι μια μορφή γυμναστικής που συνδυάζει στοιχεία από διάφορα αθλήματα γυμναστικής, χορό και ακροβατικά. Δεν είναι αγωνιστικό άθλημα, αλλά επικεντρώνεται στη συμμετοχή, τη διασκέδαση και την προσωπική ανάπτυξη.',
          '💪 Οφέλη',
          'Η συμμετοχή στη Γυμναστική για Όλους προσφέρει πολλαπλά οφέλη: βελτίωση της φυσικής κατάστασης, ανάπτυξη συντονισμού και ισορροπίας, ενίσχυση της αυτοπεποίθησης και δημιουργία κοινωνικών δεσμών μέσα από την ομαδική εργασία.',
          'Για περισσότερες πληροφορίες και εγγραφές, επικοινωνήστε μαζί μας!',
        ].join('\n\n'),
      ),
      heroImage:
        'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/IMG_6068%20%281%29-Vk2nWKd2qSVzRl2ldqmb919zO5TCf9.jpeg',
      authorName: 'Σύλλογος Καλλιτεχνία',
      publishedAt: '2024-03-10T12:00:00.000Z',
      status: 'published' as const,
      tags: ['προγράμματα', 'νέα τμήματα'],
    },
    {
      title: 'Συμμετοχή στο Διεθνές Φεστιβάλ Γυμναστικής',
      slug: 'diethnes-festival-gymnastikis',
      excerpt: lexical(
        'Ο σύλλογός μας θα συμμετάσχει στο Διεθνές Φεστιβάλ Γυμναστικής που θα πραγματοποιηθεί στη Θεσσαλονίκη τον Ιούνιο.',
      ),
      content: lexical(
        [
          'Ο σύλλογός μας θα συμμετάσχει στο Διεθνές Φεστιβάλ Γυμναστικής που θα πραγματοποιηθεί στη Θεσσαλονίκη τον Ιούνιο. Πρόκειται για μια σημαντική διοργάνωση που συγκεντρώνει συλλόγους από όλη την Ευρώπη.',
          'Η συμμετοχή μας στο φεστιβάλ αποτελεί μια μοναδική ευκαιρία για τις αθλήτριές μας να παρουσιάσουν τη δουλειά τους σε διεθνές επίπεδο και να ανταλλάξουν εμπειρίες με αθλητές από άλλες χώρες.',
          '🏋️ Προετοιμασία',
          'Η προετοιμασία για το φεστιβάλ είναι σε πλήρη εξέλιξη. Οι προπονήτριές μας εργάζονται πάνω σε νέες χορογραφίες που θα συνδυάζουν παραδοσιακά ελληνικά στοιχεία με σύγχρονες τεχνικές γυμναστικής.',
          'Περισσότερες λεπτομέρειες θα ανακοινωθούν σύντομα!',
        ].join('\n\n'),
      ),
      heroImage: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/IMG_6064-dtKNW2y3nWi4kjmvriBpP8rrQpz5wE.jpeg',
      authorName: 'Ελένη Δαρδαμάνη',
      publishedAt: '2024-03-05T08:30:00.000Z',
      status: 'published' as const,
      tags: ['εκδηλώσεις'],
    },
  ]

  return {
    pageTypes: [
      {
        slug: 'header-footer-kallitechnia',
        name: 'Header & Footer (Kallitechnia)',
        description: 'Shared header and footer content for Kallitechnia tenant.',
        fields: headerFooterSchema,
      },
      {
        slug: 'home-kallitechnia',
        name: 'Kallitechnia Homepage',
        description: 'Homepage content structure for the Kallitechnia template.',
        isDefault: true,
        fields: homepageSchema,
      },
      {
        slug: 'about-kallitechnia',
        name: 'Kallitechnia About',
        description: 'About page structure για την Καλλιτεχνία.',
        fields: aboutSchema,
      },
      {
        slug: 'programs-kallitechnia',
        name: 'Kallitechnia Programs',
        description: 'Programs listing για την Καλλιτεχνία.',
        fields: programsSchema,
      },
      {
        slug: 'contact-kallitechnia',
        name: 'Kallitechnia Contact',
        description: 'Επικοινωνία και στοιχεία συλλόγου.',
        fields: contactSchema,
      },
      {
        slug: 'registration-kallitechnia',
        name: 'Kallitechnia Registration',
        description: 'Σελίδα εγγραφών και απαιτούμενα δικαιολογητικά.',
        fields: registrationSchema,
      },
      {
        slug: 'media-kallitechnia',
        name: 'Kallitechnia Media',
        description: 'Media kit, φωτογραφίες και banners.',
        fields: mediaSchema,
      },
      {
        slug: 'news-kallitechnia',
        name: 'Kallitechnia News Listing',
        description: 'Λίστα δημοσιεύσεων και ανακοινώσεων.',
        fields: newsSchema,
      },
      {
        slug: 'terms-kallitechnia',
        name: 'Kallitechnia Terms',
        description: 'Όροι χρήσης και πολιτικές.',
        fields: termsSchema,
      },
    ],
    pages: [
      {
        slug: 'header-footer-kallitechnia',
        title: 'Header & Footer (Kallitechnia)',
        pageTypeSlug: 'header-footer-kallitechnia',
        content: headerFooterContent,
        seo: {
          title: 'Καλλιτεχνία – Header & Footer',
          description: lexical('Κοινό περιεχόμενο κεφαλίδας και υποσέλιδου για την Καλλιτεχνία.'),
        },
      },
      {
        slug: 'kallitechnia-homepage',
        title: 'Καλλιτεχνία – Αρχική',
        pageTypeSlug: 'home-kallitechnia',
        summary: lexical('Ανακαλύψτε τη μαγεία της γυμναστικής στον σύλλογό μας.'),
        content: homepageContent,
        seo: {
          title: 'Καλλιτεχνία – Σύλλογος Γυμναστικής Κεφαλονιάς',
          description: lexical('Προσφέρουμε προγράμματα γυμναστικής για όλες τις ηλικίες και επίπεδα στην Κεφαλονιά.'),
        },
      },
      {
        slug: 'kallitechnia-about',
        title: 'Καλλιτεχνία – Ο Σύλλογος',
        pageTypeSlug: 'about-kallitechnia',
        content: aboutContent,
        seo: {
          title: 'Καλλιτεχνία – Ο Σύλλογος',
          description: lexical('Μάθετε για την ιστορία, τον σκοπό και τους χώρους εκγύμνασης της Καλλιτεχνίας.'),
        },
      },
      {
        slug: 'kallitechnia-programs',
        title: 'Καλλιτεχνία – Τμήματα',
        pageTypeSlug: 'programs-kallitechnia',
        content: programsContent,
        seo: {
          title: 'Καλλιτεχνία – Τα Τμήματά μας',
          description: lexical('Προγράμματα γυμναστικής για παιδιά, εφήβους και ενήλικες στην Καλλιτεχνία.'),
        },
      },
      {
        slug: 'kallitechnia-contact',
        title: 'Καλλιτεχνία – Επικοινωνία',
        pageTypeSlug: 'contact-kallitechnia',
        content: contactContent,
        seo: {
          title: 'Καλλιτεχνία – Επικοινωνία',
          description: lexical('Επικοινωνήστε με την Καλλιτεχνία Κεφαλονιάς για πληροφορίες και εγγραφές.'),
        },
      },
      {
        slug: 'kallitechnia-registration',
        title: 'Καλλιτεχνία – Εγγραφές',
        pageTypeSlug: 'registration-kallitechnia',
        content: registrationContent,
        seo: {
          title: 'Καλλιτεχνία – Εγγραφές',
          description: lexical('Όλες οι πληροφορίες και τα απαραίτητα δικαιολογητικά για την εγγραφή στον σύλλογο.'),
        },
      },
      {
        slug: 'kallitechnia-media',
        title: 'Καλλιτεχνία – Media',
        pageTypeSlug: 'media-kallitechnia',
        content: mediaContent,
        seo: {
          title: 'Καλλιτεχνία – Media Kit',
          description: lexical('Λογότυπα, φωτογραφίες και επίσημο υλικό της Καλλιτεχνίας.'),
        },
      },
      {
        slug: 'kallitechnia-news',
        title: 'Καλλιτεχνία – Νέα',
        pageTypeSlug: 'news-kallitechnia',
        content: newsPageContent,
        seo: {
          title: 'Καλλιτεχνία – Νέα & Ανακοινώσεις',
          description: lexical('Όλα τα τελευταία νέα, εκδηλώσεις και επιτυχίες του συλλόγου.'),
        },
      },
      {
        slug: 'kallitechnia-terms',
        title: 'Καλλιτεχνία – Όροι Χρήσης',
        pageTypeSlug: 'terms-kallitechnia',
        content: termsContent,
        seo: {
          title: 'Καλλιτεχνία – Όροι Χρήσης',
          description: lexical('Όροι χρήσης της ιστοσελίδας και πολιτική απορρήτου του συλλόγου Καλλιτεχνία.'),
        },
      },
    ],
    posts: seedPosts,
  }
}

const run = async () => {
  await payload.init({
    config,
    secret: process.env.PAYLOAD_SECRET as string,
    local: true,
    onInit: () => payload.logger.info('Payload seed runner connected'),
  })

  const tenantId = await ensureTenant()
  payload.logger.info(`Tenant ready with id: ${tenantId}`)

  const seedData = getKalitechniaSeedData()

  const pageTypeIdMap: Record<string, string | number> = {}

  for (const pageType of seedData.pageTypes) {
    const id = await upsertPageType(tenantId, pageType)
    pageTypeIdMap[pageType.slug] = id
    payload.logger.info(`Page type ready: ${pageType.slug} (${id})`)
  }

  for (const page of seedData.pages) {
    const pageTypeId = pageTypeIdMap[page.pageTypeSlug]
    if (!pageTypeId) {
      throw new Error(`Missing page type for slug ${page.pageTypeSlug}`)
    }

    const pageId = await upsertPage(tenantId, pageTypeId, {
      slug: page.slug,
      title: page.title,
      summary: page.summary,
      content: page.content,
      seo: page.seo,
      status: 'published',
    })

    payload.logger.info(`Page ready: ${page.slug} (${pageId})`)
  }

  if (seedData.posts && seedData.posts.length > 0) {
    for (const post of seedData.posts) {
      const postId = await upsertPost(tenantId, post)
      payload.logger.info(`Post ready: ${post.slug} (${postId})`)
    }
  }

  payload.logger.info('✅ Kalitechnia seed complete')
  process.exit(0)
}

run().catch((error) => {
  if (payload?.logger) {
    payload.logger.error(error)
  } else {
    console.error(error)
  }
  process.exit(1)
})
