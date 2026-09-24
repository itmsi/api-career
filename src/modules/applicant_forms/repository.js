const { pgCore } = require('../../config/database')
const {
  parseStandardQuery,
  formatSimplePaginatedResponse
} = require('../../utils/standard_query')

const TABLE_NAME = 'applicant_forms'
const INVITATIONS_TABLE = 'applicant_form_invitations'
const EMPLOYEES_TABLE = 'gate_sso_employees'
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
  'applicant_form_files',
  'signature_link',
  'signature_date',
  'created_at',
  'created_by',
  'updated_at',
  'updated_by',
  'deleted_at',
  'deleted_by',
  'is_delete'
]
const ALLOWED_SORT_COLUMNS = ['created_at']
// Kolom pencarian di-qualify dengan alias tabel karena hasil query berasal dari join
// applicant_form_invitations (afi) LEFT JOIN applicant_forms (af)
const SEARCHABLE_COLUMNS = [
  'afi.full_name',
  'af.nickname',
  'afi.email',
  'afi.no_mobile',
  'af.id_number'
]
const ALLOWED_FILTER_COLUMNS = ['position_applied_for', 'city', 'marital_status', 'is_completed']
// Filter hanya relevan untuk data yang sudah mengisi applicant_forms, jadi di-qualify ke af.*
// is_completed adalah kolom milik applicant_form_invitations (afi)
const FILTER_COLUMN_MAP = {
  position_applied_for: 'af.position_applied_for',
  city: 'af.city',
  marital_status: 'af.marital_status',
  is_completed: 'afi.is_completed'
}
const BOOLEAN_FILTER_COLUMNS = ['is_completed']

const normalizeBooleanValue = (value) => {
  if (typeof value === 'boolean') return value
  if (typeof value === 'string') return ['true', '1'].includes(value.trim().toLowerCase())
  return Boolean(value)
}

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

// Base query: applicant_form_invitations di-LEFT JOIN ke applicant_forms via applicant_form_id
// (supaya undangan yang belum diisi applicant form-nya tetap muncul di listing), dan
// di-LEFT JOIN lagi ke gate_sso_employees (foreign table) untuk resolve nama pembuat undangan.
const buildJoinedQuery = () => {
  return pgCore(`${INVITATIONS_TABLE} as afi`)
    .leftJoin(`${TABLE_NAME} as af`, function () {
      this.on('af.id', '=', 'afi.applicant_form_id').andOnNull('af.deleted_at')
    })
    .leftJoin(`${EMPLOYEES_TABLE} as gse`, function () {
      this.on(pgCore.raw('gse.employee_id::text = afi.created_by'))
    })
    .where('afi.deleted_at', null)
}

// id yang ditampilkan ke klien: pakai applicant_form_id kalau form sudah diisi,
// kalau belum (applicant_form_id masih kosong) fallback ke id undangan itu sendiri.
const ID_COLUMN = pgCore.raw('coalesce(afi.applicant_form_id, afi.id) as id')

// Field dasar dari applicant_form_invitations + nama pembuat undangan, dipakai
// baik di listing maupun di detail.
const INVITATION_SELECT_COLUMNS = [
  ID_COLUMN,
  'afi.full_name as name',
  'afi.email as email',
  'afi.no_mobile as no_mobile',
  'afi.token as token',
  'afi.token_expires_at as token_expires_at',
  'afi.is_completed as is_completed',
  'afi.completed_at as completed_at',
  'afi.created_at as created_at',
  'gse.employee_name as created_by_name'
]

// Kolom applicant_forms yang ditampilkan apa adanya, di luar kolom yang sudah
// direpresentasikan lewat id/name/email/no_mobile (invitation) dan created_by_name (employee)
const REST_FORM_COLUMNS = SELECT_COLUMNS.filter((column) => ![
  'id',
  'full_name',
  'email',
  'no_mobile',
  'created_at',
  'created_by',
  'updated_at',
  'updated_by',
  'deleted_at',
  'deleted_by'
].includes(column))

// Listing: hanya sebagian kolom applicant_forms yang relevan buat tabel/list
const LIST_FORM_COLUMNS = ['position_applied_for', 'city', 'working_available_date']

