const { pgCore } = require('../../config/database')
const {
  parseStandardQuery,
  applyStandardFilters,
  buildCountQuery,
  formatSimplePaginatedResponse
} = require('../../utils/standard_query')

const TABLE_NAME = 'applicant_form_contents'

const SELECT_COLUMNS = [
  'id',
  'file_title_video',
  'file_type_video',
  'file_name_video',
  'nextcloud_path_video',
  'file_link_video',
  'file_title_audio',
  'file_type_audio',
  'file_name_audio',
  'nextcloud_path_audio',
  'file_link_audio',
  'created_at',
  'created_by',
  'updated_at',
  'updated_by',
  'deleted_at',
  'deleted_by',
  'is_delete'
]

const CONTENT_COLUMNS = [
  'file_title_video',
  'file_type_video',
  'file_name_video',
  'nextcloud_path_video',
  'file_link_video',
  'file_title_audio',
  'file_type_audio',
  'file_name_audio',
  'nextcloud_path_audio',
  'file_link_audio'
]

const ALLOWED_SORT_COLUMNS = ['created_at']
const SEARCHABLE_COLUMNS = [
  'file_title_video',
  'file_type_video',
  'file_title_audio',
  'file_type_audio'
]

const pickContentColumns = (data = {}) =>
  CONTENT_COLUMNS.reduce((acc, column) => {
    acc[column] = data[column] ?? null
    return acc
  }, {})

const findAll = async (params = {}) => {
  const queryParams = parseStandardQuery(
    { body: params },
    {
      allowedColumns: ALLOWED_SORT_COLUMNS,
      defaultOrder: ['created_at', 'desc'],
      searchableColumns: SEARCHABLE_COLUMNS,
      fromBody: true
    }
  )

  const baseQuery = pgCore(TABLE_NAME)
    .select(SELECT_COLUMNS)
    .where({ deleted_at: null })

  const data = await applyStandardFilters(baseQuery, queryParams)

  const totalResult = await buildCountQuery(
    pgCore(TABLE_NAME).where({ deleted_at: null }),
    queryParams
  )
    .count('id as count')
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

const create = async (data = {}) => {
  const payload = {
    ...pickContentColumns(data),
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
    ...pickContentColumns(data),
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

  return !!updated?.id
}

module.exports = {
  findAll,
  findById,
  create,
  update,
  remove
}
