const axios = require("axios");

/**
 * Hit API summarize untuk content yang sudah punya transcription_id.
 * Dipanggil setelah hit speech to text berhasil (POST /audio/:file_link_audio).
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

const hitSummarize = async (contentId, transcriptionId, token) => {
  const startedAt = Date.now();
  console.info(
    `${LOG_PREFIX} [START] content_id=${contentId} POST ${SUMMARIZE_URL} transcription_id=${transcriptionId}`,
  );

  try {
    const response = await axios.post(
      SUMMARIZE_URL,
      { transcription_id: transcriptionId, instruction: SUMMARIZE_INSTRUCTION },
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
    return { ok: true, data: response.data };
  } catch (error) {
    const httpStatus = error?.response?.status ?? null;
    console.error(
      `${LOG_PREFIX} [FAILED] content_id=${contentId} http=${httpStatus ?? "-"} durasi=${Date.now() - startedAt}ms\n${formatBody(error?.response?.data ?? error?.message)}`,
    );
    return { ok: false, httpStatus };
  }
};

module.exports = {
  SUMMARIZE_ENABLED,
  hitSummarize,
};
