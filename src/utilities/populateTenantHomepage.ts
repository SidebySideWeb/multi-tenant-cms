import type { Payload } from 'payload'
import { buildDefaultEditorState } from '@payloadcms/richtext-lexical'

const toLexicalState = (value: unknown) => {
  if (value && typeof value === 'object' && (value as any).root) {
    return value
  }
  const text = typeof value === 'string' ? value : ''
  return buildDefaultEditorState({ text })
}

/**
 * Default homepage data structure matching ftiaxesite frontend defaultData
 * This can be customized per tenant or template type
 */
const defaultHomepageData = {
  header: {
    logo_text: 'ftiaxesite.gr',
    menu: [
      { label: 'Λειτουργίες', link: 'features' },
      { label: 'Διαδικασία', link: 'process' },
    ],
    cta: {
      label: 'Φτιάξε το site σου',
      link: 'contact',
    },
  },
  hero: {
    headline: 'Φτιάξε το site σου σε 48 ώρες — από 250€',
    subheadline:
      'Με τη δύναμη της Τεχνητής Νοημοσύνης, δημιουργούμε γρήγορα, οικονομικά και επαγγελματικά websites.',
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
      voicePrompt: 'Πάτησε το μικρόφωνο (ναι στείλε το) και πες μας για το project σου',
      voiceListening: 'Σε ακούω... Μίλα τώρα!',
      voiceTranscript: 'Αυτό που είπες:',
      submit: 'Αποστολή',
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

/**
 * Populates a tenant's homepage with default data
 * @param payload - Payload instance
 * @param tenantId - The tenant ID to populate homepage for
 * @param customData - Optional custom data to override defaults (for different templates)
 */
export async function populateTenantHomepage(
  payload: Payload,
  tenantId: string | number,
  customData?: Partial<typeof defaultHomepageData>,
): Promise<void> {
  const data = customData
    ? { ...defaultHomepageData, ...customData }
    : defaultHomepageData

  // Check if homepage already exists
  const existingHomepage = await payload.find({
    collection: 'pages',
    where: {
      and: [
        {
          slug: {
            equals: 'ftiaxesite-homepage',
          },
        },
        {
          tenant: {
            equals: tenantId,
          },
        },
      ],
    },
    limit: 1,
  })

  const tenantIdNumber = typeof tenantId === 'string' ? Number(tenantId) : tenantId

  const pageTypeResult = await payload.find({
    collection: 'page-types',
    where: {
      and: [
        {
          slug: {
            equals: 'home-ftiaxesite',
          },
        },
        {
          tenant: {
            equals: tenantIdNumber,
          },
        },
      ],
    },
    limit: 1,
  })

  const pageTypeId = pageTypeResult.docs[0]?.id

  if (!pageTypeId) {
    throw new Error('Unable to locate homepage page type for tenant')
  }

  const headerFooterSlug = 'header-footer-ftiaxesite'

  const sectionsPayload = {
    hero: {
      headline: data.hero.headline,
      subheadline: toLexicalState(data.hero.subheadline),
      cta: data.hero.cta,
      stats: data.hero.stats,
    },
    features: data.features as any,
    process: data.process as any,
    contact: data.contact,
  }

  const contentPayload = {
    sections: sectionsPayload,
    shared: {
      headerFooterPageSlug: headerFooterSlug,
    },
  }

  // If homepage already exists, update it instead of creating new
  if (existingHomepage.docs.length > 0) {
    await payload.update({
      collection: 'pages',
      id: existingHomepage.docs[0].id,
      data: {
        title: data.hero.headline,
        summary: data.hero.subheadline,
        pageType: pageTypeId,
        sections: sectionsPayload,
        content: contentPayload,
      },
    })
  } else {
    // Create new homepage
    await payload.create({
      collection: 'pages',
      data: {
        slug: 'ftiaxesite-homepage',
        tenant: tenantIdNumber as any,
        title: data.hero.headline,
        summary: data.hero.subheadline,
        pageType: pageTypeId,
        status: 'published',
        sections: sectionsPayload,
        content: contentPayload,
      },
    })
  }
}

