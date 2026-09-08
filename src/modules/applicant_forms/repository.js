const { pgCore } = require('../../config/database')
const {
  parseStandardQuery,
  applyStandardFilters,
  buildCountQuery,
  formatSimplePaginatedResponse
} = require('../../utils/standard_query')

const TABLE_NAME = 'applicant_forms'
const SELECT_COLUMNS = [
  'id',
  'full_name',
  'nickname',
  'no_mobile',
  'name_relationship_emergency_contact_number',
  'email',
  'id_number',
  'position_applied_for',
  'marital_status',
  'height_weight',
  'driver_license',
  'address_as_per_id_card',
  'present_address',
  'city',
  'place_date_of_birth',
  'blood_type',
  'tax_identification_number',
  'working_available_date',
  'relogion',
  'tshirt_size',
  'educational_background',
  'informal_education_special_qualification',
  'family_background',
  'working_experiences',
  'references_old_company',
  'following_answers',
  'created_at',
  'created_by',
  'updated_at',
  'updated_by',
  'deleted_at',
  'deleted_by',
  'is_delete'
]
const ALLOWED_SORT_COLUMNS = ['created_at']
const SEARCHABLE_COLUMNS = ['full_name', 'nickname', 'email', 'no_mobile', 'id_number']
const ALLOWED_FILTER_COLUMNS = ['position_applied_for', 'city', 'marital_status']

const normalizeFilterValue = (value) => {
  if (value === undefined || value === null) return undefined
  if (typeof value !== 'string') return value
  const normalized = value.trim().toLowerCase()
  if (normalized === '' || normalized === 'null' || normalized === 'nan') return undefined
  return value
}

const normalizeNullableValue = (value) => {
  if (value === undefined || value === null) return null
  if (typeof value !== 'string') return value
  const normalized = value.trim()
  if (normalized === '' || normalized === 'null' || normalized === 'nan') return null
  return normalized
}

const normalizeJsonValue = (value) => {
  if (value === undefined || value === null) return null
  return JSON.stringify(value)
}

const findAll = async (params = {}) => {
  const queryParams = parseStandardQuery(
    { body: params },
    {
      allowedColumns: ALLOWED_SORT_COLUMNS,
      defaultOrder: ['created_at', 'desc'],
      searchableColumns: SEARCHABLE_COLUMNS,
      allowedFilters: ALLOWED_FILTER_COLUMNS,
      fromBody: true
    }
  )

  Object.keys(queryParams.filters).forEach((key) => {
    queryParams.filters[key] = normalizeFilterValue(queryParams.filters[key])
  })

  const baseQuery = pgCore(TABLE_NAME)
    .select(SELECT_COLUMNS)
    .where({ deleted_at: null })

  const filteredQuery = applyStandardFilters(baseQuery, queryParams)
  const data = await filteredQuery

  const totalQuery = buildCountQuery(
    pgCore(TABLE_NAME).where({ deleted_at: null }),
    queryParams
  )
    .count('id as count')
    .first()

  const totalResult = await totalQuery
  const total = parseInt(totalResult?.count || 0, 10)

  return formatSimplePaginatedResponse(data, queryParams.pagination, total)
}

const findById = async (id) => {
  return await pgCore(TABLE_NAME)
    .select(SELECT_COLUMNS)
    .where({ id, deleted_at: null })
    .first()
}

