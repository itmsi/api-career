const path = require("path");
const { v4: uuidv4 } = require("uuid");
const repository = require("./repository");
const masterQuestionsRepository = require("../master_questions/repository");
const {
  uploadFile,
  deleteFile: deleteNextcloudFile,
  generateShareLink,
  NEXTCLOUD_UPLOAD_DIR,
} = require("../../utils/nextcloud");
const {
  STATUS: SPEECH_TEXT_STATUS,
  PENDING_MESSAGE: SPEECH_TEXT_PENDING_MESSAGE,
  toMessage: toSpeechTextMessage,
  hitSpeechToText,
} = require("../applicant_forms/speech_to_text");
const { SUMMARIZE_ENABLED, hitSummarize } = require("./summarize");

const FILE_DIR = `${NEXTCLOUD_UPLOAD_DIR}/ApplicantContents`;

// Satu record berisi dua slot file: video dan audio
const MEDIA_KINDS = ["video", "audio"];

const getRequesterId = (user) => {
  if (!user) return null;
  return user.employee_id || user.user_id || user.users_id || user.sub || null;
};

const normalizeOptionalString = (value) => {
  if (value === undefined || value === null) return null;
  if (typeof value !== "string") return value;
  const trimmed = value.trim();
  if (trimmed === "" || trimmed === "null" || trimmed === "nan") return null;
  return trimmed;
};

const buildFileName = (kind, originalName) => {
  const extension = path.extname(originalName || "") || "";
  return `${kind}-${Date.now()}-${uuidv4()}${extension}`;
};

const uploadContentFile = async (kind, file) => {
  const fileName = buildFileName(kind, file.originalname);
  const nextcloudPath = await uploadFile(FILE_DIR, fileName, file.buffer);
  const fileLink = await generateShareLink(nextcloudPath);
  return { fileName, nextcloudPath, fileLink };
};

const getUploadedFile = (files, kind) => files?.[`file_${kind}`]?.[0] || null;

// Ambil data pertanyaan dari master questions (db_hrm_master_questions.id)
// berdasarkan id_question. Return null kalau id_question kosong/tidak ditemukan
const buildQuestions = async (idQuestion) => {
  if (!idQuestion) return null;
  const [question] = await masterQuestionsRepository.findByIds([idQuestion]);
  if (!question) return null;

  return [
    {
      question_id: question.question_id ?? null,
      question_en: question.question_en ?? null,
      question_cn: question.question_cn ?? null,
      focus_assessment: question.focus_assessment ?? null,
      step: question.step ?? null,
    },
  ];
};

const buildResult = (data) => ({
  applicant_form_id: data.applicant_form_id,
  id_question: data.id_question,
  file_title_video: data.file_title_video,
  file_type_video: data.file_type_video,
  file_video: data.file_link_video,
  file_title_audio: data.file_title_audio,
  file_type_audio: data.file_type_audio,
  file_audio: data.file_link_audio,
  speech_text: data.speech_text,
  questions: data.questions ?? null,
});

const getContents = async (params) => {
  return await repository.findAll(params);
};

const getContentById = async (id) => {
  const data = await repository.findById(id);
  if (!data) {
    throw { message: "Data content tidak ditemukan", statusCode: 404 };
  }
  return data;
};

const buildAudioResult = (data) => ({
  id: data.id,
  applicant_form_id: data.applicant_form_id,
  id_question: data.id_question,
  file_title_audio: data.file_title_audio,
  file_type_audio: data.file_type_audio,
  file_name_audio: data.file_name_audio,
  nextcloud_path_audio: data.nextcloud_path_audio,
  file_link_audio: data.file_link_audio,
  speech_text: data.speech_text,
  status_speech_text: data.status_speech_text,
  message_speech_text: data.message_speech_text,
  summary: data.summary_update ?? data.summary,
});

const getContentByAudioLink = async (fileLinkAudio) => {
  const data = await repository.findByAudioLink(
    normalizeOptionalString(fileLinkAudio),
  );
  if (!data) {
    throw { message: "Data content tidak ditemukan", statusCode: 404 };
  }

  return buildAudioResult(data);
};

// Proses ulang speech to text satu audio: tandai Pending, lalu hit API
// speech to text di background. Hasil transcript dikirim service AI lewat
// POST /update-stt. Kalau hit berhasil dan content sudah punya
// transcription_id, lanjut hit API summarize.
const processSpeechText = async (fileLinkAudio, user, token) => {
  const existing = await repository.findByAudioLink(
    normalizeOptionalString(fileLinkAudio),
  );
  if (!existing) {
    throw { message: "Data content tidak ditemukan", statusCode: 404 };
  }

  const updated = await repository.updateSpeechTextById(existing.id, {
    speech_text: null,
    status_speech_text: SPEECH_TEXT_STATUS.PENDING,
    message_speech_text: SPEECH_TEXT_PENDING_MESSAGE,
    updated_by: getRequesterId(user),
  });

  const authToken = process.env.SPEECH_TO_TEXT_TOKEN || token;
  hitSpeechToText(existing.id, existing.file_link_audio, authToken)
    .then(async (result) => {
      if (result.ok) {
        if (SUMMARIZE_ENABLED && existing.transcription_id) {
          await hitSummarize(
            existing.id,
            existing.transcription_id,
            authToken,
            existing.id_question,
          );
        }
        return;
      }
      const httpInfo = result.httpStatus ? ` (HTTP ${result.httpStatus})` : "";
      await repository.updateSpeechTextById(existing.id, {
        status_speech_text: SPEECH_TEXT_STATUS.FAILED,
        message_speech_text: toSpeechTextMessage(
          `Gagal hit API speech to text${httpInfo}: ${toSpeechTextMessage(result.reason)}`,
        ),
      });
    })
    .catch((error) => {
      console.error(
        `[STT] [PROCESS][ERROR] content_id=${existing.id}: ${error?.message || error}`,
      );
    });

  return buildAudioResult(updated);
};

