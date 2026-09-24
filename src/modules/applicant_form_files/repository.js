const { pgCore } = require('../../config/database')
const {
  parseStandardQuery,
  formatSimplePaginatedResponse
} = require('../../utils/standard_query')

const TABLE_NAME = 'applicant_form_files'

const SELECT_COLUMNS = [
  'id',
  'file_title',
  'file_type',
  'file_name',
  'nextcloud_path',
  'file_link',
  'created_at',
  'created_by',
  'updated_at',
  'updated_by',
  'deleted_at',
  'deleted_by',
  'is_delete'
]

const ALLOWED_SORT_COLUMNS = ['created_at']

const findAll = async (params = {}) => {
  const queryParams = parseStandardQuery(
    { body: params },
    {
      allowedColumns: ALLOWED_SORT_COLUMNS,
      defaultOrder: ['created_at', 'desc'],
      fromBody: true
    }
  )

  const baseQuery = () => pgCore(TABLE_NAME).where({ deleted_at: null })

  const data = await baseQuery()
    .select(SELECT_COLUMNS)
    .orderBy('created_at', queryParams.sorting.sortOrder)
    .limit(queryParams.pagination.limit)
    .offset(queryParams.pagination.offset)

  const totalResult = await baseQuery().count('id as count').first()
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
    file_title: data.file_title,
    file_type: data.file_type,
    file_name: data.file_name,
    nextcloud_path: data.nextcloud_path,
    file_link: data.file_link,
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
    file_title: data.file_title,
    file_type: data.file_type,
    file_name: data.file_name,
    nextcloud_path: data.nextcloud_path,
    file_link: data.file_link,
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
  return await findById(updated.id)
}

module.exports = {
  findAll,
  findById,
  create,
  update,
  remove
}
