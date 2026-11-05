const axios = require("axios");
const masterQuestionsRepository = require("../master_questions/repository");

/**
 * Hit API summarize untuk content yang sudah punya transcription_id.
 * Dipanggil setelah hit speech to text berhasil (POST /audio/:file_link_audio).
 * Instruction diambil dari db_hrm_master_questions.prompt_ai_summary
 * berdasarkan id_question content. Kalau id_question / prompt_ai_summary
 * kosong, summarize dilewati (tidak ada instruction default).
 * Error tidak dilempar, hanya dicatat di log.
 */

// true = hit API summarize, selain itu tidak di-hit
const SUMMARIZE_ENABLED = process.env.SUMMARIZE_ENABLED === "true";
const SUMMARIZE_URL =
  process.env.SUMMARIZE_URL ||
  "https://dev-api-mosa.motorsights.com/api/mosa/ai-assistant/summarize";
// Default: SUMMARIZE_URL + "-all" (.../ai-assistant/summarize-all)
const SUMMARIZE_ALL_URL =
  process.env.SUMMARIZE_ALL_URL || `${SUMMARIZE_URL}-all`;
const REQUEST_TIMEOUT_MS = 15 * 60 * 1000;
const LOG_PREFIX = "[SUMMARIZE]";

const formatBody = (body) => {
  if (body === undefined || body === null || body === "") return "(kosong)";
  return typeof body === "string" ? body : JSON.stringify(body, null, 2);
};

const resolveInstruction = async (contentId, idQuestion) => {
  if (!idQuestion) return null;
  try {
    const prompt =
      await masterQuestionsRepository.findPromptAiSummaryById(idQuestion);
    if (typeof prompt === "string" && prompt.trim() !== "") return prompt.trim();
  } catch (error) {
    console.error(
      `${LOG_PREFIX} [PROMPT][ERROR] content_id=${contentId} id_question=${idQuestion}: ${error?.message || error}`,
    );
  }
  return null;
};

const isFilled = (value) => typeof value === "string" && value.trim() !== "";

// Lengkapi tiap content dengan instruction dari prompt_ai_summary master
// question (id_question). instruction null kalau prompt_ai_summary kosong
const resolveInstructions = async (contents) => {
  const ids = [
    ...new Set(contents.map((item) => item.id_question).filter(Boolean)),
  ];
  let prompts = new Map();
  try {
    prompts = await masterQuestionsRepository.findPromptAiSummaryByIds(ids);
  } catch (error) {
    console.error(
      `${LOG_PREFIX} [PROMPT][ERROR] id_question=${ids.join(",")}: ${error?.message || error}`,
    );
  }

  return contents.map((item) => {
    const prompt = prompts.get(item.id_question);
    return {
      ...item,
      instruction: isFilled(prompt) ? prompt.trim() : null,
      instruction_source: isFilled(prompt) ? "master_questions" : null,
    };
  });
};

// Hit API summarize-all untuk beberapa transcription sekaligus.
// items: [{ transcription_id, instruction }]
const hitSummarizeAll = async (applicantFormId, items, token) => {
  const startedAt = Date.now();
  console.info(
    `${LOG_PREFIX} [ALL][START] applicant_form_id=${applicantFormId} POST ${SUMMARIZE_ALL_URL} jumlah=${items.length}`,
  );

  try {
    const response = await axios.post(SUMMARIZE_ALL_URL, items, {
      timeout: REQUEST_TIMEOUT_MS,
      headers: {
        accept: "application/json",
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });
    console.info(
      `${LOG_PREFIX} [ALL][SUCCESS] applicant_form_id=${applicantFormId} http=${response.status} durasi=${Date.now() - startedAt}ms\n${formatBody(response.data)}`,
    );
    return { ok: true, data: response.data };
  } catch (error) {
    const httpStatus = error?.response?.status ?? null;
    console.error(
      `${LOG_PREFIX} [ALL][FAILED] applicant_form_id=${applicantFormId} http=${httpStatus ?? "-"} durasi=${Date.now() - startedAt}ms\n${formatBody(error?.response?.data ?? error?.message)}`,
    );
    return {
      ok: false,
      httpStatus,
      data: error?.response?.data ?? null,
      reason: error?.message ?? null,
    };
  }
};

const hitSummarize = async (contentId, transcriptionId, token, idQuestion) => {
  const startedAt = Date.now();
  const instruction = await resolveInstruction(contentId, idQuestion);
  const instructionSource = instruction ? "master_questions" : null;
  if (!instruction) {
    console.info(
      `${LOG_PREFIX} [SKIPPED] content_id=${contentId} id_question=${idQuestion ?? "-"}: prompt_ai_summary kosong`,
    );
    return { ok: true, skipped: true, data: null, instruction, instructionSource };
  }
  console.info(
    `${LOG_PREFIX} [START] content_id=${contentId} POST ${SUMMARIZE_URL} transcription_id=${transcriptionId} id_question=${idQuestion ?? "-"} instruction_source=${instructionSource}`,
  );

  try {
    const response = await axios.post(
      SUMMARIZE_URL,
      { transcription_id: transcriptionId, instruction },
      {
        timeout: REQUEST_TIMEOUT_MS,
        headers: {
          accept: "application/json",
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      },
    );
    console.info(
      `${LOG_PREFIX} [SUCCESS] content_id=${contentId} http=${response.status} durasi=${Date.now() - startedAt}ms\n${formatBody(response.data)}`,
    );
    return { ok: true, data: response.data, instruction, instructionSource };
  } catch (error) {
    const httpStatus = error?.response?.status ?? null;
    console.error(
      `${LOG_PREFIX} [FAILED] content_id=${contentId} http=${httpStatus ?? "-"} durasi=${Date.now() - startedAt}ms\n${formatBody(error?.response?.data ?? error?.message)}`,
    );
    return {
      ok: false,
      httpStatus,
      data: error?.response?.data ?? null,
      reason: error?.message ?? null,
      instruction,
      instructionSource,
    };
  }
};

module.exports = {
  SUMMARIZE_ENABLED,
  hitSummarize,
  resolveInstructions,
  hitSummarizeAll,
};
