/**
 * Template Type Definitions
 */

export interface PageTemplate {
  slug: string
  title: string
  pageType: 'standard' | 'landing' | 'blog' | 'custom'
  description?: string
  content?: string
  sections?: Record<string, any>
  meta?: {
    title?: string
    description?: string
  }
}

export interface TemplateDefinition {
  name: string
  description: string
  pages: PageTemplate[]
}

