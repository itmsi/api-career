/**
 * Ambil hasil penilaian AI dari JSON di summary_update dan petakan ke kolom
 * applicant_form_contents. Teks yang bukan JSON penilaian (mis. ringkasan lama
 * atau hasil edit manual) menghasilkan semua kolom null.
 */

const RATINGS = ["Strong", "Good", "Consider", "Concern"];
const RELEVANCES = ["relevant", "partially_relevant", "off_topic"];
const CONFIDENCES = ["high", "medium", "low"];
const STAR_KEYS = ["situation", "task", "action", "result"];
const MAX_SCORE = 5;

// Kolom yang diisi dari JSON penilaian (dipakai untuk select dan response)
const SUMMARY_RESULT_COLUMNS = [
  "summary_score",
  "summary_rating",
  "summary_answer_relevance",
  "summary_for_hr",
  "summary_assessment_focus",
  "summary_star",
  "summary_dimensions",
  "summary_strengths",
  "summary_development_areas",
  "summary_red_flags",
  "summary_follow_up_questions",
];

const toScore = (value) => {
  const number =
    typeof value === "string" ? Number(value.trim().replace(",", ".")) : value;
  if (typeof number !== "number" || !Number.isFinite(number)) return null;
  if (number < 0 || number > MAX_SCORE) return null;
  return Math.round(number * 100) / 100;
};

const toEnum = (value, allowed) => {
  if (typeof value !== "string") return null;
  const key = value.trim().toLowerCase();
  return allowed.find((item) => item.toLowerCase() === key) ?? null;
};

const toText = (value) =>
  typeof value === "string" && value.trim() !== "" ? value.trim() : null;

// Array string; elemen kosong/bukan string dibuang. [] tetap [] (artinya "tidak ada")
const toStringList = (value) => {
  if (!Array.isArray(value)) return null;
  return value.map(toText).filter(Boolean);
};

const toStar = (value) => {
  if (!value || typeof value !== "object") return null;
  return Object.fromEntries(STAR_KEYS.map((key) => [key, value[key] === true]));
};

const toDimensions = (value) => {
  if (!Array.isArray(value)) return null;
  return value
    .filter((item) => item && typeof item === "object" && toText(item.name))
    .map((item) => ({
      name: toText(item.name),
      score: toScore(item.score),
      confidence: toEnum(item.confidence, CONFIDENCES),
      evidence: toStringList(item.evidence) ?? [],
      reasoning: toText(item.reasoning),
    }));
};

// Model kadang membungkus JSON dengan ```json ... ``` atau kalimat pembuka
const extractJson = (text) => {
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start === -1 || end <= start) return null;
  try {
    return JSON.parse(text.slice(start, end + 1));
  } catch {
    return null;
  }
};

const emptyResult = () =>
  Object.fromEntries(SUMMARY_RESULT_COLUMNS.map((column) => [column, null]));

// Kolom jsonb harus dikirim sebagai string JSON; array biasa dibaca driver sebagai array Postgres
const JSON_COLUMNS = [
  "summary_assessment_focus",
  "summary_star",
  "summary_dimensions",
  "summary_strengths",
  "summary_development_areas",
  "summary_red_flags",
  "summary_follow_up_questions",
];

const parseSummaryResult = (summaryText) => {
  const result = emptyResult();
  if (typeof summaryText !== "string" || summaryText.trim() === "") return result;

  const parsed = extractJson(summaryText);
  if (!parsed || typeof parsed !== "object") return result;

  // Bukan JSON penilaian kalau tidak ada skor maupun dimensi
  const score = toScore(parsed.weighted_score);
  const dimensions = toDimensions(parsed.dimensions);
  if (score === null && !(dimensions && dimensions.length)) return result;

  Object.assign(result, {
    summary_score: score,
    summary_rating: toEnum(parsed.rating, RATINGS),
    summary_answer_relevance: toEnum(parsed.answer_relevance, RELEVANCES),
    summary_for_hr: toText(parsed.summary_for_hr),
    summary_assessment_focus: toStringList(parsed.assessment_focus),
    summary_star: toStar(parsed.star_completeness),
    summary_dimensions: dimensions,
    summary_strengths: toStringList(parsed.strengths),
    summary_development_areas: toStringList(parsed.development_areas),
    summary_red_flags: toStringList(parsed.red_flags),
    summary_follow_up_questions: toStringList(parsed.follow_up_questions),
  });
  return result;
};

// Siap dipakai di knex update: kolom jsonb di-stringify, null tetap null
const toSummaryColumns = (summaryText) => {
  const result = parseSummaryResult(summaryText);
  for (const column of JSON_COLUMNS) {
    if (result[column] !== null) result[column] = JSON.stringify(result[column]);
  }
  return result;
};

// Rating kandidat dari rata-rata skor, memakai ambang yang sama dengan prompt
const ratingFromScore = (score) => {
  if (score === null || score === undefined) return null;
  if (score >= 4.2) return "Strong";
  if (score >= 3.4) return "Good";
  if (score >= 2.6) return "Consider";
  return "Concern";
};

module.exports = {
  SUMMARY_RESULT_COLUMNS,
  parseSummaryResult,
  toSummaryColumns,
  ratingFromScore,
};