const JOINED_SELECT_COLUMNS = [
  ...INVITATION_SELECT_COLUMNS,
  ...LIST_FORM_COLUMNS.map((column) => `af.${column} as ${column}`)
]

// Detail (GET /:id): semua kolom applicant_forms kecuali yang sudah direpresentasikan
// di atas dan kolom audit (deleted_at, updated_at, created_by, updated_by, deleted_by, created_at)
const DETAIL_SELECT_COLUMNS = [
  ...INVITATION_SELECT_COLUMNS,
  ...REST_FORM_COLUMNS.map((column) => `af.${column} as ${column}`)
]

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

  const applyJoinedFilters = (query) => {
    if (queryParams.search.searchTerm && SEARCHABLE_COLUMNS.length > 0) {
      query = query.where(function () {
        SEARCHABLE_COLUMNS.forEach((column, index) => {
          if (index === 0) {
            this.where(column, 'ilike', `%${queryParams.search.searchTerm}%`)
          } else {
            this.orWhere(column, 'ilike', `%${queryParams.search.searchTerm}%`)
          }
        })
      })
    }

    Object.keys(queryParams.filters).forEach((filterKey) => {
      let filterValue = queryParams.filters[filterKey]
      if (filterValue !== undefined && filterValue !== '') {
        if (BOOLEAN_FILTER_COLUMNS.includes(filterKey)) {
          filterValue = normalizeBooleanValue(filterValue)
        }
        query = query.where(FILTER_COLUMN_MAP[filterKey] || filterKey, filterValue)
      }
    })

    return query
  }

  const dataQuery = applyJoinedFilters(buildJoinedQuery().select(JOINED_SELECT_COLUMNS))
    // sort_by yang diizinkan saat ini hanya created_at -> pakai waktu undangan dibuat
    // sebagai acuan urutan karena tabel utama listing adalah applicant_form_invitations
    .orderBy('afi.created_at', queryParams.sorting.sortOrder)
    .limit(queryParams.pagination.limit)
    .offset(queryParams.pagination.offset)

  const data = await dataQuery

  const totalResult = await applyJoinedFilters(buildJoinedQuery())
    .count('afi.id as count')
    .first()

  const total = parseInt(totalResult?.count || 0, 10)

  return formatSimplePaginatedResponse(data, queryParams.pagination, total)
}

const findById = async (id) => {
  return await pgCore(TABLE_NAME)
    .select(SELECT_COLUMNS)
    .where({ id, deleted_at: null })
    .first()
}

// Dipakai oleh GET /applicant-forms/:id. Dicek dulu ke applicant_form_invitations.applicant_form_id,
// kalau tidak ketemu baru fallback ke applicant_form_invitations.id (id undangan).
const findDetailById = async (id) => {
  const byApplicantFormId = await buildJoinedQuery()
    .select(DETAIL_SELECT_COLUMNS)
    .andWhere('afi.applicant_form_id', id)
    .first()

  if (byApplicantFormId) return byApplicantFormId

  return await buildJoinedQuery()
    .select(DETAIL_SELECT_COLUMNS)
    .andWhere('afi.id', id)
    .first()
}

// Dipakai oleh PUT /applicant-forms/:id untuk menentukan :id itu id undangan atau
// id applicant_form: cek dulu applicant_form_invitations.id, baru fallback ke applicant_form_id.
const findInvitationById = async (id) => {
  return await pgCore(INVITATIONS_TABLE)
    .select(['id', 'applicant_form_id'])
    .where({ id, deleted_at: null })
    .first()
}

const findInvitationByApplicantFormId = async (applicantFormId) => {
  return await pgCore(INVITATIONS_TABLE)
    .select(['id', 'applicant_form_id'])
    .where({ applicant_form_id: applicantFormId, deleted_at: null })
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
    applicant_form_files: normalizeJsonValue(data.applicant_form_files),
    signature_link: normalizeNullableValue(data.signature_link),
    signature_date: normalizeNullableValue(data.signature_date),
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
    applicant_form_files: normalizeJsonValue(data.applicant_form_files),
    signature_link: normalizeNullableValue(data.signature_link),
    signature_date: normalizeNullableValue(data.signature_date),
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
  findDetailById,
  findInvitationById,
  findInvitationByApplicantFormId,
  create,
  update,
  remove
}
