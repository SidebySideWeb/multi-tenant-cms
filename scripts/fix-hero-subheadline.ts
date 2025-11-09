import 'dotenv/config'

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

async function main() {
  const connectionString = process.env.POSTGRES_URL

  if (!connectionString) {
    throw new Error('POSTGRES_URL env var is required to run this script.')
  }

  const { Client } = await import('pg')
  const client = new Client({ connectionString })
  await client.connect()

  try {
    const contentUpdate = `
      UPDATE pages
      SET content = jsonb_set(
        COALESCE(content, '{}'::jsonb),
        '{sections,hero,subheadline}',
        ${lexicalFromText("content->'sections'->'hero'->>'subheadline'")}
      )
      WHERE content->'sections'->'hero'->>'subheadline' IS NOT NULL
        AND (
          jsonb_typeof(content->'sections'->'hero'->'subheadline') IS DISTINCT FROM 'object'
          OR jsonb_typeof(content->'sections'->'hero'->'subheadline') IS NULL
        )
    `

    const contentResult = await client.query(contentUpdate)

    const sectionsColumnUpdate = `
      UPDATE pages
      SET sections_hero_subheadline = (${lexicalFromText('sections_hero_subheadline')})::text
      WHERE sections_hero_subheadline IS NOT NULL
        AND sections_hero_subheadline NOT LIKE '{%'
    `

    const sectionsResult = await client.query(sectionsColumnUpdate)

    const alterColumn = `
      ALTER TABLE pages
      ALTER COLUMN sections_hero_subheadline TYPE jsonb
      USING sections_hero_subheadline::jsonb;
    `

    await client.query(alterColumn)

    console.log(`Updated ${contentResult.rowCount} content row(s) and ${sectionsResult.rowCount} column value(s).`)
    console.log('Converted sections_hero_subheadline column to jsonb.')
  } finally {
    await client.end()
  }
}

main().catch((error) => {
  console.error('Failed to migrate hero subheadline values:', error)
  process.exit(1)
})