const createContent = async (payload, files, user) => {
  const authorId = getRequesterId(user);
  const data = {
    applicant_form_id: normalizeOptionalString(payload.applicant_form_id),
    id_question: normalizeOptionalString(payload.id_question),
    speech_text: normalizeOptionalString(payload.speech_text),
  };
  data.questions = await buildQuestions(data.id_question);

  for (const kind of MEDIA_KINDS) {
    data[`file_title_${kind}`] = normalizeOptionalString(
      payload[`file_title_${kind}`],
    );
    data[`file_type_${kind}`] = normalizeOptionalString(
      payload[`file_type_${kind}`],
    );

    const file = getUploadedFile(files, kind);
    if (file) {
      const { fileName, nextcloudPath, fileLink } = await uploadContentFile(
        kind,
        file,
      );
      data[`file_name_${kind}`] = fileName;
      data[`nextcloud_path_${kind}`] = nextcloudPath;
      data[`file_link_${kind}`] = fileLink;
    }
  }

  await repository.create({
    ...data,
    created_by: authorId,
    updated_by: authorId,
  });

  return buildResult(data);
};

const updateContent = async (id, payload, files, user) => {
  const existing = await repository.findById(id);
  if (!existing) {
    throw { message: "Data content tidak ditemukan", statusCode: 404 };
  }

  const authorId = getRequesterId(user);
  const data = { ...existing };
  const oldNextcloudPaths = [];

  for (const field of ["applicant_form_id", "id_question", "speech_text"]) {
    if (payload[field] !== undefined) {
      data[field] = normalizeOptionalString(payload[field]);
    }
  }

  if (payload.id_question !== undefined) {
    data.questions = await buildQuestions(data.id_question);
  }

  for (const kind of MEDIA_KINDS) {
    if (payload[`file_title_${kind}`] !== undefined) {
      data[`file_title_${kind}`] = normalizeOptionalString(
        payload[`file_title_${kind}`],
      );
    }
    if (payload[`file_type_${kind}`] !== undefined) {
      data[`file_type_${kind}`] = normalizeOptionalString(
        payload[`file_type_${kind}`],
      );
    }

    const file = getUploadedFile(files, kind);
    if (file) {
      const { fileName, nextcloudPath, fileLink } = await uploadContentFile(
        kind,
        file,
      );
      oldNextcloudPaths.push(existing[`nextcloud_path_${kind}`]);
      data[`file_name_${kind}`] = fileName;
      data[`nextcloud_path_${kind}`] = nextcloudPath;
      data[`file_link_${kind}`] = fileLink;
    }
  }

  await repository.update(id, {
    ...data,
    updated_by: authorId,
  });

  // Hapus file lama di Nextcloud setelah record berhasil diupdate
  // supaya tidak menumpuk file yatim
  for (const oldPath of oldNextcloudPaths) {
    await deleteNextcloudFile(oldPath);
  }

  return buildResult(data);
};

const SPEECH_TEXT_MESSAGE_MAX_LENGTH = 2000;

const truncateMessage = (value) => {
  if (value === undefined || value === null) return null;
  const text = typeof value === "string" ? value : JSON.stringify(value);
  return text.length > SPEECH_TEXT_MESSAGE_MAX_LENGTH
    ? `${text.slice(0, SPEECH_TEXT_MESSAGE_MAX_LENGTH - 3)}...`
    : text;
};

// Callback hasil speech to text: update content berdasarkan file_link_audio
const updateSpeechText = async (payload, user) => {
  const fileLinkAudio = normalizeOptionalString(payload.file_link_audio);
  const data = { updated_by: getRequesterId(user) };

  if (payload.speech_text !== undefined) {
    data.speech_text = payload.speech_text ?? null;
  }
  if (payload.status_speech_text !== undefined) {
    data.status_speech_text = normalizeOptionalString(
      payload.status_speech_text,
    );
  }
  if (payload.message_speech_text !== undefined) {
    data.message_speech_text = truncateMessage(payload.message_speech_text);
  }
  if (payload.transcription_id !== undefined) {
    data.transcription_id = normalizeOptionalString(payload.transcription_id);
  }
  if (payload.summary !== undefined) {
    data.summary = payload.summary ?? null;
  }
  if (payload.summary_update !== undefined) {
    data.summary_update = payload.summary_update ?? null;
  }

  const updated = await repository.updateSpeechTextByAudioLink(
    fileLinkAudio,
    data,
  );
  if (!updated.length) {
    throw { message: "Data content tidak ditemukan", statusCode: 404 };
  }

  return updated.map((item) => ({
    id: item.id,
    applicant_form_id: item.applicant_form_id,
    file_link_audio: item.file_link_audio,
    speech_text: item.speech_text,
    status_speech_text: item.status_speech_text,
    message_speech_text: item.message_speech_text,
    transcription_id: item.transcription_id,
    summary: item.summary,
    summary_update: item.summary_update,
    updated_at: item.updated_at,
  }));
};

const deleteContent = async (id, user) => {
  const existing = await repository.findById(id);
  if (!existing) {
    throw { message: "Data content tidak ditemukan", statusCode: 404 };
  }

  const authorId = getRequesterId(user);
  await repository.remove(id, authorId);

  for (const kind of MEDIA_KINDS) {
    await deleteNextcloudFile(existing[`nextcloud_path_${kind}`]);
  }

  return null;
};

module.exports = {
  getContents,
  getContentById,
  getContentByAudioLink,
  processSpeechText,
  createContent,
  updateContent,
  updateSpeechText,
  deleteContent,
};
