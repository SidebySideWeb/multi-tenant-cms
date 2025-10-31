import type { FieldHook } from 'payload'

/**
 * Converts a plain text string to Lexical JSON format
 * This is needed when migrating from textarea to richText fields
 */
export function convertStringToLexical(text: string): any {
  if (!text || typeof text !== 'string') {
    return null
  }

  // Split by newlines to create paragraphs
  const lines = text.split('\n').filter(line => line.trim() !== '')

  if (lines.length === 0) {
    return {
      root: {
        children: [],
        direction: 'ltr',
        format: '',
        indent: 0,
        type: 'root',
        version: 1,
      },
    }
  }

  // Create paragraphs for each line
  const children = lines.map((line) => ({
    children: [
      {
        detail: 0,
        format: 0,
        mode: 'normal',
        style: '',
        text: line.trim(),
        type: 'text',
        version: 1,
      },
    ],
    direction: 'ltr',
    format: '',
    indent: 0,
    type: 'paragraph',
    version: 1,
  }))

  return {
    root: {
      children,
      direction: 'ltr',
      format: '',
      indent: 0,
      type: 'root',
      version: 1,
    },
  }
}

/**
 * Hook to convert string values to Lexical format for richText fields
 * This handles migration from textarea fields to richText fields
 */
export const convertRichTextValue: FieldHook = ({ value }) => {
  // If value is already a Lexical object (has root property), return as-is
  if (value && typeof value === 'object' && value.root) {
    return value
  }

  // If value is a string, convert to Lexical format
  if (typeof value === 'string' && value.trim()) {
    return convertStringToLexical(value)
  }

  // If value is null/undefined/empty, return null
  return value || null
}

