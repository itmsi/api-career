const { pgCore } = require("../../config/database");
const {
  parseStandardQuery,
  applyStandardFilters,
  buildCountQuery,
  formatSimplePaginatedResponse,
} = require("../../utils/standard_query");

const TABLE_NAME = "applicant_form_contents";

const SELECT_COLUMNS = [
  "id",
  "applicant_form_id",
  "id_question",
  "file_title_video",
  "file_type_video",
  "file_name_video",
  "nextcloud_path_video",
  "file_link_video",
  "file_title_audio",
  "file_type_audio",
  "file_name_audio",
  "nextcloud_path_audio",
  "file_link_audio",
  "speech_text",
  "status_speech_text",
  "message_speech_text",
  "transcription_id",
  "summary",
  "summary_update",
  "status_summary",
  "message_summary",
  "step",
  "questions",
  "created_at",
  "created_by",
  "updated_at",
  "updated_by",
  "deleted_at",
  "deleted_by",
  "is_delete",
];

const CONTENT_COLUMNS = [
  "applicant_form_id",
  "id_question",
  "file_title_video",
  "file_type_video",
  "file_name_video",
  "nextcloud_path_video",
  "file_link_video",
  "file_title_audio",
  "file_type_audio",
  "file_name_audio",
  "nextcloud_path_audio",
  "file_link_audio",
  "speech_text",
  "questions",
];

// Semua kolom yang di-select bisa dipakai sort_by. Kolom di luar daftar ini
// otomatis kembali ke created_at (lihat parseSorting)
const ALLOWED_SORT_COLUMNS = SELECT_COLUMNS;
const SEARCHABLE_COLUMNS = [
  "file_title_video",
  "file_type_video",
  "file_title_audio",
  "file_type_audio",
];

const ALLOWED_FILTERS = ["applicant_form_id"];

// Nilai kosong ("", "null", "nan", null) dianggap tidak memfilter
const normalizeFilterValue = (value) => {
  if (value === undefined || value === null) return undefined;
  if (typeof value !== "string") return value;
  const trimmed = value.trim();
  if (["", "null", "nan"].includes(trimmed.toLowerCase())) return undefined;
  return trimmed;
};

// Kolom jsonb harus dikirim sebagai string JSON, karena array JS akan
// dikonversi knex/pg menjadi array postgres
const JSON_COLUMNS = ["questions"];

const pickContentColumns = (data = {}) =>
  CONTENT_COLUMNS.reduce((acc, column) => {
    const value = data[column] ?? null;
    acc[column] =
      JSON_COLUMNS.includes(column) && value !== null && typeof value !== "string"
        ? JSON.stringify(value)
        : value;
    return acc;
  }, {});

const findAll = async (params = {}) => {
  const queryParams = parseStandardQuery(
    {
      body: {
        ...params,
        applicant_form_id: normalizeFilterValue(params.applicant_form_id),
      },
    },
    {
      allowedColumns: ALLOWED_SORT_COLUMNS,
      defaultOrder: ["created_at", "desc"],
      searchableColumns: SEARCHABLE_COLUMNS,
      allowedFilters: ALLOWED_FILTERS,
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

// Dipakai GET /audio/:file_link_audio: bisa berupa link lengkap atau token share
// (contoh: 4M6jZtj3FgWH38D dari https://cloud.motorsights.com/s/4M6jZtj3FgWH38D)
const findByAudioLink = async (fileLinkAudio) => {
  return await pgCore(TABLE_NAME)
    .select(SELECT_COLUMNS)
    .where({ deleted_at: null })
    .andWhere((qb) => {
      qb.where("file_link_audio", fileLinkAudio).orWhere(
        "file_link_audio",
        "like",
        `%/s/${fileLinkAudio}`,
      );
    })
    .orderBy("created_at", "desc")
    .first();
};

const create = async (data = {}) => {
  const payload = {
    ...pickContentColumns(data),
    created_by: data.created_by || null,
    updated_by: data.updated_by || null,
    created_at: pgCore.fn.now(),
    updated_at: pgCore.fn.now(),
    is_delete: false,
  };

  const [inserted] = await pgCore(TABLE_NAME).insert(payload).returning("id");
  return await findById(inserted.id);
};

const update = async (id, data = {}) => {
  const payload = {
    ...pickContentColumns(data),
    updated_by: data.updated_by || null,
    updated_at: pgCore.fn.now(),
  };

  const [updated] = await pgCore(TABLE_NAME)
    .where({ id, deleted_at: null })
    .update(payload)
    .returning("id");

  if (!updated?.id) return null;
  return await findById(updated.id);
};

// Dipakai POST /update-stt: update hasil speech to text untuk semua content
// yang file_link_audio-nya sama
const updateSpeechTextByAudioLink = async (fileLinkAudio, data = {}) => {
  const updated = await pgCore(TABLE_NAME)
    .where({ file_link_audio: fileLinkAudio, deleted_at: null })
    .update({
      ...data,
      updated_at: pgCore.fn.now(),
    })
    .returning(SELECT_COLUMNS);

  return updated;
};

// Dipakai POST /audio/:file_link_audio: update status speech to text satu content
const updateSpeechTextById = async (id, data = {}) => {
  const [updated] = await pgCore(TABLE_NAME)
    .where({ id, deleted_at: null })
    .update({
      ...data,
      updated_at: pgCore.fn.now(),
    })
    .returning(SELECT_COLUMNS);

  return updated || null;
};

const remove = async (id, deletedBy) => {
  const [updated] = await pgCore(TABLE_NAME)
    .where({ id, deleted_at: null })
    .update({
      deleted_at: pgCore.fn.now(),
      deleted_by: deletedBy,
      updated_at: pgCore.fn.now(),
      is_delete: true,
    })
    .returning("id");

  return !!updated?.id;
};

module.exports = {
  findAll,
  findById,
  findByAudioLink,
  create,
  update,
  updateSpeechTextByAudioLink,
  updateSpeechTextById,
  remove,
};
