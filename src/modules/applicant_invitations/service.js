const crypto = require('crypto')
const path = require('path')
const jwt = require('jsonwebtoken')
const repository = require('./repository')
const Mail = require('../../utils/mail')

/**
 * Service Layer - Business Logic
 *
 * Layer ini menangani generate token undangan, pengiriman email,
 * dan verifikasi token akses halaman applicant form.
 */

const TOKEN_SECRET = process.env.APPLICANT_FORM_TOKEN_SECRET || process.env.JWT_SECRET
const TOKEN_EXPIRES_IN = process.env.APPLICANT_FORM_TOKEN_EXPIRES_IN || '3d'
const APPLICANT_FORM_URL = process.env.APPLICANT_FORM_URL || 'https://career.motorsights.com/applicant-form'
const EMAIL_ENABLED = process.env.EMAIL_ENABLED === 'true'
// Email undangan bersifat no-reply. Isi dengan inbox HR yang aktif (atau alamat
// forwarding, mis. Cloudflare Email Routing) supaya pelamar yang tetap menekan
// "Reply" tidak kena bounce. Kosongkan kalau belum ada alamat yang bisa menerima email.
const RECRUITMENT_REPLY_TO = process.env.RECRUITMENT_REPLY_TO || null

// Logo di-embed sebagai inline attachment (cid) supaya tetap tampil walaupun
// server tidak bisa diakses publik dan tidak bergantung ke hosting gambar luar
const LOGO_CID = 'motorsights-logo'
const LOGO_PATH = path.join(__dirname, '../../../public/images/motor-sights-international.png')
const COMPANY_ADDRESS = process.env.COMPANY_ADDRESS ||
  'Head Office, Jl. Cakung Cilincing Raya No.KM 35 Kav 532, RT.9/RW.8, Cakung Bar., Kec. Cakung, Kota Jakarta Timur, Daerah Khusus Ibukota Jakarta 13910'
const COMPANY_PHONE = process.env.COMPANY_PHONE || '(021) 80603068'

const getRequesterId = (user) => {
  if (!user) return null
  return user.employee_id || user.user_id || user.users_id || user.sub || null
}

const normalizeOptionalString = (value) => {
  if (value === undefined || value === null) return null
  if (typeof value !== 'string') return value
  const trimmed = value.trim()
  if (trimmed === '' || trimmed === 'null' || trimmed === 'nan') return null
  return trimmed
}

const buildPayload = (payload = {}) => ({
  full_name: normalizeOptionalString(payload.full_name),
  email: normalizeOptionalString(payload.email),
  no_mobile: normalizeOptionalString(payload.no_mobile)
})

/**
 * Generate signed JWT access token untuk satu invitation.
 * Payload hanya berisi referensi (sub/jti), bukan data pribadi,
 * supaya token tetap ringkas dan tidak membocorkan data jika didecode manual.
 */
const generateAccessToken = (invitationId) => {
  const jti = crypto.randomUUID()
  const token = jwt.sign(
    {
      sub: invitationId,
      jti,
      type: 'applicant_form_invitation'
    },
    TOKEN_SECRET,
    { algorithm: 'HS256', expiresIn: TOKEN_EXPIRES_IN }
  )

  const { exp } = jwt.decode(token)
  const expiresAt = new Date(exp * 1000)

  return { token, expiresAt }
}

const buildApplicantFormUrl = (token) => `${APPLICANT_FORM_URL}/${token}`

const getFirstName = (fullName) => String(fullName || '').trim().split(/\s+/)[0] || 'Pelamar'

// (021) 80603068 -> +622180603068, untuk link tel: di footer
const toTelLink = (phone) => {
  const digits = String(phone || '').replace(/\D/g, '')
  return digits.startsWith('0') ? `+62${digits.slice(1)}` : digits
}

// Versi plain text dari mail/applicant_invitation.edge. Dikirim bersamaan dengan
// versi HTML (multipart/alternative) karena email yang hanya berisi HTML lebih
// sering ditandai spam. Di plain text url terpaksa ditampilkan utuh.
const buildInvitationText = ({ firstName, applicantFormUrl, expiresAt }) => [
  `Halo ${firstName},`,
  '',
  'Terima kasih telah melamar di PT Motorsights. Lamaran Anda sudah kami terima. Sebagai langkah berikutnya, mohon lengkapi formulir data pelamar melalui portal karier resmi kami:',
  '',
  'Lengkapi Data Pelamar:',
  applicantFormUrl,
  '',
  `Formulir dapat diisi sampai ${expiresAt}. Anda bisa menyimpan dan melanjutkan pengisian kapan saja sebelum mengirimkannya.`,
  '',
  `Email ini dikirim otomatis dan tidak dapat dibalas. Untuk pertanyaan, hubungi kami di ${COMPANY_PHONE}.`,
  '',
  'Salam,',
  'Tim Rekrutmen PT Motorsights',
  '',
  '--',
  'PT Motorsights',
  COMPANY_ADDRESS,
  `Telp. ${COMPANY_PHONE} · motorsights.com`,
  '',
  'Motorsights tidak pernah memungut biaya apa pun dalam proses rekrutmen.'
].join('\n')

/**
 * HR input nama, email, no_mobile -> generate invitation + token
 */
