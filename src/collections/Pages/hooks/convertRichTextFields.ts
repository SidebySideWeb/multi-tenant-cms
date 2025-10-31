import type { CollectionAfterReadHook } from 'payload'
import { convertStringToLexical } from './convertRichTextValue'

/**
 * Converts all string values in richText fields to Lexical format
 * This hook runs after reading documents from the database
 */
export const convertRichTextFields: CollectionAfterReadHook = ({ doc }) => {
  if (!doc) return doc

  // Process sections.hero.subheadline, sections.features.subtitle, etc.
  const processSections = (sections: any): any => {
    if (!sections || typeof sections !== 'object') {
      return sections
    }

    const processed = { ...sections }

    // Hero section
    if (processed.hero) {
      if (typeof processed.hero.subheadline === 'string') {
        processed.hero.subheadline = convertStringToLexical(processed.hero.subheadline)
      }
    }

    // Features section
    if (processed.features) {
      if (typeof processed.features.subtitle === 'string') {
        processed.features.subtitle = convertStringToLexical(processed.features.subtitle)
      }
      if (Array.isArray(processed.features.items)) {
        processed.features.items = processed.features.items.map((item: any) => {
          if (item && typeof item.description === 'string') {
            return { ...item, description: convertStringToLexical(item.description) }
          }
          return item
        })
      }
    }

    // Process section
    if (processed.process) {
      if (typeof processed.process.subtitle === 'string') {
        processed.process.subtitle = convertStringToLexical(processed.process.subtitle)
      }
      if (Array.isArray(processed.process.steps)) {
        processed.process.steps = processed.process.steps.map((step: any) => {
          if (step && typeof step.description === 'string') {
            return { ...step, description: convertStringToLexical(step.description) }
          }
          return step
        })
      }
    }

    // Contact section
    if (processed.contact) {
      if (typeof processed.contact.subtitle === 'string') {
        processed.contact.subtitle = convertStringToLexical(processed.contact.subtitle)
      }
    }

    return processed
  }

  // Process the document
  const processedDoc = { ...doc }

  // Process sections if they exist
  if (processedDoc.sections) {
    processedDoc.sections = processSections(processedDoc.sections)
  }

  return processedDoc
}



