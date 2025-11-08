'use client'

import React, { useEffect, useMemo, useState } from 'react'
import type { JSONFieldClientProps } from '@payloadcms/ui/fields/JSON'
import { fieldBaseClass } from '@payloadcms/ui/fields/shared'
import { useField } from '@payloadcms/ui/forms/useField'
import { useConfig } from '@payloadcms/ui/providers/Config'
import './PageContentField.scss'

type RelationshipValue =
  | string
  | number
  | null
  | {
      value?: string | number
      id?: string | number
    }
  | Array<{
      value?: string | number
      id?: string | number
    }>

type SimpleFieldType = 'text' | 'textarea' | 'email' | 'number' | 'url'

interface BaseFieldCommon {
  name: string
  label?: string
  description?: string
  required?: boolean
  admin?: {
    placeholder?: string
    description?: string
  }
}

interface SimpleField extends BaseFieldCommon {
  type: SimpleFieldType
}

interface SelectField extends BaseFieldCommon {
  type: 'select'
  options?: Array<{ label: string; value: string | number }>
}

interface GroupField extends BaseFieldCommon {
  type: 'group'
  fields?: SchemaField[]
}

interface ArrayField extends BaseFieldCommon {
  type: 'array'
  minRows?: number
  maxRows?: number
  fields?: SchemaField[]
}

type SchemaField = SimpleField | SelectField | GroupField | ArrayField

interface SchemaGroup {
  key: string
  label?: string
  description?: string
  fields?: SchemaField[]
}

interface PageTypeSchema {
  groups: SchemaGroup[]
}

interface PageTypeDoc {
  id: string | number
  slug: string
  fields?: unknown
}

const normalizeRelationshipValue = (value: RelationshipValue): string | number | null => {
  if (value == null) return null

  if (Array.isArray(value)) {
    const first = value[0]
    return normalizeRelationshipValue(first ?? null)
  }

  if (typeof value === 'object') {
    if (value.value !== undefined && value.value !== null) return value.value
    if (value.id !== undefined && value.id !== null) return value.id
  }

  return value as string | number
}

const fetchPageType = async (id: string | number): Promise<PageTypeDoc> => {
  const res = await fetch(`/api/page-types/${id}?depth=0`, {
    credentials: 'include',
  })
  if (!res.ok) {
    throw new Error(`Failed to load page type ${id}`)
  }
  return res.json()
}

const humanizeLabel = (input: string): string => {
  return input
    .replace(/([A-Z])/g, ' $1')
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/^./, (c) => c.toUpperCase())
}

const inferSimpleFieldType = (name: string, rawType?: string): SimpleFieldType => {
  const candidate = rawType?.toLowerCase()
  if (candidate === 'textarea') return 'textarea'
  if (candidate === 'email') return 'email'
  if (candidate === 'number') return 'number'
  if (candidate === 'url') return 'url'

  const lower = name.toLowerCase()
  if (/(description|subtitle|subheadline|body|content|text|copy|paragraph)/.test(lower)) return 'textarea'
  if (/email/.test(lower)) return 'email'
  if (/(price|count|number|step|quantity)/.test(lower)) return 'number'
  if (/(url|link|href|slug)/.test(lower)) return 'url'

  return 'text'
}

const isNotNull = <T,>(value: T | null | undefined): value is T => value !== null && value !== undefined

