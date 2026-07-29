import { z } from 'zod'

export type MetadataFieldType =
  | 'text'
  | 'textarea'
  | 'number'
  | 'select'
  | 'multiselect'
  | 'checkbox'
  | 'url'
  | 'phone'

export type MetadataFieldCategory =
  | 'personal'
  | 'fisica'
  | 'servicio'
  | 'contacto'
  | 'otros'

export interface MetadataFieldDef {
  id: string
  key: string
  label: string
  field_type: MetadataFieldType
  category: MetadataFieldCategory
  options: string[] | null
  is_required: boolean
  is_active: boolean
  sort_order: number
  applies_to: string[] // categories: masajes, modelaje, or ['*']
  help_text: string | null
}

export type MetadataValues = Record<string, string | number | boolean | string[] | null>

const keySchema = z
  .string()
  .min(2)
  .max(64)
  .regex(/^[a-z][a-z0-9_]*$/, 'key must be snake_case starting with a letter')

export function validateFieldKey(key: string): { ok: boolean; message?: string } {
  const r = keySchema.safeParse(key)
  if (!r.success) return { ok: false, message: r.error.errors[0]?.message }
  return { ok: true }
}

export function validateMetadataValues(
  fields: MetadataFieldDef[],
  values: MetadataValues,
  providerCategory?: string
): { ok: boolean; errors: Record<string, string> } {
  const errors: Record<string, string> = {}
  const applicable = fields.filter((f) => {
    if (!f.is_active) return false
    if (!providerCategory) return true
    return f.applies_to.includes('*') || f.applies_to.includes(providerCategory)
  })

  for (const field of applicable) {
    const raw = values[field.key]
    const empty =
      raw === null ||
      raw === undefined ||
      raw === '' ||
      (Array.isArray(raw) && raw.length === 0)

    if (field.is_required && empty) {
      errors[field.key] = `${field.label} es obligatorio`
      continue
    }
    if (empty) continue

    switch (field.field_type) {
      case 'number': {
        const n = typeof raw === 'number' ? raw : Number(raw)
        if (Number.isNaN(n)) errors[field.key] = 'Debe ser un número'
        break
      }
      case 'checkbox': {
        if (typeof raw !== 'boolean' && raw !== 'true' && raw !== 'false') {
          errors[field.key] = 'Valor inválido'
        }
        break
      }
      case 'select': {
        if (field.options?.length && !field.options.includes(String(raw))) {
          errors[field.key] = 'Opción no válida'
        }
        break
      }
      case 'multiselect': {
        if (!Array.isArray(raw)) {
          errors[field.key] = 'Debe ser una lista'
        } else if (field.options?.length && raw.some((v) => !field.options!.includes(String(v)))) {
          errors[field.key] = 'Contiene opciones inválidas'
        }
        break
      }
      case 'url': {
        try {
          // eslint-disable-next-line no-new
          new URL(String(raw))
        } catch {
          errors[field.key] = 'URL inválida'
        }
        break
      }
      case 'phone': {
        if (!/^\+?[\d\s-]{8,20}$/.test(String(raw))) {
          errors[field.key] = 'Teléfono inválido'
        }
        break
      }
      default:
        if (String(raw).length > 2000) errors[field.key] = 'Texto demasiado largo'
    }
  }

  return { ok: Object.keys(errors).length === 0, errors }
}

/** Built-in seed fields when DB table is empty (dev/demo) */
export const DEFAULT_METADATA_FIELDS: MetadataFieldDef[] = [
  {
    id: 'local-eyes',
    key: 'eye_color',
    label: 'Color de ojos',
    field_type: 'select',
    category: 'fisica',
    options: ['Café', 'Verde', 'Azul', 'Negro', 'Otro'],
    is_required: false,
    is_active: true,
    sort_order: 1,
    applies_to: ['modelaje'],
    help_text: null,
  },
  {
    id: 'local-hair',
    key: 'hair_color',
    label: 'Color de cabello',
    field_type: 'select',
    category: 'fisica',
    options: ['Negro', 'Castaño', 'Rubio', 'Rojo', 'Otro'],
    is_required: false,
    is_active: true,
    sort_order: 2,
    applies_to: ['modelaje'],
    help_text: null,
  },
  {
    id: 'local-exp',
    key: 'years_experience',
    label: 'Años de experiencia',
    field_type: 'number',
    category: 'servicio',
    options: null,
    is_required: true,
    is_active: true,
    sort_order: 3,
    applies_to: ['*'],
    help_text: 'Número entero de años',
  },
  {
    id: 'local-cert',
    key: 'certifications',
    label: 'Certificaciones',
    field_type: 'textarea',
    category: 'servicio',
    options: null,
    is_required: false,
    is_active: true,
    sort_order: 4,
    applies_to: ['masajes'],
    help_text: null,
  },
]
