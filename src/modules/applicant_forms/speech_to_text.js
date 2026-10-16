const axios = require('axios')
const repository = require('./repository')
const { publishToRabbitMqQueueSingle } = require('../../config/rabbitmq')
const { EXCHANGES } = require('../../utils/constant')

/**
 * Speech to text untuk file audio applicant form.
 *
 * Setelah applicant form dibuat, setiap applicant_form_contents[].file_audio
 * dibuatkan satu antrian RabbitMQ. Consumer (listeners/applicant_form_speech_to_text_listener.js)
 * menandai record applicant_form_contents (file_link_audio = file_audio) sebagai
 * Pending lalu hit API speech to text dengan audio_url = file_audio. Hasil
 * transcript dikirim balik oleh service AI lewat
 * POST /applicant_form_contents/update-stt, jadi respon API di sini tidak diproses.
 * Kalau request ke API gagal, status ditandai Failed.
 */

const QUEUE_NAME = EXCHANGES.APPLICANT_FORM_SPEECH_TO_TEXT

const SPEECH_TO_TEXT_URL = process.env.SPEECH_TO_TEXT_URL ||
  'https://dev-api-mosa.motorsights.com/api/mosa/ai-assistant/speech-to-text'
const REQUEST_TIMEOUT_MS = 15 * 60 * 1000
const MESSAGE_MAX_LENGTH = 2000
const PENDING_MESSAGE = 'on proses AI Speech To Text'

const STATUS = {
  PENDING: 'Pending',
  SUCCESS: 'Success',
  FAILED: 'Failed'
}

const nonEmptyString = (value) => (typeof value === 'string' && value.trim() !== '' ? value.trim() : null)

const toMessage = (value) => {
  if (value === undefined || value === null) return null
  const text = typeof value === 'string' ? value : JSON.stringify(value)
  return text.length > MESSAGE_MAX_LENGTH ? `${text.slice(0, MESSAGE_MAX_LENGTH - 3)}...` : text
}

const isRabbitMqEnabled = () =>
  process.env.RABBITMQ_ENABLED === 'true' && !!process.env.RABBITMQ_URL && process.env.RABBITMQ_URL !== 'disabled'

const getAudioLinks = (form = {}) => [
  ...new Set(
    (Array.isArray(form.applicant_form_contents) ? form.applicant_form_contents : [])
      .map((item) => nonEmptyString(item?.file_audio))
      .filter(Boolean)
  )
]

/**
 * Buat antrian per file_audio (fire-and-forget). Kegagalan hanya di-log /
 * ditandai Failed dan tidak boleh menggagalkan proses create applicant form.
 */
const publishSpeechToText = (form, token) => {
  if (!isRabbitMqEnabled()) return

  const run = async () => {
    for (const audioUrl of getAudioLinks(form)) {
      const content = await repository.findContentByLink('audio', audioUrl)
      if (!content) {
        console.info(`Speech to text di-skip, content dengan file_link_audio ${audioUrl} tidak ditemukan`)
        continue
      }

      try {
        await publishToRabbitMqQueueSingle(QUEUE_NAME, QUEUE_NAME, {
          applicant_form_id: form.id,
          content_id: content.id,
          audio_url: audioUrl,
          token: token || null
        })
      } catch (error) {
        await repository.updateSpeechText(content.id, {
          status_speech_text: STATUS.FAILED,
          message_speech_text: toMessage(`Gagal membuat antrian: ${error?.message || error}`)
        })
      }
    }
  }

  run().catch((error) => {
    console.error(`Gagal publish ${QUEUE_NAME} untuk applicant form ${form?.id}:`, error?.message || error)
  })
}

/**
 * Dipanggil consumer untuk setiap message: tandai Pending lalu hit API
 * speech to text. Hasil transcript di-update lewat endpoint /update-stt.
 */
const processSpeechToText = async (message = {}) => {
  const { content_id: contentId, audio_url: audioUrl } = message
  if (!contentId || !audioUrl) {
    return { status: STATUS.FAILED, reason: 'content_id / audio_url kosong' }
  }

  await repository.updateSpeechText(contentId, {
    status_speech_text: STATUS.PENDING,
    speech_text: null,
    message_speech_text: PENDING_MESSAGE
  })

  const token = process.env.SPEECH_TO_TEXT_TOKEN || message.token

  try {
    await axios.post(
      SPEECH_TO_TEXT_URL,
      { audio_url: audioUrl, async: true },
      {
        timeout: REQUEST_TIMEOUT_MS,
        headers: {
          accept: 'application/json',
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        }
      }
    )
    return { content_id: contentId, status: STATUS.PENDING }
  } catch (error) {
    const reason = error?.response?.data ??
      (error?.code === 'ECONNABORTED' ? `Timeout ${REQUEST_TIMEOUT_MS / 60000} menit` : error?.message || String(error))

    await repository.updateSpeechText(contentId, {
      status_speech_text: STATUS.FAILED,
      message_speech_text: toMessage(reason)
    })
    return { content_id: contentId, status: STATUS.FAILED, error: toMessage(reason) }
  }
}

module.exports = {
  QUEUE_NAME,
  STATUS,
  MESSAGE_MAX_LENGTH,
  toMessage,
  publishSpeechToText,
  processSpeechToText
}
