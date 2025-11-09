import 'dotenv/config'
import { Client } from 'pg'
import { buildDefaultEditorState } from '@payloadcms/richtext-lexical'

const LONG_TEXT_COLUMNS: Array<{ table: string; column: string }> = [
  { table: 'pages', column: 'sections_hero_subheadline' },
  { table: 'pages', column: 'sections_features_subtitle' },
  { table: 'pages', column: 'sections_process_subtitle' },
  { table: 'pages', column: 'sections_contact_subtitle' },
  { table: 'pages', column: 'summary' },
  { table: 'pages', column: 'seo_description' },
]

const ARRAY_TEXT_COLUMNS: Array<{ table: string; column: string }> = [
  { table: 'pages_sections_features_items', column: 'description' },
  { table: 'pages_sections_process_steps', column: 'description' },
]

const createEmptyParagraph = () => ({
  type: 'paragraph',
  format: '',
  indent: 0,
  version: 1,
  direction: 'ltr',
  children: [],
})

const ensureNonEmptyLexical = (state: any) => {
  if (!state || typeof state !== 'object') {
    return {
      root: {
        type: 'root',
        format: '',
        indent: 0,
        version: 1,
        direction: 'ltr',
        children: [createEmptyParagraph()],
      },
    }
  }

  const root = state.root && typeof state.root === 'object' ? state.root : {}
  const children = Array.isArray((root as any).children) ? (root as any).children : []

  return {
    ...state,
    root: {
      type: 'root',
      format: '',
      indent: 0,
      version: 1,
      direction: 'ltr',
      ...(root as Record<string, unknown>),
      children: children.length > 0 ? children : [createEmptyParagraph()],
    },
  }
}

const ensureLexical = (value: unknown) => {
  if (value && typeof value === 'object' && 'root' in (value as Record<string, unknown>)) {
    return ensureNonEmptyLexical(value)
  }

  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value)
      if (parsed && typeof parsed === 'object' && 'root' in parsed) {
        return ensureNonEmptyLexical(parsed)
      }
    } catch (error) {
      // ignore parse error and continue
    }
  }

  const text = typeof value === 'string' ? value : ''
  return ensureNonEmptyLexical(buildDefaultEditorState({ text }))
}

async function updateTableColumn(client: Client, table: string, column: string, idColumn = 'id') {
  const { rows } = await client.query(`SELECT ${idColumn}, ${column} FROM ${table}`)

  for (const row of rows) {
    const value = row[column]
    const normalized = ensureLexical(value)
    const normalizedJSON = JSON.stringify(normalized)
    const currentJSON = typeof value === 'string' ? value : JSON.stringify(value)

    if (normalizedJSON !== currentJSON) {
      await client.query(`UPDATE ${table} SET ${column} = $1 WHERE ${idColumn} = $2`, [normalizedJSON, row[idColumn]])
    }
  }

  await client.query(
    `ALTER TABLE ${table} ALTER COLUMN ${column} TYPE jsonb USING ${column}::jsonb`,
  )
}

async function main() {
  const connectionString = process.env.POSTGRES_URL

  if (!connectionString) {
    throw new Error('POSTGRES_URL env var is required')
  }

  const client = new Client({ connectionString })
  await client.connect()

  try {
    for (const { table, column } of LONG_TEXT_COLUMNS) {
      await updateTableColumn(client, table, column)
    }

    for (const { table, column } of ARRAY_TEXT_COLUMNS) {
      await updateTableColumn(client, table, column)
    }

    console.log('Manual JSONB migration completed.')
  } finally {
    await client.end()
  }
}

main().catch((error) => {
  console.error('Failed to complete manual JSONB migration:', error)
  process.exit(1)
})