const createInvitation = async (payload, user) => {
  const invitationId = crypto.randomUUID()
  const { token, expiresAt } = generateAccessToken(invitationId)
  const authorId = getRequesterId(user)

  const created = await repository.create({
    id: invitationId,
    ...buildPayload(payload),
    token,
    token_expires_at: expiresAt,
    created_by: authorId
  })

  return {
    ...created,
    applicant_form_url: buildApplicantFormUrl(token)
  }
}

/**
 * Kirim email undangan berisi nama, email, no_mobile, dan url + token
 */
const sendInvitationEmail = async (id) => {
  const invitation = await repository.findById(id)

  if (!invitation) {
    throw { message: 'Undangan tidak ditemukan', statusCode: 404 }
  }

  const applicantFormUrl = buildApplicantFormUrl(invitation.token)

  if (!EMAIL_ENABLED) {
    return { invitation, applicant_form_url: applicantFormUrl, email_sent: false }
  }

  const expiresAtFormatted = new Intl.DateTimeFormat('id-ID', {
    timeZone: 'Asia/Jakarta',
    dateStyle: 'long'
  }).format(new Date(invitation.token_expires_at))

  const firstName = getFirstName(invitation.full_name)

  const result = await Mail.init()
    .to(invitation.email)
    .subject(`${firstName}, lengkapi data pelamar — PT Motorsights`)
    .additional(RECRUITMENT_REPLY_TO ? { replyTo: RECRUITMENT_REPLY_TO } : {})
    .attachments([{
      filename: 'motor-sights-international.png',
      path: LOGO_PATH,
      cid: LOGO_CID
    }])
    .html('mail/applicant_invitation', {
      data: {
        first_name: firstName,
        full_name: invitation.full_name,
        email: invitation.email,
        no_mobile: invitation.no_mobile,
        applicant_form_url: applicantFormUrl,
        expires_at: expiresAtFormatted,
        company_address: COMPANY_ADDRESS,
        company_phone: COMPANY_PHONE,
        company_phone_tel: toTelLink(COMPANY_PHONE),
        logo_cid: LOGO_CID
      }
    })
    .text(buildInvitationText({
      firstName,
      applicantFormUrl,
      expiresAt: expiresAtFormatted
    }))
    .send()

  if (!result.status) {
    throw { message: `Gagal mengirim email: ${result.message}`, statusCode: 502 }
  }

  return { invitation, applicant_form_url: applicantFormUrl, email_sent: true }
}

/**
 * Verifikasi token dari url applicant-form:
 * - Signature & masa berlaku token (JWT exp)
 * - Invitation masih ada / belum direvoke (soft delete)
 * - Form belum pernah diisi (is_completed)
 */
const verifyAccessToken = async (token) => {
  let decoded

  try {
    decoded = jwt.verify(token, TOKEN_SECRET, { algorithms: ['HS256'] })
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      throw { message: 'Token sudah expired', statusCode: 410, reason: 'expired' }
    }
    throw { message: 'Token tidak valid', statusCode: 401, reason: 'invalid' }
  }

  if (decoded.type !== 'applicant_form_invitation') {
    throw { message: 'Token tidak valid', statusCode: 401, reason: 'invalid' }
  }

  const invitation = await repository.findByToken(token)

  if (!invitation) {
    throw { message: 'Token tidak valid atau sudah dicabut', statusCode: 401, reason: 'invalid' }
  }

  if (invitation.is_completed) {
    throw { message: 'Form ini sudah pernah diisi dan tidak dapat diakses kembali', statusCode: 410, reason: 'completed' }
  }

  if (new Date(invitation.token_expires_at).getTime() < Date.now()) {
    throw { message: 'Token sudah expired', statusCode: 410, reason: 'expired' }
  }

  return {
    id: invitation.id,
    full_name: invitation.full_name,
    email: invitation.email,
    no_mobile: invitation.no_mobile
  }
}

/**
 * Dipakai oleh GET /verify/:token. Selain validasi token, ikut mengembalikan
 * file, content (video & audio) dan signature yang sudah diupload pelamar
 * (created_by = id undangan), supaya bisa ditampilkan ulang di form.
 * Sengaja dipisah dari verifyAccessToken karena fungsi itu juga dipakai
 * middleware di setiap request applicant-form.
 */
const verifyAccessTokenWithUploads = async (token) => {
  const invitation = await verifyAccessToken(token)

  const [files, contents, signature] = await Promise.all([
    repository.findUploadedFilesByCreator(invitation.id),
    repository.findUploadedContentsByCreator(invitation.id),
    repository.findLatestSignatureByCreator(invitation.id)
  ])

  return {
    ...invitation,
    applicant_form_files: files,
    applicant_form_contents: contents,
    signature_link: signature?.signature_link ?? null,
    signature_date: signature?.signature_date ?? null
  }
}

/**
 * Dipanggil setelah applicant berhasil submit applicant_forms,
 * supaya token yang sama tidak bisa dipakai ulang.
 */
const completeInvitation = async (token, applicantFormId) => {
  const invitation = await repository.findByToken(token)

  if (!invitation) {
    throw { message: 'Undangan tidak ditemukan', statusCode: 404 }
  }

  return await repository.markCompleted(invitation.id, applicantFormId)
}

const getInvitations = async (params) => {
  return await repository.findAll(params)
}

module.exports = {
  createInvitation,
  sendInvitationEmail,
  verifyAccessToken,
  verifyAccessTokenWithUploads,
  completeInvitation,
  getInvitations
}
