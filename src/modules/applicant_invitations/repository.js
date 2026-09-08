const { pgCore } = require('../../config/database')
const {
  parseStandardQuery,
  applyStandardFilters,
  buildCountQuery,
  formatSimplePaginatedResponse
} = require('../../utils/standard_query')

const TABLE_NAME = 'applicant_form_invitations'
const SELECT_COLUMNS = [
  'id',
  'full_name',
  'email',
  'no_mobile',
  'token',
  'token_expires_at',
  'is_completed',
  'completed_at',
  'applicant_form_id',
  'created_at',
  'created_by',
  'updated_at',
  'updated_by',
  'deleted_at',
  'deleted_by',
  'is_delete'
]
const ALLOWED_SORT_COLUMNS = ['created_at']
const SEARCHABLE_COLUMNS = ['full_name', 'email', 'no_mobile']
const ALLOWED_FILTER_COLUMNS = ['is_completed']

const normalizeNullableValue = (value) => {
  if (value === undefined || value === null) return null
  if (typeof value !== 'string') return value
  const normalized = value.trim()
  if (normalized === '' || normalized === 'null' || normalized === 'nan') return null
  return normalized
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

const findByToken = async (token) => {
  return await pgCore(TABLE_NAME)
    .select(SELECT_COLUMNS)
    .where({ token, deleted_at: null })
    .first()
}

const create = async (data = {}) => {
  const payload = {
    id: data.id,
    full_name: normalizeNullableValue(data.full_name),
    email: normalizeNullableValue(data.email),
    no_mobile: normalizeNullableValue(data.no_mobile),
    token: data.token,
    token_expires_at: data.token_expires_at,
    created_by: data.created_by || null,
    updated_by: data.created_by || null,
    created_at: pgCore.fn.now(),
    updated_at: pgCore.fn.now(),
    is_completed: false,
    is_delete: false
  }

  const [inserted] = await pgCore(TABLE_NAME).insert(payload).returning('id')
  return await findById(inserted.id)
}

const markCompleted = async (id, applicantFormId = null) => {
  const [updated] = await pgCore(TABLE_NAME)
    .where({ id, deleted_at: null })
    .update({
      is_completed: true,
      completed_at: pgCore.fn.now(),
      applicant_form_id: applicantFormId,
      updated_at: pgCore.fn.now()
    })
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
  findByToken,
  create,
  markCompleted,
  remove
}
