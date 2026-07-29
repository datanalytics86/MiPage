import { describe, it, expect } from 'vitest'
import {
  validateFieldKey,
  validateMetadataValues,
  DEFAULT_METADATA_FIELDS,
} from '../metadataFields'

describe('metadataFields', () => {
  it('validates snake_case keys', () => {
    expect(validateFieldKey('years_experience').ok).toBe(true)
    expect(validateFieldKey('1bad').ok).toBe(false)
    expect(validateFieldKey('Bad-Key').ok).toBe(false)
  })

  it('requires years_experience for all categories', () => {
    const r = validateMetadataValues(DEFAULT_METADATA_FIELDS, {}, 'masajes')
    expect(r.ok).toBe(false)
    expect(r.errors.years_experience).toBeTruthy()
  })

  it('accepts valid values', () => {
    const r = validateMetadataValues(
      DEFAULT_METADATA_FIELDS,
      { years_experience: 5, certifications: 'Cert A' },
      'masajes'
    )
    expect(r.ok).toBe(true)
  })

  it('rejects invalid select option for modelaje', () => {
    const r = validateMetadataValues(
      DEFAULT_METADATA_FIELDS,
      { years_experience: 2, eye_color: 'Violeta' },
      'modelaje'
    )
    expect(r.ok).toBe(false)
    expect(r.errors.eye_color).toBeTruthy()
  })

  it('rejects non-number for number fields', () => {
    const r = validateMetadataValues(
      DEFAULT_METADATA_FIELDS,
      { years_experience: 'abc' },
      'masajes'
    )
    expect(r.ok).toBe(false)
  })

  it('rejects invalid phone and url', () => {
    const fields = [
      ...DEFAULT_METADATA_FIELDS,
      {
        id: 'p',
        key: 'phone',
        label: 'Tel',
        field_type: 'phone' as const,
        category: 'contacto' as const,
        options: null,
        is_required: true,
        is_active: true,
        sort_order: 9,
        applies_to: ['*'],
        help_text: null,
      },
      {
        id: 'u',
        key: 'web',
        label: 'Web',
        field_type: 'url' as const,
        category: 'contacto' as const,
        options: null,
        is_required: true,
        is_active: true,
        sort_order: 10,
        applies_to: ['*'],
        help_text: null,
      },
    ]
    const r = validateMetadataValues(
      fields,
      { years_experience: 1, phone: 'xx', web: 'not-a-url' },
      'masajes'
    )
    expect(r.errors.phone).toBeTruthy()
    expect(r.errors.web).toBeTruthy()
  })
})
