const { pgCore } = require("../../config/database");
const {
  parseStandardQuery,
  applyStandardFilters,
  buildCountQuery,
  formatSimplePaginatedResponse,
} = require("../../utils/standard_query");

const TABLE_NAME = "db_hrm_master_questions";
const SELECT_COLUMNS = [
  "id",
  "question_id",
  "question_en",
  "question_cn",
  "focus_assessment",
  "step",
  "created_at",
  "created_by",
  "updated_at",
  "updated_by",
  "deleted_at",
  "deleted_by",
];
const ALLOWED_SORT_COLUMNS = [
  "created_at",
  "question_id",
  "question_en",
  "focus_assessment",
  "step",
];
const SEARCHABLE_COLUMNS = [
  "question_id",
  "question_en",
  "question_cn",
  "focus_assessment",
  "step",
];

const findAll = async (params = {}) => {
  const queryParams = parseStandardQuery(
    { body: params },
    {
      allowedColumns: ALLOWED_SORT_COLUMNS,
      defaultOrder: ["created_at", "desc"],
      searchableColumns: SEARCHABLE_COLUMNS,
      fromBody: true,
    },
  );

  const baseQuery = pgCore(TABLE_NAME)
    .select(SELECT_COLUMNS)
    .where({ deleted_at: null });

  const data = await applyStandardFilters(baseQuery, queryParams);

  const totalResult = await buildCountQuery(
    pgCore(TABLE_NAME).where({ deleted_at: null }),
    queryParams,
  )
    .count("id as count")
    .first();

  const total = parseInt(totalResult?.count || 0, 10);

  return formatSimplePaginatedResponse(data, queryParams.pagination, total);
};

const findById = async (id) => {
  return await pgCore(TABLE_NAME)
    .select(SELECT_COLUMNS)
    .where({ id, deleted_at: null })
    .first();
};

const findByIds = async (ids = []) => {
  if (ids.length === 0) return [];
  return await pgCore(TABLE_NAME)
    .select(SELECT_COLUMNS)
    .whereIn("id", ids)
    .where({ deleted_at: null });
};

module.exports = {
  findAll,
  findById,
  findByIds,
};
