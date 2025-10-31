/**
 * Template Definitions
 * 
 * Each template defines:
 * - Which pages to create
 * - What fields/structure each page should have
 * - Default content for each page
 */

import type { TemplateDefinition } from './types'

// ftiaxesite template (landing page structure)
export const ftiaxesiteTemplate: TemplateDefinition = {
  name: 'ftiaxesite',
  description: 'Landing page template with hero, features, process, contact, and footer sections',
  pages: [
    {
      slug: 'home',
      title: 'Home',
      pageType: 'landing',
      sections: {
        header: {
          logo_text: '{{tenant-name}}.gr',
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
            voicePrompt: 'Πάτησε το μικρόφωνο και πες μας για το project σου',
            voiceListening: 'Σε ακούω... Μίλα τώρα!',
            voiceTranscript: 'Αυτό που είπες:',
            submit: 'Αποστολή',
          },
        },
        footer: {
          brand: {
            name: '{{tenant-name}}.gr',
            tagline: 'AI Websites σε 48 Ώρες',
          },
          contact: {
            title: 'Επικοινωνία',
            email: 'info@{{tenant-name}}.gr',
            phone: '+30 210 1234567',
          },
          links: {
            title: 'Χρήσιμα',
            items: [
              { label: 'Όροι Χρήσης', href: '/terms' },
              { label: 'Πολιτική Απορρήτου', href: '/privacy' },
            ],
          },
          copyright: '© 2025 {{tenant-name}}.gr – Κατασκευή Ιστοσελίδων με AI',
        },
      },
    },
    // Add more pages as needed
    // {
    //   slug: 'about',
    //   title: 'About Us',
    //   pageType: 'standard',
    //   content: '...',
    // },
  ],
}

// Template registry - add new templates here
export const templates: Record<string, TemplateDefinition> = {
  ftiaxesite: ftiaxesiteTemplate,
  // Generated templates will be imported here
  // Example:
  // import { mitsosTemplate } from './generated/mitsos'
  // mitsos: mitsosTemplate,
}

/**
 * Get template definition by name
 */
export function getTemplate(templateName: string): TemplateDefinition | null {
  return templates[templateName] || null
}

/**
 * Get all available template names
 */
export function getAvailableTemplates(): string[] {
  return Object.keys(templates)
}

/**
 * Check if template exists
 */
export function templateExists(templateName: string): boolean {
  return templateName in templates
}

