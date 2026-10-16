const axios = require('axios')
const repository = require('./repository')
const { connectRabbitMQ } = require('../../config/rabbitmq')
const { EXCHANGES } = require('../../utils/constant')

/**
 * Speech to text untuk file audio applicant form.
 *
 * Alur:
 * 1. Setelah applicant form dibuat, setiap applicant_form_contents[].file_audio
 *    dicari record-nya (file_link_audio = file_audio) lalu ditandai Pending.
 * 2. Baru dibuatkan satu antrian RabbitMQ per file_audio. Kalau pembuatan
 *    antrian gagal, record ditandai Failed beserta pesan error-nya.
 * 3. Consumer (listeners/applicant_form_speech_to_text_listener.js) hanya hit
 *    API speech to text dengan audio_url = file_audio, tanpa mengubah status.
 * 4. Service AI mengirim hasil transcript & status lewat
 *    POST /applicant_form_contents/update-stt.
 */

const QUEUE_NAME = EXCHANGES.APPLICANT_FORM_SPEECH_TO_TEXT

const SPEECH_TO_TEXT_URL = process.env.SPEECH_TO_TEXT_URL ||
  'https://dev-api-mosa.motorsights.com/api/mosa/ai-assistant/speech-to-text'
const REQUEST_TIMEOUT_MS = 15 * 60 * 1000
const MESSAGE_MAX_LENGTH = 2000
const PENDING_MESSAGE = 'on proses AI Speech To Text'

const LOG_PREFIX = '[STT]'
const logInfo = (...args) => console.info(LOG_PREFIX, ...args)
const logError = (...args) => console.error(LOG_PREFIX, ...args)

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

// Publish satu message dan lempar error kalau gagal, supaya kegagalan
// pembuatan antrian bisa dicatat ke status_speech_text
const publishMessage = async (data) => {
  const { connection, channel } = await connectRabbitMQ()
  try {
    await channel.assertExchange(QUEUE_NAME, 'fanout', { durable: true })
    await channel.assertQueue(QUEUE_NAME, { durable: true })
    await channel.bindQueue(QUEUE_NAME, QUEUE_NAME)
    const published = channel.publish(QUEUE_NAME, '', Buffer.from(JSON.stringify(data)), { persistent: true })
    if (!published) throw new Error('Buffer channel RabbitMQ penuh')
  } finally {
    await channel.close().catch(() => {})
    await connection.close().catch(() => {})
  }
}

/**
 * Buat antrian per file_audio (fire-and-forget). Kegagalan hanya di-log /
 * ditandai Failed dan tidak boleh menggagalkan proses create applicant form.
 */
const publishSpeechToText = (form, token) => {
  if (!isRabbitMqEnabled()) {
    logInfo(`[PUBLISH][SKIP] RabbitMQ tidak aktif, antrian untuk applicant_form_id=${form?.id} tidak dibuat`)
    return
  }

  const run = async () => {
    const audioLinks = getAudioLinks(form)
    logInfo(`[PUBLISH] applicant_form_id=${form?.id} jumlah file_audio=${audioLinks.length}`)

    for (const audioUrl of audioLinks) {
      const content = await repository.findContentByLink('audio', audioUrl)
      if (!content) {
        logInfo(`[PUBLISH][SKIP] content dengan file_link_audio=${audioUrl} tidak ditemukan`)
        continue
      }

      await repository.updateSpeechText(content.id, {
        status_speech_text: STATUS.PENDING,
        speech_text: null,
        message_speech_text: PENDING_MESSAGE
      })

      try {
        await publishMessage({
          applicant_form_id: form.id,
          content_id: content.id,
          audio_url: audioUrl,
          token: token || null
        })
        logInfo(`[PUBLISH][QUEUED] content_id=${content.id} audio_url=${audioUrl} queue=${QUEUE_NAME}`)
      } catch (error) {
        logError(`[PUBLISH][FAILED] content_id=${content.id} audio_url=${audioUrl}: ${error?.message || error}`)
        await repository.updateSpeechText(content.id, {
          status_speech_text: STATUS.FAILED,
          message_speech_text: toMessage(`Gagal membuat antrian: ${error?.message || error}`)
        })
      }
    }
  }

  run().catch((error) => {
    logError(`[PUBLISH][ERROR] applicant_form_id=${form?.id}: ${error?.message || error}`)
  })
}

/**
 * Dipanggil consumer untuk setiap message: hanya hit API speech to text.
 * Status tidak diubah di sini; hasilnya dikirim service AI lewat /update-stt.
 * Error request hanya dikembalikan untuk keperluan log.
 */
const processSpeechToText = async (message = {}) => {
  const { content_id: contentId, audio_url: audioUrl } = message
  if (!contentId || !audioUrl) {
    logInfo('[HIT][SKIP] content_id / audio_url kosong', JSON.stringify(message))
    return { status: 'skipped', reason: 'content_id / audio_url kosong' }
  }

  const token = process.env.SPEECH_TO_TEXT_TOKEN || message.token
  const startedAt = Date.now()
  logInfo(`[HIT][START] content_id=${contentId} POST ${SPEECH_TO_TEXT_URL} audio_url=${audioUrl} token=${token ? 'ada' : 'kosong'}`)

  try {
    const response = await axios.post(
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
    logInfo(`[HIT][SUCCESS] content_id=${contentId} http=${response.status} durasi=${Date.now() - startedAt}ms respon=${toMessage(response.data)}`)
    return { content_id: contentId, status: 'sent', http_status: response.status, response: toMessage(response.data) }
  } catch (error) {
    const reason = error?.response?.data ??
      (error?.code === 'ECONNABORTED' ? `Timeout ${REQUEST_TIMEOUT_MS / 60000} menit` : error?.message || String(error))
    const httpStatus = error?.response?.status ?? null
    logError(`[HIT][FAILED] content_id=${contentId} http=${httpStatus ?? '-'} durasi=${Date.now() - startedAt}ms error=${toMessage(reason)}`)
    return { content_id: contentId, status: 'error', http_status: httpStatus, error: toMessage(reason) }
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
