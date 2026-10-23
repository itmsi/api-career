const axios = require("axios");
const masterQuestionsRepository = require("../master_questions/repository");

/**
 * Hit API summarize untuk content yang sudah punya transcription_id.
 * Dipanggil setelah hit speech to text berhasil (POST /audio/:file_link_audio).
 * Instruction diambil dari db_hrm_master_questions.prompt_ai_summary
 * berdasarkan id_question content, fallback ke SUMMARIZE_INSTRUCTION kalau
 * id_question / prompt_ai_summary kosong.
 * Error tidak dilempar, hanya dicatat di log.
 */

// true = hit API summarize, selain itu tidak di-hit
const SUMMARIZE_ENABLED = process.env.SUMMARIZE_ENABLED === "true";
const SUMMARIZE_URL =
  process.env.SUMMARIZE_URL ||
  "https://dev-api-mosa.motorsights.com/api/mosa/ai-assistant/summarize";
const SUMMARIZE_INSTRUCTION =
  "Tuliskan kelebihan dan kekurangan kandidat dalam bentuk poin";
const REQUEST_TIMEOUT_MS = 15 * 60 * 1000;
const LOG_PREFIX = "[SUMMARIZE]";

const formatBody = (body) => {
  if (body === undefined || body === null || body === "") return "(kosong)";
  return typeof body === "string" ? body : JSON.stringify(body, null, 2);
};

const resolveInstruction = async (contentId, idQuestion) => {
  if (!idQuestion) return SUMMARIZE_INSTRUCTION;
  try {
    const prompt =
      await masterQuestionsRepository.findPromptAiSummaryById(idQuestion);
    if (typeof prompt === "string" && prompt.trim() !== "") return prompt.trim();
  } catch (error) {
    console.error(
      `${LOG_PREFIX} [PROMPT][ERROR] content_id=${contentId} id_question=${idQuestion}: ${error?.message || error}`,
    );
  }
  return SUMMARIZE_INSTRUCTION;
};

const hitSummarize = async (contentId, transcriptionId, token, idQuestion) => {
  const startedAt = Date.now();
  const instruction = await resolveInstruction(contentId, idQuestion);
  const instructionSource =
    instruction === SUMMARIZE_INSTRUCTION ? "default" : "master_questions";
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
};
