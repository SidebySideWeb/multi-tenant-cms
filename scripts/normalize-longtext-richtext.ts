import 'dotenv/config'
import { Client } from 'pg'

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

const lexicalFromText = (textExpr: string) => `
  jsonb_build_object(
    'root',
    jsonb_build_object(
      'type', 'root',
      'format', '',
      'indent', 0,
      'version', 1,
      'direction', 'ltr',
      'children', CASE
        WHEN ${textExpr} IS NULL OR ${textExpr} = '' THEN '[]'::jsonb
        ELSE jsonb_build_array(
          jsonb_build_object(
            'type', 'paragraph',
            'format', '',
            'indent', 0,
            'version', 1,
            'direction', 'ltr',
            'children', jsonb_build_array(
              jsonb_build_object(
                'type', 'text',
                'text', ${textExpr},
                'format', 0,
                'detail', 0,
                'mode', 'normal',
                'style', '',
                'version', 1
              )
            )
          )
        )
      END
    )
  )
`

const ensureLexical = (value: unknown) => {
  if (value && typeof value === 'object' && 'root' in (value as Record<string, unknown>)) {
    return value
  }

  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value)
      if (parsed && typeof parsed === 'object' && 'root' in parsed) {
        return parsed
      }
    } catch (error) {
      // ignore parse error, fallback to text conversion
    }
  }

  const text = typeof value === 'string' ? value : ''
  return {
    root: {
      type: 'root',
      format: '',
      indent: 0,
      version: 1,
      direction: 'ltr',
      children: text
        ? [
            {
              type: 'paragraph',
              format: '',
              indent: 0,
              version: 1,
              direction: 'ltr',
              children: [
                {
                  type: 'text',
                  text,
                  format: 0,
                  detail: 0,
                  mode: 'normal',
                  style: '',
                  version: 1,
                },
              ],
            },
          ]
        : [],
    },
  }
}

const normalizeSectionsContent = (content: any) => {
  if (!content || typeof content !== 'object') return content

  const clone = structuredClone(content)

  const sections = clone.sections
  if (!sections || typeof sections !== 'object') {
    return clone
  }

  const hero = sections.hero
  if (hero && typeof hero === 'object') {
    hero.subheadline = ensureLexical(hero.subheadline)
  }

  const features = sections.features
  if (features && typeof features === 'object') {
    features.subtitle = ensureLexical(features.subtitle)
    if (Array.isArray(features.items)) {
      features.items = features.items.map((item: any) => {
        if (!item || typeof item !== 'object') return item
        return {
          ...item,
          description: ensureLexical(item.description),
        }
      })
    }
  }

  const process = sections.process
  if (process && typeof process === 'object') {
    process.subtitle = ensureLexical(process.subtitle)
    if (Array.isArray(process.steps)) {
      process.steps = process.steps.map((step: any) => {
        if (!step || typeof step !== 'object') return step
        return {
          ...step,
          description: ensureLexical(step.description),
        }
      })
    }
  }

  const contact = sections.contact
  if (contact && typeof contact === 'object') {
    contact.subtitle = ensureLexical(contact.subtitle)
  }

  clone.sections = sections

  return clone
}

async function columnExists(client: Client, table: string, column: string) {
  const result = await client.query(
    `
      SELECT 1
      FROM information_schema.columns
      WHERE table_name = $1 AND column_name = $2
    `,
    [table, column],
  )

  return result.rowCount > 0
}

async function convertColumn(client: Client, table: string, column: string) {
  if (!(await columnExists(client, table, column))) {
    return
  }

  const dataTypeResult = await client.query(
    `
      SELECT data_type
      FROM information_schema.columns
      WHERE table_name = $1 AND column_name = $2
    `,
    [table, column],
  )

  const currentType = dataTypeResult.rows[0]?.data_type

  if (currentType === 'json' || currentType === 'jsonb') {
    return
  }

  const updateSql = `
    UPDATE ${table}
    SET ${column} = (${lexicalFromText(column)})::text
    WHERE ${column} IS NOT NULL
      AND ${column} NOT LIKE '{%'
  `

  await client.query(updateSql)

  const alterSql = `
    ALTER TABLE ${table}
    ALTER COLUMN ${column} TYPE jsonb
    USING ${column}::jsonb;
  `

  await client.query(alterSql)
}

async function normalizeContentColumn(client: Client) {
  const { rows } = await client.query<{ id: number; content: any; summary: any; seo_description: any }>(
    'SELECT id, content, summary, seo_description FROM pages',
  )

  for (const row of rows) {
    let changed = false
    const content = row.content ? normalizeSectionsContent(row.content) : row.content

    if (content !== row.content) {
      changed = true
    }

    if (row.summary !== undefined) {
      const normalizedSummary = ensureLexical(row.summary)
      if (normalizedSummary !== row.summary) {
        await client.query('UPDATE pages SET summary = $1 WHERE id = $2', [normalizedSummary, row.id])
      }
    }

    if (row.seo_description !== undefined) {
      const normalizedSeo = ensureLexical(row.seo_description)
      if (normalizedSeo !== row.seo_description) {
        await client.query('UPDATE pages SET seo_description = $1 WHERE id = $2', [normalizedSeo, row.id])
      }
    }

    if (changed) {
      await client.query('UPDATE pages SET content = $1 WHERE id = $2', [content, row.id])
    }
  }
}

async function main() {
  const connectionString = process.env.POSTGRES_URL

  if (!connectionString) {
    throw new Error('POSTGRES_URL env var is required to run this script.')
  }

  const client = new Client({ connectionString })
  await client.connect()

  try {
    await normalizeContentColumn(client)

    for (const entry of LONG_TEXT_COLUMNS) {
      await convertColumn(client, entry.table, entry.column)
    }

    for (const entry of ARRAY_TEXT_COLUMNS) {
      await convertColumn(client, entry.table, entry.column)
    }

    console.log('Normalized long-form text columns to Lexical JSON.')
  } finally {
    await client.end()
  }
}

main().catch((error) => {
  console.error('Failed to migrate long-form text values:', error)
  process.exit(1)
})
