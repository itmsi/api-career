const { body, param } = require('express-validator')

// Batas panjang teks. Dipilih longgar supaya tidak mematahkan payload yang valid,
// tapi tetap mencegah field disalahgunakan untuk payload raksasa (DoS) atau
// menyimpan data yang jauh di luar wajar untuk sebuah nama/alamat/dll.
const MAX_SHORT = 100
const MAX_MEDIUM = 255
const MAX_LONG = 1000
const MAX_ARRAY_ITEMS = 30

// Hanya menolak karakter yang tidak wajar untuk nomor telepon/identitas
// (kutip, titik koma, tanda kurung siku, dll yang biasa dipakai payload
// injeksi), string kosong tetap valid karena field ini optional.
const PHONE_PATTERN = /^$|^[0-9+\-\s()]{1,20}$/
const ID_NUMBER_PATTERN = /^$|^[A-Za-z0-9\-\s]{1,30}$/
const TAX_ID_PATTERN = /^$|^[A-Za-z0-9.\-\s]{1,30}$/

const optionalString = (field, label, { max = MAX_MEDIUM } = {}) =>
  body(field)
    .optional({ nullable: true })
    .isString().withMessage(`${label} harus berupa teks`)
    .trim()
    .isLength({ max }).withMessage(`${label} maksimal ${max} karakter`)

const optionalPattern = (field, label, pattern, { max = MAX_SHORT } = {}) =>
  body(field)
    .optional({ nullable: true })
    .isString().withMessage(`${label} harus berupa teks`)
    .trim()
    .isLength({ max }).withMessage(`${label} maksimal ${max} karakter`)
    .matches(pattern).withMessage(`${label} mengandung format yang tidak valid`)

// Mencegah prototype pollution kalau isi array ini dipakai untuk operasi
// object-merge di tempat lain di kemudian hari.
const DANGEROUS_KEYS = ['__proto__', 'constructor', 'prototype']

const isPlainRecord = (item) =>
  typeof item === 'object' && item !== null && !Array.isArray(item) &&
  Object.keys(item).every((key) => !DANGEROUS_KEYS.includes(key))

const isSafeScalar = (value) => {
  if (value === null || value === undefined) return true
  if (typeof value === 'string') return value.length <= MAX_MEDIUM
  if (typeof value === 'number' || typeof value === 'boolean') return true
  return false
}

// Membatasi item array supaya hanya berupa object datar dengan key yang
// dikenal dan value berupa scalar (bukan nested object/array), supaya
// struktur payload yang sudah ada (lihat contoh request) tetap diterima
// apa adanya, tapi item liar/berlebihan/bernested ditolak.
const arrayOfRecords = (field, label, allowedKeys, { maxItems = MAX_ARRAY_ITEMS } = {}) =>
  body(field)
    .optional({ nullable: true })
    .isArray({ max: maxItems }).withMessage(`${label} harus berupa array dengan maksimal ${maxItems} item`)
    .custom((items) => {
      if (!Array.isArray(items)) return true
      const valid = items.every((item) => {
        if (!isPlainRecord(item)) return false
        return Object.entries(item).every(
          ([key, value]) => allowedKeys.includes(key) && isSafeScalar(value)
        )
      })
      if (!valid) {
        throw new Error(`${label} memiliki struktur atau nilai item yang tidak valid`)
      }
      return true
    })

const createValidation = [
  optionalString('full_name', 'full_name'),
  optionalString('nickname', 'nickname', { max: MAX_SHORT }),
  optionalPattern('no_mobile', 'no_mobile', PHONE_PATTERN),
  optionalString('name_relationship_emergency_contact_number', 'name_relationship_emergency_contact_number', { max: MAX_SHORT }),
  body('email').optional({ nullable: true }).isEmail().withMessage('email harus valid').isLength({ max: MAX_MEDIUM }).withMessage('email maksimal 255 karakter'),
  optionalPattern('id_number', 'id_number', ID_NUMBER_PATTERN),
  optionalString('position_applied_for', 'position_applied_for', { max: MAX_SHORT }),
  optionalString('marital_status', 'marital_status', { max: MAX_SHORT }),
  optionalString('height_weight', 'height_weight', { max: MAX_SHORT }),
  arrayOfRecords('driver_license', 'driver_license', ['name']),
  optionalString('address_as_per_id_card', 'address_as_per_id_card', { max: MAX_LONG }),
  optionalString('present_address', 'present_address', { max: MAX_LONG }),
  optionalString('city', 'city', { max: MAX_SHORT }),
  optionalString('place_date_of_birth', 'place_date_of_birth', { max: MAX_SHORT }),
  optionalString('blood_type', 'blood_type', { max: MAX_SHORT }),
  optionalPattern('tax_identification_number', 'tax_identification_number', TAX_ID_PATTERN),
  body('working_available_date').optional({ nullable: true }).isDate().withMessage('working_available_date harus berupa tanggal yang valid'),
  optionalString('relogion', 'relogion', { max: MAX_SHORT }),
  optionalString('tshirt_size', 'tshirt_size', { max: MAX_SHORT }),
  arrayOfRecords('educational_background', 'educational_background', [
    'type_of_school', 'name_of_school', 'location', 'graduate', 'major', 'graduation_year'
  ]),
  arrayOfRecords('informal_education_special_qualification', 'informal_education_special_qualification', [
    'type_of_training', 'institution_name', 'location', 'certification', 'periode'
  ]),
  arrayOfRecords('family_background', 'family_background', [
    'relationship', 'name', 'age', 'employment', 'emergency_contact_number'
  ]),
  arrayOfRecords('working_experiences', 'working_experiences', [
    'name_of_company', 'date_from', 'date_final', 'pay_of_salary', 'name_of_supervisor', 'reason_of_leaving'
  ]),
  arrayOfRecords('references_old_company', 'references_old_company', [
    'name', 'position_company', 'phone'
  ]),
  arrayOfRecords('following_answers', 'following_answers', [
    'question', 'answers'
  ]),
  arrayOfRecords('applicant_form_files', 'applicant_form_files', [
    'file_title', 'file_type', 'file'
  ]),
  optionalString('signature_link', 'signature_link', { max: MAX_LONG }),
  body('signature_date').optional({ nullable: true }).isDate().withMessage('signature_date harus berupa tanggal yang valid'),
  body('is_delete').optional().isBoolean().withMessage('is_delete harus boolean')
]

const updateValidation = [
  param('id').notEmpty().withMessage('ID wajib diisi').isUUID().withMessage('Format ID tidak valid'),
  ...createValidation
]

const getByIdValidation = [
  param('id').notEmpty().withMessage('ID wajib diisi').isUUID().withMessage('Format ID tidak valid')
]

const getListValidation = [
  body('page').optional().isInt({ min: 1 }).withMessage('Page harus berupa angka positif'),
  body('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit harus antara 1-100'),
  body('search').optional().isString().withMessage('Search harus berupa teks'),
  body('sort_by').optional().isIn(['created_at']).withMessage('sort_by tidak valid'),
  body('sort_order').optional().isIn(['asc', 'desc']).withMessage('sort_order harus asc atau desc'),
  body('position_applied_for').optional().isString().withMessage('position_applied_for harus berupa teks'),
  body('city').optional().isString().withMessage('city harus berupa teks'),
  body('marital_status').optional().isString().withMessage('marital_status harus berupa teks')
]

module.exports = {
  createValidation,
  updateValidation,
  getByIdValidation,
  getListValidation
}