const normalizeField = (raw: any): SchemaField | null => {
  if (!raw || typeof raw !== 'object') return null

  const name: string | undefined =
    typeof raw.name === 'string'
      ? raw.name
      : typeof raw.slug === 'string'
        ? raw.slug
        : typeof raw.key === 'string'
          ? raw.key
          : undefined

  if (!name) return null

  const label: string | undefined = raw.label ?? humanizeLabel(name)
  const description: string | undefined = raw.description ?? raw.admin?.description
  const admin = raw.admin
  const required = Boolean(raw.required)
  const type = typeof raw.type === 'string' ? raw.type : undefined

  if (type === 'array') {
    const fields = Array.isArray(raw.fields) ? raw.fields.map(normalizeField).filter(isNotNull) : []
    return {
      name,
      label,
      description,
      required,
      admin,
      type: 'array',
      minRows: raw.minRows,
      maxRows: raw.maxRows,
      fields,
    }
  }

  if (type === 'group') {
    const fields = Array.isArray(raw.fields) ? raw.fields.map(normalizeField).filter(isNotNull) : []
    return {
      name,
      label,
      description,
      required,
      admin,
      type: 'group',
      fields,
    }
  }

  if (type === 'select') {
    const options: Array<{ label: string; value: string | number }> | undefined = Array.isArray(raw.options)
      ? raw.options
          .map((option: any) => {
            if (option == null) return null
            if (typeof option === 'object') {
              const value = option.value ?? option.value ?? option.id
              if (value === undefined || value === null) return null
              return {
                label: option.label ?? humanizeLabel(String(value)),
                value,
              }
            }
            return {
              label: humanizeLabel(String(option)),
              value: option,
            }
          })
          .filter(isNotNull)
      : undefined

    return {
      name,
      label,
      description,
      required,
      admin,
      type: 'select',
      options,
    }
  }

  if (type === 'richText') {
    return {
      name,
      label,
      description,
      required,
      admin,
      type: 'textarea',
    }
  }

  const simpleType = inferSimpleFieldType(name, type)
  return {
    name,
    label,
    description,
    required,
    admin,
    type: simpleType,
  }
}

const normalizeGroup = (raw: any): SchemaGroup | null => {
  if (!raw || typeof raw !== 'object') return null
  const key: string | undefined =
    typeof raw.key === 'string'
      ? raw.key
      : typeof raw.name === 'string'
        ? raw.name
        : typeof raw.slug === 'string'
          ? raw.slug
          : undefined
  if (!key) return null

  const label = raw.label ?? humanizeLabel(key)
  const description = raw.description
  const fields = Array.isArray(raw.fields) ? raw.fields.map(normalizeField).filter(isNotNull) : []

  return {
    key,
    label,
    description,
    fields,
  }
}

const convertLegacyEntry = (name: string, value: any): SchemaField | null => {
  if (typeof value === 'string') {
    return {
      name,
      label: humanizeLabel(name),
      type: inferSimpleFieldType(name, value),
    }
  }

  if (Array.isArray(value)) {
    const first = value[0]
    if (first && typeof first === 'object' && !Array.isArray(first)) {
      const fields = Object.entries(first)
        .map(([childName, childValue]) => convertLegacyEntry(childName, childValue))
        .filter(isNotNull) as SchemaField[]

      return {
        name,
        label: humanizeLabel(name),
        type: 'array',
        fields,
      }
    }

    return {
      name,
      label: humanizeLabel(name),
      type: 'array',
      fields: [
        {
          name: 'value',
          label: 'Value',
          type: 'text',
        },
      ],
    }
  }

  if (value && typeof value === 'object') {
    const fields = Object.entries(value)
      .map(([childName, childValue]) => convertLegacyEntry(childName, childValue))
      .filter(isNotNull) as SchemaField[]

    return {
      name,
      label: humanizeLabel(name),
      type: 'group',
      fields,
    }
  }

  return {
    name,
    label: humanizeLabel(name),
    type: 'text',
  }
}

const convertLegacyObjectToGroups = (raw: any): SchemaGroup[] => {
  if (!raw || typeof raw !== 'object') return []

  return Object.entries(raw)
    .map(([key, value]) => {
      const field = convertLegacyEntry(key, value)
      if (!field) return null

      if (field.type === 'group') {
        return {
          key,
          label: humanizeLabel(key),
          fields: field.fields,
        }
      }

      return {
        key,
        label: humanizeLabel(key),
        fields: [field],
      }
    })
    .filter(isNotNull)
}

