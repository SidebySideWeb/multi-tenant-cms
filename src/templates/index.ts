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

export const kalitechniaTemplate: TemplateDefinition = {
  name: 'kalitechnia',
  description: 'Πλήρες πρότυπο συλλόγου γυμναστικής με αρχική, σελίδες συλλόγου, τμημάτων, εγγραφών, media και blog.',
  pages: [
    {
      slug: 'home',
      title: 'Αρχική',
      pageType: 'landing',
      sections: {
        shared: {
          headerFooterPageSlug: 'header-footer-kalitechnia',
        },
        hero: {
          headline: 'Η Γυμναστική είναι δύναμη, χαρά, δημιουργία.',
          subheadline: 'Ανακαλύψτε τη μαγεία της γυμναστικής στον σύλλογό μας.',
          ctaLabel: 'Δες τα Τμήματά μας',
          ctaHref: '/programs',
          backgroundImage:
            'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/4E61F67B-0337-4478-8A77-8114550D1239%20%281%29-hJCE20zQfhEIr0Zo1h6Mk1Zl1U47lS.jpeg',
        },
        welcome: {
          title: 'Καλώς ήρθατε στην Καλλιτεχνία!',
          paragraphs: [
            'Είμαι η Ελένη Δαρδαμάνη, ιδρύτρια του συλλόγου μας. Με πάθος και αφοσίωση, δημιουργήσαμε έναν χώρο όπου κάθε παιδί μπορεί να εκφραστεί, να αναπτυχθεί και να λάμψει μέσα από τη γυμναστική.',
            'Η Καλλιτεχνία δεν είναι απλώς ένας σύλλογος - είναι μια οικογένεια που υποστηρίζει κάθε αθλητή στο ταξίδι του προς την αριστεία.',
            'Ελάτε να γνωρίσετε τον κόσμο της γυμναστικής μαζί μας!',
          ],
          image:
            'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/IMG_6321-EPivdvbOD9wX1IPMd2dA4e3aZlVtiE.jpeg',
        },
        programs: {
          title: 'Τα Τμήματά μας',
          subtitle: 'Προσφέρουμε προγράμματα για όλες τις ηλικίες και τα επίπεδα',
          items: [
            {
              title: 'Καλλιτεχνική',
              description: 'Αναπτύξτε δύναμη, ευλυγισία και χάρη μέσα από την καλλιτεχνική γυμναστική',
              image:
                'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/IMG_6341-lYd2EHQV08gx6DxJdWhs3MXKIhJs8l.jpeg',
              linkLabel: 'Μάθετε Περισσότερα',
              linkHref: '/programs#kallitexniki',
              anchor: 'kallitexniki',
            },
            {
              title: 'Ρυθμική',
              description: 'Συνδυάστε χορό, μουσική και γυμναστική με όργανα όπως κορδέλα και μπάλα',
              image:
                'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/IMG_6340%20%281%29-6T0A1KQPyDVi8Gr7ev3c5o4qGRiEuW.jpeg',
              linkLabel: 'Μάθετε Περισσότερα',
              linkHref: '/programs#rythmiki',
              anchor: 'rythmiki',
            },
            {
              title: 'Προαγωνιστικά',
              description: 'Εντατική προετοιμασία για αθλητές που στοχεύουν σε αγώνες και διακρίσεις',
              image:
                'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/IMG_6320-Pb93nEudabKTDpdQwN5hOwhW0tlBou.jpeg',
              linkLabel: 'Μάθετε Περισσότερα',
              linkHref: '/programs#proagonistika',
              anchor: 'proagonistika',
            },
            {
              title: 'Παιδικά',
              description: 'Εισαγωγή στη γυμναστική για παιδιά 4-7 ετών με παιχνίδι και διασκέδαση',
              image:
                'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/IMG_6323-LZ8D1nFb8q5atienRmdoRw14ABglt6.jpeg',
              linkLabel: 'Μάθετε Περισσότερα',
              linkHref: '/programs#paidika',
              anchor: 'paidika',
            },
          ],
        },
        gallery: {
          title: 'Οι Στιγμές μας',
          subtitle: 'Ζήστε τη μαγεία των παραστάσεων και των προπονήσεών μας',
          items: [
            {
              title: 'UV Παράσταση',
              caption: 'Μοναδικές στιγμές στη σκηνή',
              image: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/IMG_6064-dtKNW2y3nWi4kjmvriBpP8rrQpz5wE.jpeg',
            },
            {
              title: 'Ομαδική Παράσταση',
              caption: 'Συγχρονισμός και αρμονία',
              image:
                'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/IMG_6068%20%281%29-Vk2nWKd2qSVzRl2ldqmb919zO5TCf9.jpeg',
            },
            {
              title: 'Νεαρές Αθλήτριες',
              caption: 'Το μέλλον της γυμναστικής',
              image:
                'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/4E61F67B-0337-4478-8A77-8114550D1239%20%281%29-hJCE20zQfhEIr0Zo1h6Mk1Zl1U47lS.jpeg',
            },
          ],
        },
        news: {
          title: 'Νέα & Ανακοινώσεις',
          subtitle: 'Μείνετε ενημερωμένοι με τα τελευταία μας νέα',
          items: [
            {
              title: 'Επιτυχημένη Συμμετοχή στους Πανελλήνιους Αγώνες',
              summary:
                'Οι αθλήτριές μας διακρίθηκαν στους πρόσφατους αγώνες, κερδίζοντας 5 μετάλλια και κάνοντας υπερήφανο τον σύλλογο.',
              date: '15 Ιανουαρίου 2025',
              href: '/news',
              image: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/IMG_6064-dtKNW2y3nWi4kjmvriBpP8rrQpz5wE.jpeg',
            },
            {
              title: 'Ανοίγουν Νέα Τμήματα για τη Σεζόν 2025',
              summary:
                'Ξεκινούν οι εγγραφές για τα νέα τμήματα! Προσφέρουμε δωρεάν δοκιμαστικό μάθημα για όλους τους νέους αθλητές.',
              date: '8 Ιανουαρίου 2025',
              href: '/news',
              image:
                'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/IMG_6341-lYd2EHQV08gx6DxJdWhs3MXKIhJs8l.jpeg',
            },
            {
              title: 'Μαγική Ετήσια Παράσταση 2024',
              summary:
                'Η ετήσια παράστασή μας ήταν μια απόλυτη επιτυχία! Ευχαριστούμε όλους όσους μας τίμησαν με την παρουσία τους.',
              date: '20 Δεκεμβρίου 2024',
              href: '/news',
              image:
                'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/IMG_6320-Pb93nEudabKTDpdQwN5hOwhW0tlBou.jpeg',
            },
          ],
        },
        sponsors: {
          title: 'Οι Υποστηρικτές μας',
          subtitle: 'Ευχαριστούμε θερμά τους υποστηρικτές μας',
          items: ['Χορηγός 1', 'Χορηγός 2', 'Χορηγός 3', 'Χορηγός 4', 'Χορηγός 5', 'Χορηγός 6'],
        },
        cta: {
          title: 'Έλα κι εσύ στην οικογένεια της Καλλιτεχνίας!',
          subtitle: 'Ξεκινήστε το ταξίδι σας στον κόσμο της γυμναστικής. Προσφέρουμε δωρεάν δοκιμαστικό μάθημα!',
          buttonLabel: 'Επικοινώνησε μαζί μας',
          buttonHref: '/contact',
        },
      },
      meta: {
        title: 'Καλλιτεχνία – Σύλλογος Γυμναστικής Κεφαλονιάς',
        description: 'Προγράμματα γυμναστικής για παιδιά και ενήλικες στην Κεφαλονιά.',
      },
    },
    {
      slug: 'about',
      title: 'Ο Σύλλογος',
      pageType: 'standard',
      sections: {
        heroTitle: 'Ο Σύλλογος',
        intro: [
          'Όραμά μας είναι να μεταδώσουμε στα παιδιά την αγάπη μας για τη Γυμναστική και να συμβάλλουμε στη σωματική, ψυχική, πνευματική και κοινωνική τους ανάπτυξη.',
          'Στόχος μας είναι να τους διδάξουμε εκτός από Γυμναστική και τις αξίες της ζωής και να τους δώσουμε χαρά, αγάπη και μοναδικές εμπειρίες μέσα από τη Γυμναστική.',
        ],
        quote: 'Υπάρχει ομορφότερο πράγμα από το να φωτίζεις τις ψυχές των παιδιών;',
      },
      meta: {
        title: 'Καλλιτεχνία – Ο Σύλλογος',
        description: 'Μάθετε για την ιστορία, τον σκοπό και τους χώρους εκγύμνασης της Καλλιτεχνίας.',
      },
    },
    {
      slug: 'programs',
      title: 'Τμήματα',
      pageType: 'standard',
      sections: {
        hero: {
          title: 'Τμήματα',
          subtitle: 'Ανακαλύψτε τα προγράμματά μας για όλες τις ηλικίες και τα επίπεδα.',
        },
      },
      meta: {
        title: 'Καλλιτεχνία – Τα Τμήματά μας',
        description: 'Προγράμματα γυμναστικής για παιδιά, εφήβους και ενήλικες στην Καλλιτεχνία.',
      },
    },
    {
      slug: 'registration',
      title: 'Εγγραφές',
      pageType: 'standard',
      sections: {
        hero: {
          title: 'Εγγραφές',
          subtitle: 'Όλα όσα χρειάζεστε για να ξεκινήσετε στην Καλλιτεχνία.',
        },
      },
      meta: {
        title: 'Καλλιτεχνία – Εγγραφές',
        description: 'Πληροφορίες, δικαιολογητικά και φόρμα εγγραφής για την Καλλιτεχνία.',
      },
    },
    {
      slug: 'contact',
      title: 'Επικοινωνία',
      pageType: 'standard',
      sections: {
        hero: {
          title: 'Επικοινωνία',
          subtitle: 'Είμαστε πάντα στη διάθεσή σας για οποιαδήποτε πληροφορία.',
        },
      },
      meta: {
        title: 'Καλλιτεχνία – Επικοινωνία',
        description: 'Στοιχεία επικοινωνίας και χάρτης για τον σύλλογο Καλλιτεχνία.',
      },
    },
    {
      slug: 'media',
      title: 'Media',
      pageType: 'standard',
      sections: {
        hero: {
          title: 'Media',
          subtitle: 'Λογότυπα, φωτογραφίες και επίσημο υλικό του συλλόγου.',
        },
      },
      meta: {
        title: 'Καλλιτεχνία – Media Kit',
        description: 'Κατεβάστε το επίσημο media υλικό της Καλλιτεχνίας.',
      },
    },
    {
      slug: 'news',
      title: 'Νέα & Ανακοινώσεις',
      pageType: 'blog',
      sections: {
        hero: {
          title: 'Νέα & Ανακοινώσεις',
          subtitle: 'Μείνετε ενημερωμένοι με τις τελευταίες δραστηριότητες του συλλόγου.',
        },
      },
      meta: {
        title: 'Καλλιτεχνία – Νέα',
        description: 'Όλα τα τελευταία νέα, εκδηλώσεις και επιτυχίες του συλλόγου.',
      },
    },
    {
      slug: 'terms',
      title: 'Όροι Χρήσης',
      pageType: 'standard',
      sections: {
        heroTitle: 'Όροι Χρήσης',
        lastUpdated: 'Ιανουάριος 2025',
      },
      meta: {
        title: 'Καλλιτεχνία – Όροι Χρήσης',
        description: 'Όροι χρήσης της ιστοσελίδας και πολιτική απορρήτου.',
      },
    },
  ],
}

// Template registry - add new templates here
export const templates: Record<string, TemplateDefinition> = {
  ftiaxesite: ftiaxesiteTemplate,
  kalitechnia: kalitechniaTemplate,
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

