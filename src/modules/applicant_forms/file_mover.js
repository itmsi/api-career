const path = require('path')
const repository = require('./repository')
const { publishToRabbitMqQueueSingle } = require('../../config/rabbitmq')
const { EXCHANGES } = require('../../utils/constant')
const {
  client,
  ensureDirectoryExists,
  moveFile,
  NEXTCLOUD_UPLOAD_DIR
} = require('../../utils/nextcloud')

/**
 * Pindahkan file Nextcloud milik applicant form (signature, files, contents)
 * ke folder khusus kandidat:
 *   <NEXTCLOUD_UPLOAD_DIR>/applicantForms/<email>_<full_name tanpa spasi>/<kategori>/
 *
 * Dipakai lewat queue RabbitMQ supaya proses move berjalan di background.
 * File dipindah dengan WebDAV MOVE; Nextcloud mengikat share ke file id,
 * bukan ke path, jadi share link yang sudah ada tidak berubah.
 */

const QUEUE_NAME = EXCHANGES.APPLICANT_FORM_FILES

const CATEGORY = {
  SIGNATURES: 'applicant_form_signatures',
  FILES: 'applicant_form_files',
  CONTENTS: 'applicant_form_contents'
}

const nonEmptyString = (value) => (typeof value === 'string' && value.trim() !== '' ? value.trim() : null)

// Hanya karakter aman untuk nama folder, supaya input seperti "../" atau "/"
// tidak bisa keluar dari folder applicantForms
const sanitizeSegment = (value) => String(value || '').replace(/\s+/g, '').replace(/[^A-Za-z0-9@._-]/g, '')

const buildCandidateDir = ({ applicant_form_id: applicantFormId, email, full_name: fullName }) => {
  const parts = [sanitizeSegment(email), sanitizeSegment(fullName)].filter(Boolean)
  const folderName = parts.length > 0 ? parts.join('_') : sanitizeSegment(applicantFormId)
  return `${NEXTCLOUD_UPLOAD_DIR}/applicantForms/${folderName}`
}

const unique = (items) => [...new Set(items.filter(Boolean))]

/**
 * Bangun message queue dari hasil simpan applicant form.
 * Return null kalau tidak ada link file yang perlu dipindah.
 */
const buildMessage = (form = {}) => {
  const signatureLink = nonEmptyString(form.signature_link)

  const fileLinks = unique(
    (Array.isArray(form.applicant_form_files) ? form.applicant_form_files : [])
      .map((item) => nonEmptyString(item?.file))
  )

  const contentLinks = (Array.isArray(form.applicant_form_contents) ? form.applicant_form_contents : [])
  const videoLinks = unique(contentLinks.map((item) => nonEmptyString(item?.file_video)))
  const audioLinks = unique(contentLinks.map((item) => nonEmptyString(item?.file_audio)))

  if (!signatureLink && fileLinks.length === 0 && videoLinks.length === 0 && audioLinks.length === 0) {
    return null
  }

  return {
    applicant_form_id: form.id,
    email: form.email,
    full_name: form.full_name,
    signature_link: signatureLink,
    file_links: fileLinks,
    content_video_links: videoLinks,
    content_audio_links: audioLinks
  }
}

/**
 * Publish ke queue tanpa menunggu (fire-and-forget). Kegagalan publish
 * (mis. RabbitMQ mati) hanya di-log dan tidak boleh menggagalkan
 * proses create/update applicant form yang sudah sukses.
 */
const isRabbitMqEnabled = () =>
  process.env.RABBITMQ_ENABLED === 'true' && !!process.env.RABBITMQ_URL && process.env.RABBITMQ_URL !== 'disabled'

const publishMoveFiles = (form) => {
  if (!isRabbitMqEnabled()) return

  const message = buildMessage(form)
  if (!message) return

  publishToRabbitMqQueueSingle(QUEUE_NAME, QUEUE_NAME, message).catch((error) => {
    console.error(`Gagal publish ${QUEUE_NAME} untuk applicant form ${form?.id}:`, error?.message || error)
  })
}

/**
 * Pindahkan satu file ke targetDir lalu update nextcloud_path di tabel asalnya.
 * Return status ringkas untuk keperluan log.
 */
const moveRecordFile = async ({ record, targetDir, tableName, column }) => {
  if (!record) return 'not_found'

  const sourcePath = record.nextcloud_path
  if (!sourcePath) return 'no_path'

  const destinationPath = `${targetDir}/${path.posix.basename(sourcePath)}`

  // Sudah ada di folder kandidat (mis. PUT ulang dengan link yang sama)
  if (sourcePath === destinationPath) return 'skipped'

  if (!(await client.exists(sourcePath))) return 'source_missing'

  await ensureDirectoryExists(targetDir)
  await moveFile(sourcePath, destinationPath)
  await repository.updateNextcloudPath(tableName, record.id, column, destinationPath)

  return 'moved'
}

/**
 * Dipanggil consumer untuk setiap message. Error per file ditangkap
 * supaya satu file gagal tidak menghentikan file lainnya.
 */
const processMoveFiles = async (message = {}) => {
  const candidateDir = buildCandidateDir(message)
  const results = []

  const run = async (label, link, task) => {
    try {
      results.push({ label, link, status: await task() })
    } catch (error) {
      results.push({ label, link, status: 'failed', error: error?.message || String(error) })
    }
  }

  if (message.signature_link) {
    await run(CATEGORY.SIGNATURES, message.signature_link, async () => moveRecordFile({
      record: await repository.findSignatureByLink(message.signature_link),
      targetDir: `${candidateDir}/${CATEGORY.SIGNATURES}`,
      tableName: 'applicant_form_signatures',
      column: 'nextcloud_path'
    }))
  }

  for (const link of message.file_links || []) {
    await run(CATEGORY.FILES, link, async () => moveRecordFile({
      record: await repository.findFileByLink(link),
      targetDir: `${candidateDir}/${CATEGORY.FILES}`,
      tableName: 'applicant_form_files',
      column: 'nextcloud_path'
    }))
  }

  for (const kind of ['video', 'audio']) {
    for (const link of message[`content_${kind}_links`] || []) {
      await run(`${CATEGORY.CONTENTS}.${kind}`, link, async () => moveRecordFile({
        record: await repository.findContentByLink(kind, link),
        targetDir: `${candidateDir}/${CATEGORY.CONTENTS}`,
        tableName: 'applicant_form_contents',
        column: `nextcloud_path_${kind}`
      }))
    }
  }

  return { candidate_dir: candidateDir, results }
}

module.exports = {
  QUEUE_NAME,
  buildMessage,
  buildCandidateDir,
  publishMoveFiles,
  processMoveFiles
}