const normalizePageTypeSchema = (raw: unknown): PageTypeSchema | null => {
  if (raw == null) return null

  let parsed: unknown = raw

  if (typeof raw === 'string') {
    try {
      parsed = JSON.parse(raw)
    } catch (error) {
      console.warn('[PageContentField] Failed to parse page type fields JSON', error)
      return null
    }
  }

  if (typeof parsed !== 'object' || parsed === null) {
    return null
  }

  if (Array.isArray((parsed as any).groups)) {
    const groups = (parsed as any).groups.map(normalizeGroup).filter(isNotNull)
    if (groups.length > 0) {
      return { groups }
    }
  }

  const legacyGroups = convertLegacyObjectToGroups(parsed)
  if (legacyGroups.length > 0) {
    return { groups: legacyGroups }
  }

  return null
}

const createDefaultForField = (field: SchemaField): any => {
  switch (field.type) {
    case 'group':
      return createDefaultObject(field.fields ?? [])
    case 'array':
      return []
    case 'select':
      return field.options?.[0]?.value ?? ''
    case 'number':
      return ''
    case 'email':
      return ''
    case 'url':
      return ''
    case 'textarea':
    case 'text':
    default:
      return ''
  }
}

const createDefaultObject = (fields: SchemaField[]): Record<string, any> => {
  return fields.reduce<Record<string, any>>((acc, field) => {
    acc[field.name] = createDefaultForField(field)
    return acc
  }, {})
}

const createDefaultArrayItem = (field: ArrayField): any => {
  const childFields = field.fields ?? []
  if (childFields.length === 0) {
    return {}
  }
  return createDefaultObject(childFields)
}

const getValueAtPath = (root: any, path: Array<string | number>): any => {
  return path.reduce<any>((acc, segment) => {
    if (acc == null) return undefined
    return acc[segment as keyof typeof acc]
  }, root)
}

const setValueAtPath = (root: any, path: Array<string | number>, value: any): any => {
  if (path.length === 0) return value

  const [current, ...rest] = path
  const isIndex = typeof current === 'number'

  const base =
    isIndex && Array.isArray(root) ? [...root] : !isIndex && root && typeof root === 'object' && !Array.isArray(root) ? { ...root } : isIndex ? [] : {}

  if (rest.length === 0) {
    base[current as any] = value
    return base
  }

  const nextValue = base[current as any]
  base[current as any] = setValueAtPath(nextValue, rest, value)
  return base
}

const FieldRow: React.FC<{ label: string; description?: string; children: React.ReactNode }> = ({
  label,
  description,
  children,
}) => {
  return (
    <div className="page-content-editor__row">
      <label className="page-content-editor__label">{label}</label>
      <div className="page-content-editor__control">
        {children}
        {description && <p className="page-content-editor__description">{description}</p>}
      </div>
    </div>
  )
}

const TextInput: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = (props) => (
  <input className="page-content-editor__input" {...props} />
)

const TextArea: React.FC<React.TextareaHTMLAttributes<HTMLTextAreaElement>> = (props) => (
  <textarea className="page-content-editor__textarea" {...props} />
)

const Divider: React.FC<{ title?: string }> = ({ title }) => (
  <div className="page-content-editor__divider">{title && <h4>{title}</h4>}</div>
)

