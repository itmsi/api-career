const axios = require("axios");
const repository = require("./repository");

/**
 * Speech to text untuk file audio applicant form (tanpa antrian).
 *
 * Alur:
 * 1. Setelah applicant form dibuat, setiap applicant_form_contents[].file_audio
 *    diproses satu per satu (looping) di background.
 * 2. Record applicant_form_contents (file_link_audio = file_audio) ditandai
 *    Pending, lalu langsung hit API speech to text dengan audio_url = file_audio.
 * 3. Kalau hit API gagal, record ditandai Failed beserta pesan error-nya.
 * 4. Service AI mengirim hasil transcript & status lewat
 *    POST /applicant_form_contents/update-stt.
 */

const SPEECH_TO_TEXT_URL =
  process.env.SPEECH_TO_TEXT_URL ||
  "https://dev-api-mosa.motorsights.com/api/mosa/ai-assistant/speech-to-text";
const REQUEST_TIMEOUT_MS = 15 * 60 * 1000;
const MESSAGE_MAX_LENGTH = 2000;
const PENDING_MESSAGE = "on proses AI Speech To Text";

const LOG_PREFIX = "[STT]";
const logInfo = (...args) => console.info(LOG_PREFIX, ...args);
const logError = (...args) => console.error(LOG_PREFIX, ...args);

// Batas panjang body respon yang dicetak di log, supaya log tidak membengkak
const LOG_RESPONSE_MAX_LENGTH = 10000;

const formatResponseBody = (body) => {
  if (body === undefined || body === null || body === "") return "(kosong)";
  const text = typeof body === "string" ? body : JSON.stringify(body, null, 2);
  return text.length > LOG_RESPONSE_MAX_LENGTH
    ? `${text.slice(0, LOG_RESPONSE_MAX_LENGTH)}\n... (dipotong, total ${text.length} karakter)`
    : text;
};

const logResponse = (contentId, { status, statusText, body, errorCode }) => {
  const http = status ? `${status} ${statusText || ""}`.trim() : "-";
  const code = errorCode ? ` error_code=${errorCode}` : "";
  console.info(
    `${LOG_PREFIX} [HIT][RESPONSE] content_id=${contentId} http=${http}${code}\n${formatResponseBody(body)}`,
  );
};

const STATUS = {
  PENDING: "Pending",
  SUCCESS: "Success",
  FAILED: "Failed",
};

const nonEmptyString = (value) =>
  typeof value === "string" && value.trim() !== "" ? value.trim() : null;

const toMessage = (value) => {
  if (value === undefined || value === null) return null;
  const text = typeof value === "string" ? value : JSON.stringify(value);
  return text.length > MESSAGE_MAX_LENGTH
    ? `${text.slice(0, MESSAGE_MAX_LENGTH - 3)}...`
    : text;
};

const getAudioLinks = (form = {}) => [
  ...new Set(
    (Array.isArray(form.applicant_form_contents)
      ? form.applicant_form_contents
      : []
    )
      .map((item) => nonEmptyString(item?.file_audio))
      .filter(Boolean),
  ),
];

/**
 * Hit API speech to text untuk satu audio. Return hasil ringkas; error
 * tidak dilempar supaya looping tetap lanjut ke audio berikutnya.
 */
const hitSpeechToText = async (contentId, audioUrl, token) => {
  const startedAt = Date.now();
  logInfo(
    `[HIT][START] content_id=${contentId} POST ${SPEECH_TO_TEXT_URL} audio_url=${audioUrl} token=${token ? "ada" : "kosong"}`,
  );

  try {
    const response = await axios.post(
      SPEECH_TO_TEXT_URL,
      { audio_url: audioUrl, async: true, force_refresh: true },
      {
        timeout: REQUEST_TIMEOUT_MS,
        headers: {
          accept: "application/json",
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      },
    );
    logResponse(contentId, {
      status: response.status,
      statusText: response.statusText,
      body: response.data,
    });
    logInfo(
      `[HIT][SUCCESS] content_id=${contentId} http=${response.status} durasi=${Date.now() - startedAt}ms`,
    );
    return { ok: true };
  } catch (error) {
    const reason =
      error?.response?.data ??
      (error?.code === "ECONNABORTED"
        ? `Timeout ${REQUEST_TIMEOUT_MS / 60000} menit`
        : error?.message || String(error));
    const httpStatus = error?.response?.status ?? null;
    logResponse(contentId, {
      status: httpStatus,
      statusText: error?.response?.statusText,
      body: error?.response?.data ?? error?.message,
      errorCode: error?.code,
    });
    logError(
      `[HIT][FAILED] content_id=${contentId} http=${httpStatus ?? "-"} durasi=${Date.now() - startedAt}ms error=${toMessage(reason)}`,
    );
    return { ok: false, reason, httpStatus };
  }
};

/**
 * Looping semua file_audio dan hit API speech to text satu per satu
 * (fire-and-forget). Tidak menunda / menggagalkan response create applicant form.
 */
const runSpeechToText = (form, token) => {
  const authToken = process.env.SPEECH_TO_TEXT_TOKEN || token;

  const run = async () => {
    const audioLinks = getAudioLinks(form);
    logInfo(
      `[RUN] applicant_form_id=${form?.id} jumlah file_audio=${audioLinks.length}`,
    );

    for (const [index, audioUrl] of audioLinks.entries()) {
      const content = await repository.findContentByLink("audio", audioUrl);
      if (!content) {
        logInfo(
          `[RUN][SKIP] ${index + 1}/${audioLinks.length} content dengan file_link_audio=${audioUrl} tidak ditemukan`,
        );
        continue;
      }

      logInfo(
        `[RUN] ${index + 1}/${audioLinks.length} content_id=${content.id}`,
      );
      await repository.updateSpeechText(content.id, {
        status_speech_text: STATUS.PENDING,
        speech_text: null,
        message_speech_text: PENDING_MESSAGE,
      });

      const result = await hitSpeechToText(content.id, audioUrl, authToken);
      if (!result.ok) {
        const httpInfo = result.httpStatus
          ? ` (HTTP ${result.httpStatus})`
          : "";
        await repository.updateSpeechText(content.id, {
          status_speech_text: STATUS.FAILED,
          message_speech_text: toMessage(
            `Gagal hit API speech to text${httpInfo}: ${toMessage(result.reason)}`,
          ),
        });
      }
    }

    logInfo(`[RUN][DONE] applicant_form_id=${form?.id}`);
  };

  run().catch((error) => {
    logError(
      `[RUN][ERROR] applicant_form_id=${form?.id}: ${error?.message || error}`,
    );
  });
};

module.exports = {
  STATUS,
  MESSAGE_MAX_LENGTH,
  PENDING_MESSAGE,
  toMessage,
  hitSpeechToText,
  runSpeechToText,
};
