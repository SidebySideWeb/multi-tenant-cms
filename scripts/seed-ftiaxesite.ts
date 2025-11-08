import 'dotenv/config'
import path from 'path'
import { fileURLToPath } from 'url'
import payload from 'payload'

import config from '../src/payload.config'
import { buildDefaultEditorState } from '@payloadcms/richtext-lexical'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const ensureTenant = async () => {
  const tenantSlug = 'ftiaxesite'

  const existing = await payload.find({
    collection: 'tenants',
    where: {
      slug: {
        equals: tenantSlug,
      },
    },
    depth: 0,
    limit: 1,
  })

  if (existing.docs.length > 0) {
    const tenant = existing.docs[0]
    await payload.update({
      collection: 'tenants',
      id: tenant.id,
      data: {
        name: 'ftiaxesite',
        slug: tenantSlug,
        domain: 'ftiaxesite.gr',
        defaultLocale: 'el',
      },
      overrideAccess: true,
    })
    return Number(tenant.id)
  }

  const created = await payload.create({
    collection: 'tenants',
    data: {
      name: 'ftiaxesite',
      slug: tenantSlug,
      domain: 'ftiaxesite.gr',
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

  payload.logger.info(
    `Creating page type ${data.slug} for tenant ${tenantRef} (type: ${typeof tenantRef})`,
  )

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
    summary?: string
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

const getFtiaxesiteSeedData = () => {
  const headerFooterSchema = {
    groups: [
      {
        key: 'header',
        label: 'Header',
        fields: [
          { name: 'logoText', label: 'Logo Text', type: 'text', required: true },
          {
            name: 'menu',
            label: 'Menu Items',
            type: 'array',
            minRows: 1,
            fields: [
              { name: 'label', label: 'Label', type: 'text', required: true },
              { name: 'link', label: 'Link / Anchor', type: 'text', required: true },
            ],
          },
          {
            name: 'cta',
            label: 'Call to Action',
            type: 'group',
            fields: [
              { name: 'label', label: 'Button Label', type: 'text', required: true },
              { name: 'link', label: 'Anchor or URL', type: 'text', required: true },
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
            ],
          },
          {
            name: 'contact',
            label: 'Contact Details',
            type: 'group',
            fields: [
              { name: 'title', label: 'Section Title', type: 'text' },
              { name: 'email', label: 'Email', type: 'text' },
              { name: 'phone', label: 'Phone', type: 'text' },
            ],
          },
          {
            name: 'links',
            label: 'Useful Links',
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
          {
            name: 'headerFooterPageSlug',
            label: 'Header/Footer Page Slug',
            type: 'text',
            required: true,
          },
        ],
      },
      {
        key: 'hero',
        label: 'Hero Section',
        fields: [
          { name: 'headline', label: 'Headline', type: 'text', required: true },
          { name: 'subheadline', label: 'Subheadline', type: 'richText' },
          { name: 'cta', label: 'CTA Button Label', type: 'text' },
          { name: 'image', label: 'Image URL', type: 'text' },
          {
            name: 'stats',
            label: 'Stats',
            type: 'array',
            fields: [
              { name: 'value', label: 'Value', type: 'text', required: true },
              { name: 'label', label: 'Label', type: 'text', required: true },
            ],
          },
        ],
      },
      {
        key: 'features',
        label: 'Features Section',
        fields: [
          { name: 'title', label: 'Title', type: 'text', required: true },
          { name: 'subtitle', label: 'Subtitle', type: 'textarea' },
          {
            name: 'items',
            label: 'Feature Items',
            type: 'array',
            minRows: 1,
            fields: [
              {
                name: 'icon',
                label: 'Icon',
                type: 'select',
                options: [
                  { label: 'Clock', value: 'clock' },
                  { label: 'Euro', value: 'euro' },
                  { label: 'Trending Up', value: 'trendingUp' },
                  { label: 'Shield', value: 'shield' },
                  { label: 'Smartphone', value: 'smartphone' },
                  { label: 'Zap', value: 'zap' },
                ],
                required: true,
              },
              { name: 'title', label: 'Title', type: 'text', required: true },
              { name: 'description', label: 'Description', type: 'textarea', required: true },
            ],
          },
        ],
      },
      {
        key: 'process',
        label: 'Process Section',
        fields: [
          { name: 'title', label: 'Title', type: 'text' },
          { name: 'subtitle', label: 'Subtitle', type: 'textarea' },
          {
            name: 'steps',
            label: 'Steps',
            type: 'array',
            minRows: 1,
            fields: [
              { name: 'number', label: 'Step Number', type: 'text' },
              { name: 'icon', label: 'Icon', type: 'select', options: [
                { label: 'File Text', value: 'fileText' },
                { label: 'Wand', value: 'wand2' },
                { label: 'Check Circle', value: 'checkCircle2' },
              ] },
              { name: 'title', label: 'Title', type: 'text', required: true },
              { name: 'description', label: 'Description', type: 'textarea', required: true },
              {
                name: 'color',
                label: 'Accent Color',
                type: 'select',
                options: [
                  { label: 'Teal', value: 'teal' },
                  { label: 'Navy', value: 'navy' },
                ],
              },
            ],
          },
        ],
      },
      {
        key: 'contact',
        label: 'Contact Section',
        fields: [
          { name: 'title', label: 'Title', type: 'text', required: true },
          { name: 'subtitle', label: 'Subtitle', type: 'textarea' },
          {
            name: 'form',
            label: 'Form Labels',
            type: 'group',
            fields: [
              { name: 'name', label: 'Name Label', type: 'text' },
              { name: 'email', label: 'Email Label', type: 'text' },
              { name: 'phone', label: 'Phone Label', type: 'text' },
              { name: 'voicePrompt', label: 'Voice Prompt', type: 'text' },
              { name: 'voiceListening', label: 'Voice Listening', type: 'text' },
              { name: 'voiceTranscript', label: 'Voice Transcript', type: 'text' },
              { name: 'submit', label: 'Submit Button', type: 'text' },
            ],
          },
        ],
      },
    ],
  }

  const headerFooterContent = {
    header: {
      logoText: 'ftiaxesite.gr',
      menu: [
        { label: 'Λειτουργίες', link: 'features' },
        { label: 'Διαδικασία', link: 'process' },
      ],
      cta: {
        label: 'Φτιάξε το site σου',
        link: 'contact',
      },
    },
    footer: {
      brand: {
        name: 'ftiaxesite.gr',
        tagline: 'AI Websites σε 48 Ώρες',
      },
      contact: {
        title: 'Επικοινωνία',
        email: 'info@ftiaxesite.gr',
        phone: '+30 210 1234567',
      },
      links: {
        title: 'Χρήσιμα',
        items: [
          { label: 'Όροι Χρήσης', href: '/terms' },
          { label: 'Πολιτική Απορρήτου', href: '/privacy' },
        ],
      },
      copyright: '© 2025 ftiaxesite.gr – Κατασκευή Ιστοσελίδων με AI',
    },
  }

  const homepageContent = {
    shared: {
      headerFooterPageSlug: 'header-footer-ftiaxesite',
    },
    hero: {
      headline: 'Φτιάξε το site σου σε 48 ώρες — από 250€',
      subheadline: buildDefaultEditorState({
        text: 'Με τη δύναμη της Τεχνητής Νοημοσύνης, δημιουργούμε γρήγορα, οικονομικά και επαγγελματικά websites.',
      }),
      cta: 'Ξεκίνα τώρα',
      stats: [
        { value: '48h', label: 'Παράδοση' },
        { value: '250€', label: 'Από' },
        { value: 'AI', label: 'Τεχνολογία' },
      ],
    },
    features: {
      title: 'Γιατί να μας επιλέξεις',
      subtitle: 'Όλα όσα χρειάζεσαι για να έχεις έτοιμο το website σου σε 48 ώρες',
      items: [
        {
          icon: 'clock',
          title: 'Παράδοση σε 48 ώρες',
          description: 'Το website σου είναι έτοιμο μέσα σε δύο μέρες.',
        },
        {
          icon: 'euro',
          title: 'Από 250€',
          description: 'Χαμηλό κόστος χωρίς κρυφές χρεώσεις.',
        },
        {
          icon: 'trendingUp',
          title: 'SEO & Analytics',
          description: 'Έτοιμο για Google με ενσωματωμένο Tag Manager.',
        },
        {
          icon: 'shield',
          title: 'Cookie Consent',
          description: 'Συμμόρφωση με GDPR και απόλυτη διαφάνεια.',
        },
        {
          icon: 'smartphone',
          title: 'Responsive Design',
          description: 'Λειτουργεί άψογα σε κινητά, tablet και υπολογιστές.',
        },
        {
          icon: 'zap',
          title: 'AI Technology',
          description: 'Χρησιμοποιούμε Τεχνητή Νοημοσύνη για γρήγορη ανάπτυξη.',
        },
      ],
    },
    process: {
      title: 'Πώς δουλεύουμε',
      subtitle: 'Από την ιδέα στην online παρουσία — απλά, γρήγορα και αποτελεσματικά.',
      steps: [
        {
          number: '01',
          icon: 'fileText',
          title: 'Συμπληρώνεις τη φόρμα',
          description: 'Μας λες τι χρειάζεσαι.',
          color: 'teal',
        },
        {
          number: '02',
          icon: 'wand2',
          title: 'Δημιουργούμε το σχέδιο',
          description: 'Χρησιμοποιούμε AI για να σχεδιάσουμε το website σου.',
          color: 'navy',
        },
        {
          number: '03',
          icon: 'checkCircle2',
          title: 'Παραδίδουμε σε 48 ώρες',
          description: 'Παραλαμβάνεις έτοιμο site με SEO & Analytics.',
          color: 'teal',
        },
      ],
    },
    contact: {
      title: 'Ξεκίνα τη κατασκευή της σελίδας σου σήμερα',
      subtitle: 'Πες μας τι χρειάζεσαι — μίλησε το brief σου με ένα κλικ',
      form: {
        name: 'Όνομα',
        email: 'Email',
        phone: 'Τηλέφωνο',
        voicePrompt: 'Πάτησε το μικρόφωνο και πες μας για το project σου',
        voiceListening: 'Σε ακούω... Μίλα τώρα!',
        voiceTranscript: 'Αυτό που είπες:',
        submit: 'Αποστολή',
      },
    },
  }

  return {
    pageTypes: [
      {
        slug: 'header-footer-ftiaxesite',
        name: 'Header & Footer',
        description: 'Shared header and footer content for ftiaxesite.',
        fields: headerFooterSchema,
      },
      {
        slug: 'home-ftiaxesite',
        name: 'Homepage',
        description: 'Homepage content sections for ftiaxesite landing page.',
        isDefault: true,
        fields: homepageSchema,
      },
    ],
    pages: [
      {
        slug: 'header-footer-ftiaxesite',
        title: 'Header & Footer (ftiaxesite)',
        pageTypeSlug: 'header-footer-ftiaxesite',
        content: headerFooterContent,
        seo: {
          title: 'ftiaxesite — Header & Footer',
          description: 'Shared header and footer content for ftiaxesite.',
        },
      },
      {
        slug: 'ftiaxesite-homepage',
        title: 'Ftiaxesite Homepage',
        pageTypeSlug: 'home-ftiaxesite',
        content: homepageContent,
        seo: {
          title: 'ftiaxesite.gr - AI Websites σε 48 Ώρες',
          description:
            'Φτιάξε το site σου σε 48 ώρες με τη δύναμη της Τεχνητής Νοημοσύνης. Οικονομικά, γρήγορα και επαγγελματικά websites από 250€.',
        },
      },
    ],
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

  const seedData = getFtiaxesiteSeedData()

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
      content: page.content,
      seo: page.seo,
      status: 'published',
    })

    payload.logger.info(`Page ready: ${page.slug} (${pageId})`)
  }

  payload.logger.info('✅ ftiaxesite seed complete')
  process.exit(0)
}

run().catch((error) => {
  payload.logger.error(error)
  process.exit(1)
})
