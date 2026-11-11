/**
 * Skor untuk summarize all dihitung di kode (bukan oleh LLM), dari hasil
 * penilaian per jawaban yang sudah tersimpan di applicant_form_contents
 * (summary_score, summary_rating, summary_dimensions). Hasilnya dikirim ke
 * service AI sebagai computed_scores dan wajib dipakai apa adanya.
 */
const {
  recommendationFromScore,
} = require("../applicant_form_contents/summary_score");

const PILLARS = [
  {
    name: "Communication & Background",
    keys: ["communication", "background", "confidence"],
  },
  {
    name: "4 Core Values",
    keys: ["sincerity", "trustworthy", "humble", "teamwork"],
  },
  {
    name: "Growth Mindset",
    keys: [
      "love to learn",
      "embrace failure",
      "happy practice",
      "habit of excellence",
      "giving meaning",
    ],
  },
  {
    name: "Core Self-Evaluation",
    keys: ["core self-evaluation", "self-efficacy", "emotional stability"],
  },
  {
    name: "Motivation & Job Fit",
    keys: ["motivation", "self-determination", "job fit"],
  },
];
const OTHER_PILLAR = "Lainnya";
const CORE_VALUES = "4 Core Values";

// Urutan dari terendah ke tertinggi
const RECOMMENDATION_ORDER = [
  "Not Recommended",
  "Consider",
  "Recommended",
  "Strongly Recommended",
];

const round2 = (value) => Math.round(value * 100) / 100;
const average = (values) =>
  values.length
    ? round2(values.reduce((a, b) => a + b, 0) / values.length)
    : null;
const toNumber = (value) => {
  if (value === null || value === undefined || value === "") return null;
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
};
const toPercent = (score5) => Math.round((score5 / 5) * 100);

const pillarOf = (dimensionName) => {
  const name = String(dimensionName || "").toLowerCase();
  const pillar = PILLARS.find(({ keys }) =>
    keys.some((key) => name.includes(key)),
  );
  return pillar ? pillar.name : OTHER_PILLAR;
};