const create = async (data = {}) => {
  const payload = {
    full_name: normalizeNullableValue(data.full_name),
    nickname: normalizeNullableValue(data.nickname),
    no_mobile: normalizeNullableValue(data.no_mobile),
    name_relationship_emergency_contact_number: normalizeNullableValue(data.name_relationship_emergency_contact_number),
    email: normalizeNullableValue(data.email),
    id_number: normalizeNullableValue(data.id_number),
    position_applied_for: normalizeNullableValue(data.position_applied_for),
    marital_status: normalizeNullableValue(data.marital_status),
    height_weight: normalizeNullableValue(data.height_weight),
    driver_license: normalizeJsonValue(data.driver_license),
    address_as_per_id_card: normalizeNullableValue(data.address_as_per_id_card),
    present_address: normalizeNullableValue(data.present_address),
    city: normalizeNullableValue(data.city),
    place_date_of_birth: normalizeNullableValue(data.place_date_of_birth),
    blood_type: normalizeNullableValue(data.blood_type),
    tax_identification_number: normalizeNullableValue(data.tax_identification_number),
    working_available_date: normalizeNullableValue(data.working_available_date),
    relogion: normalizeNullableValue(data.relogion),
    tshirt_size: normalizeNullableValue(data.tshirt_size),
    educational_background: normalizeJsonValue(data.educational_background),
    informal_education_special_qualification: normalizeJsonValue(data.informal_education_special_qualification),
    family_background: normalizeJsonValue(data.family_background),
    working_experiences: normalizeJsonValue(data.working_experiences),
    references_old_company: normalizeJsonValue(data.references_old_company),
    following_answers: normalizeJsonValue(data.following_answers),
    created_by: data.created_by || null,
    updated_by: data.updated_by || null,
    created_at: pgCore.fn.now(),
    updated_at: pgCore.fn.now(),
    is_delete: false
  }

  const [inserted] = await pgCore(TABLE_NAME).insert(payload).returning('id')
  return await findById(inserted.id)
}

const update = async (id, data = {}) => {
  const payload = {
    full_name: normalizeNullableValue(data.full_name),
    nickname: normalizeNullableValue(data.nickname),
    no_mobile: normalizeNullableValue(data.no_mobile),
    name_relationship_emergency_contact_number: normalizeNullableValue(data.name_relationship_emergency_contact_number),
    email: normalizeNullableValue(data.email),
    id_number: normalizeNullableValue(data.id_number),
    position_applied_for: normalizeNullableValue(data.position_applied_for),
    marital_status: normalizeNullableValue(data.marital_status),
    height_weight: normalizeNullableValue(data.height_weight),
    driver_license: normalizeJsonValue(data.driver_license),
    address_as_per_id_card: normalizeNullableValue(data.address_as_per_id_card),
    present_address: normalizeNullableValue(data.present_address),
    city: normalizeNullableValue(data.city),
    place_date_of_birth: normalizeNullableValue(data.place_date_of_birth),
    blood_type: normalizeNullableValue(data.blood_type),
    tax_identification_number: normalizeNullableValue(data.tax_identification_number),
    working_available_date: normalizeNullableValue(data.working_available_date),
    relogion: normalizeNullableValue(data.relogion),
    tshirt_size: normalizeNullableValue(data.tshirt_size),
    educational_background: normalizeJsonValue(data.educational_background),
    informal_education_special_qualification: normalizeJsonValue(data.informal_education_special_qualification),
    family_background: normalizeJsonValue(data.family_background),
    working_experiences: normalizeJsonValue(data.working_experiences),
    references_old_company: normalizeJsonValue(data.references_old_company),
    following_answers: normalizeJsonValue(data.following_answers),
    updated_by: data.updated_by || null,
    updated_at: pgCore.fn.now()
  }

  const [updated] = await pgCore(TABLE_NAME)
    .where({ id, deleted_at: null })
    .update(payload)
    .returning('id')

  if (!updated?.id) return null
  return await findById(updated.id)
}

const remove = async (id, deletedBy) => {
  const [updated] = await pgCore(TABLE_NAME)
    .where({ id, deleted_at: null })
    .update({
      deleted_at: pgCore.fn.now(),
      deleted_by: deletedBy,
      updated_at: pgCore.fn.now(),
      is_delete: true
    })
    .returning('id')

  if (!updated?.id) return null

  return await pgCore(TABLE_NAME)
    .select(SELECT_COLUMNS)
    .where({ id: updated.id })
    .first()
}

module.exports = {
  findAll,
  findById,
  create,
  update,
  remove
}