const DynamicPageContentEditor: React.FC<{
  schema: PageTypeSchema
  value: any
  onChange: (next: any) => void
}> = ({ schema, value, onChange }) => {
  const content = value ?? {}

  const updateAtPath = (path: Array<string | number>, nextValue: any) => {
    const updated = setValueAtPath(content, path, nextValue)
    onChange(updated)
  }

  const addArrayItem = (path: Array<string | number>, field: ArrayField) => {
    const current = getValueAtPath(content, path)
    const nextArray = Array.isArray(current) ? [...current, createDefaultArrayItem(field)] : [createDefaultArrayItem(field)]
    updateAtPath(path, nextArray)
  }

  const removeArrayItem = (path: Array<string | number>, index: number, minRows?: number) => {
    const current = getValueAtPath(content, path)
    if (!Array.isArray(current)) return
    if (minRows && current.length <= minRows) return
    const nextArray = current.filter((_, idx) => idx !== index)
    updateAtPath(path, nextArray)
  }

  const renderField = (field: SchemaField, parentPath: Array<string | number>): React.ReactNode => {
    const fieldPath = [...parentPath, field.name]
    const key = fieldPath.join('.')
    const fieldLabel = field.label ?? humanizeLabel(field.name)
    const fieldDescription = field.description ?? field.admin?.description
    const currentValue = getValueAtPath(content, fieldPath)

    if (field.type === 'group') {
      return (
        <div key={key} className="page-content-editor__section">
          <Divider title={fieldLabel} />
          {renderFields(field.fields ?? [], fieldPath)}
        </div>
      )
    }

    if (field.type === 'array') {
      const items = Array.isArray(currentValue) ? currentValue : []

      return (
        <div key={key} className="page-content-editor__section">
          <Divider title={fieldLabel} />
          {items.map((item, index) => (
            <div key={`${key}.${index}`} className="page-content-editor__array-item">
              {renderFields(field.fields ?? [], [...fieldPath, index])}
              <button
                type="button"
                className="page-content-editor__remove"
                onClick={() => removeArrayItem(fieldPath, index, field.minRows)}
              >
                Αφαίρεση
              </button>
            </div>
          ))}
          <button type="button" className="page-content-editor__add" onClick={() => addArrayItem(fieldPath, field)}>
            Προσθήκη στοιχείου
          </button>
        </div>
      )
    }

    if (field.type === 'select') {
      return (
        <FieldRow key={key} label={fieldLabel} description={fieldDescription}>
          <select
            className="page-content-editor__input"
            value={currentValue ?? ''}
            onChange={(event) => updateAtPath(fieldPath, event.target.value)}
          >
            {field.required ? null : <option value="">—</option>}
            {(field.options ?? []).map((option) => (
              <option key={`${key}.${option.value}`} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </FieldRow>
      )
    }

    if (field.type === 'textarea') {
      return (
        <FieldRow key={key} label={fieldLabel} description={fieldDescription}>
          <TextArea
            value={currentValue ?? ''}
            onChange={(event) => updateAtPath(fieldPath, event.target.value)}
            placeholder={field.admin?.placeholder}
            rows={4}
          />
        </FieldRow>
      )
    }

    return (
      <FieldRow key={key} label={fieldLabel} description={fieldDescription}>
        <TextInput
          value={currentValue ?? ''}
          onChange={(event) => updateAtPath(fieldPath, event.target.value)}
          placeholder={field.admin?.placeholder}
          type={field.type === 'email' ? 'email' : field.type === 'number' ? 'number' : field.type === 'url' ? 'url' : 'text'}
        />
      </FieldRow>
    )
  }

  const renderFields = (fields: SchemaField[], parentPath: Array<string | number>) => {
    return (fields ?? []).map((field) => renderField(field, parentPath))
  }

  return (
    <div className="page-content-editor">
      {schema.groups.map((group) => (
        <div key={group.key} className={`${fieldBaseClass} page-content-editor__panel`}>
          <h3>{group.label ?? humanizeLabel(group.key)}</h3>
          {group.description && <p className="page-content-editor__description">{group.description}</p>}
          {renderFields(group.fields ?? [], [group.key])}
        </div>
      ))}
    </div>
  )
}

const JSONFallbackEditor: React.FC<{
  fieldState?: ReturnType<typeof useField<any>>
}> = ({ fieldState }) => {
  const configContext = useConfigSafe()
  const readonly = !fieldState || !configContext
  const [stringValue, setStringValue] = useState(() => JSON.stringify(fieldState?.value ?? {}, null, 2))
  const [parseError, setParseError] = useState<string | null>(null)

  useEffect(() => {
    setStringValue(JSON.stringify(fieldState?.value ?? {}, null, 2))
  }, [fieldState?.value])

  const handleChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    const nextString = event.target.value
    setStringValue(nextString)

    if (!fieldState) return

    try {
      const parsed = nextString.trim() === '' ? null : JSON.parse(nextString)
      fieldState.setValue(parsed)
      setParseError(null)
    } catch (error) {
      setParseError('Μη έγκυρο JSON. Ελέγξτε τη δομή πριν αποθηκεύσετε.')
    }
  }

  return (
    <div className={`${fieldBaseClass} page-content-editor__fallback`}>
      {parseError && <p className="page-content-editor__error">{parseError}</p>}
      <textarea
        className="page-content-editor__textarea"
        value={stringValue}
        readOnly={readonly}
        onChange={handleChange}
        rows={12}
      />
    </div>
  )
}

interface PageContentFieldInnerProps extends JSONFieldClientProps {
  fieldState: ReturnType<typeof useField<any>>
  pageTypeFieldState: ReturnType<typeof useField<RelationshipValue>>
}

const PageContentFieldInner: React.FC<PageContentFieldInnerProps> = ({ fieldState, pageTypeFieldState }) => {
  const { value, setValue, showError, errorMessage } = fieldState
  const { value: pageTypeValue } = pageTypeFieldState

  const [pageType, setPageType] = useState<PageTypeDoc | null>(null)
  const [loading, setLoading] = useState(false)
  const [loadError, setLoadError] = useState<string | null>(null)

  const pageTypeId = useMemo(() => normalizeRelationshipValue(pageTypeValue), [pageTypeValue])

  useEffect(() => {
    if (!pageTypeId) {
      setPageType(null)
      return
    }

    let cancelled = false
    setLoading(true)
    setLoadError(null)

    fetchPageType(pageTypeId)
      .then((doc) => {
        if (!cancelled) {
          setPageType(doc)
        }
      })
      .catch((error) => {
        if (!cancelled) {
          setLoadError((error as Error).message)
          setPageType(null)
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false)
        }
      })

    return () => {
      cancelled = true
    }
  }, [pageTypeId])

  if (!pageTypeId) {
    return (
      <div className={`${fieldBaseClass} page-content-editor__empty`}>
        <p>Επιλέξτε ένα Page Type για να εμφανιστούν τα πεδία περιεχομένου.</p>
        <JSONFallbackEditor fieldState={fieldState} />
      </div>
    )
  }

  if (loading) {
    return (
      <div className={`${fieldBaseClass} page-content-editor__empty`}>
        <p>Φόρτωση ρυθμίσεων περιεχομένου...</p>
      </div>
    )
  }

  if (loadError) {
    return (
      <div className={`${fieldBaseClass} page-content-editor__empty`}>
        <p>Αποτυχία φόρτωσης page type: {loadError}</p>
        <JSONFallbackEditor fieldState={fieldState} />
      </div>
    )
  }

  if (!pageType) {
    return <JSONFallbackEditor fieldState={fieldState} />
  }

  const schema = normalizePageTypeSchema(pageType.fields)

  if (!schema || schema.groups.length === 0) {
    return (
      <div className={`${fieldBaseClass} page-content-editor__fallback`}>
        {showError && errorMessage && <p className="page-content-editor__error">{errorMessage}</p>}
        <p>Δεν υπάρχει δυναμικός επεξεργαστής για το συγκεκριμένο page type. Χρησιμοποιήστε την JSON προβολή.</p>
        <JSONFallbackEditor fieldState={fieldState} />
      </div>
    )
  }

  return (
    <DynamicPageContentEditor
      schema={schema}
      value={value}
      onChange={(next) => {
        setValue(next)
      }}
    />
  )
}

const PageContentFieldWithContext: React.FC<JSONFieldClientProps> = (props) => {
  const fieldState = useField<any>({ path: props.path })
  const pageTypeFieldState = useField<RelationshipValue>({ path: 'pageType' })

  const configContext = useConfigSafe()

  if (!configContext?.config) {
    console.warn('[PageContentField] Config context unavailable, rendering JSON fallback.')
    return <JSONFallbackEditor fieldState={fieldState} />
  }

  return <PageContentFieldInner {...props} fieldState={fieldState} pageTypeFieldState={pageTypeFieldState} />
}

const PageContentFieldBase: React.FC<JSONFieldClientProps> = (props) => {
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  if (!isClient) return null

  return <PageContentFieldWithContext {...props} />
}

function useConfigSafe() {
  try {
    return useConfig()
  } catch {
    return undefined
  }
}

const PageContentField = PageContentFieldBase

export default PageContentField