const parseDimensions = (value) => {
  if (Array.isArray(value)) return value;
  if (typeof value !== "string") return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const lowerRecommendation = (a, b) =>
  RECOMMENDATION_ORDER.indexOf(a) <= RECOMMENDATION_ORDER.indexOf(b) ? a : b;

/**
 * answers: [{ question, summary_score, summary_rating, summary_dimensions }]
 * (urut sesuai pertanyaan). Return null kalau belum ada satu pun skor.
 */
const buildComputedScores = (answers = []) => {
  const scored = answers.filter((item) => toNumber(item.summary_score) !== null);
  if (!scored.length) return null;

  const overall5 = average(scored.map((item) => toNumber(item.summary_score)));
  const perVideo = scored.map((item) => ({
    question: item.question || null,
    weighted_score: toNumber(item.summary_score),
    rating: item.summary_rating || null,
  }));

  // Skor pilar = rata-rata skor dimensi; dimensi yang muncul lebih dari sekali dihitung tiap kemunculan
  const byPillar = new Map();
  for (const item of scored) {
    for (const dimension of parseDimensions(item.summary_dimensions)) {
      const score = toNumber(dimension?.score);
      if (score === null || !dimension?.name) continue;
      const pillar = pillarOf(dimension.name);
      if (!byPillar.has(pillar)) byPillar.set(pillar, { scores: [], used: [] });
      const entry = byPillar.get(pillar);
      entry.scores.push(score);
      entry.used.push(
        item.question ? `${dimension.name} (${item.question})` : dimension.name,
      );
    }
  }
  const pillarNames = [...PILLARS.map((p) => p.name), OTHER_PILLAR];
  const perPillar = pillarNames
    .filter((name) => name !== OTHER_PILLAR || byPillar.has(name))
    .map((name) => {
      const entry = byPillar.get(name);
      const score5 = entry ? average(entry.scores) : null;
      return {
        pillar: name,
        score_5: score5,
        score_100: score5 === null ? null : toPercent(score5),
        dimensions_used: entry ? entry.used : [],
      };
    });

  // Rekomendasi dasar dari skor, lalu aturan penurunan yang bisa dihitung dari angka.
  // Red flag integritas butuh penilaian isi jawaban, jadi diserahkan ke LLM.
  const base = recommendationFromScore(overall5);
  let afterRules = base;
  const rules = [];
  const lowPillar = perPillar.find((p) => p.score_5 !== null && p.score_5 < 2.5);
  if (lowPillar) {
    afterRules = lowerRecommendation(afterRules, "Consider");
    rules.push(`Pilar ${lowPillar.pillar} < 2,50`);
  }
  const coreValues = perPillar.find((p) => p.pillar === CORE_VALUES);
  if (coreValues && coreValues.score_5 !== null && coreValues.score_5 < 3) {
    afterRules = lowerRecommendation(afterRules, "Consider");
    rules.push("Pilar 4 Core Values < 3,00");
  }
  const concerns = perVideo.filter((item) => item.rating === "Concern").length;
  if (concerns >= 2) {
    afterRules = lowerRecommendation(afterRules, "Consider");
    rules.push(`${concerns} jawaban berating Concern`);
  }

  return {
    overall_score_5: overall5,
    overall_score_100: toPercent(overall5),
    per_video: perVideo,
    per_pillar: perPillar,
    recommendation_by_score: base,
    recommendation_after_score_rules: afterRules,
    score_rules_applied: rules,
  };
};

// LLM kadang menulis baris baru / tab literal di dalam nilai string JSON, yang membuat
// JSON.parse gagal. Karakter kontrol di dalam string diubah jadi escape-nya.
const escapeControlCharsInStrings = (text) => {
  let out = "";
  let inString = false;
  let escaped = false;
  for (const char of text) {
    if (!inString) {
      if (char === '"') inString = true;
      out += char;
    } else if (escaped) {
      escaped = false;
      out += char;
    } else if (char === "\\") {
      escaped = true;
      out += char;
    } else if (char === '"') {
      inString = false;
      out += char;
    } else if (char === "\n") {
      out += "\\n";
    } else if (char === "\r") {
      out += "\\r";
    } else if (char === "\t") {
      out += "\\t";
    } else if (char < " ") {
      out += `\\u${char.charCodeAt(0).toString(16).padStart(4, "0")}`;
    } else {
      out += char;
    }
  }
  return out;
};

const parseSummaryJson = (summaryText) => {
  if (typeof summaryText !== "string") return null;
  const start = summaryText.indexOf("{");
  const end = summaryText.lastIndexOf("}");
  if (start === -1 || end <= start) return null;
  const chunk = summaryText.slice(start, end + 1);
  for (const candidate of [chunk, escapeControlCharsInStrings(chunk)]) {
    try {
      const parsed = JSON.parse(candidate);
      return parsed && typeof parsed === "object" ? parsed : null;
    } catch {
      // coba bentuk berikutnya
    }
  }
  return null;
};

// Rekomendasi akhir dari JSON hasil summary all (field `recommendation`), sudah termasuk
// aturan penurunan. null kalau teks bukan JSON atau nilainya bukan salah satu dari empat label.
const extractRecommendation = (summaryText) => {
  const value =
    typeof parseSummaryJson(summaryText)?.recommendation === "string"
      ? parseSummaryJson(summaryText).recommendation.trim().toLowerCase()
      : "";
  return (
    RECOMMENDATION_ORDER.find((label) => label.toLowerCase() === value) ?? null
  );
};

// Skor keseluruhan dari JSON hasil summary all (scores.overall_score_5), skala 0-5,
// 2 desimal. null kalau tidak ada atau di luar rentang.
const extractOverallScore = (summaryText) => {
  const raw = parseSummaryJson(summaryText)?.scores?.overall_score_5;
  const number =
    typeof raw === "string" ? Number(raw.trim().replace(",", ".")) : raw;
  if (typeof number !== "number" || !Number.isFinite(number)) return null;
  if (number < 0 || number > 5) return null;
  return round2(number);
};

module.exports = {
  buildComputedScores,
  extractRecommendation,
  extractOverallScore,
};
