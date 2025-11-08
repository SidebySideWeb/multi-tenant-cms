import type { FieldHook } from 'payload'

const slugify = (value: string): string => {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export const slugifyInput: FieldHook = ({ value }) => {
  if (typeof value !== 'string') {
    return value
  }

  return slugify(value)
}
