const crypto = require('crypto')
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

  const result = await Mail.init()
    .to(invitation.email)
    .subject('Undangan Pengisian Applicant Form')
    .html('mail/applicant_invitation', {
      data: {
        full_name: invitation.full_name,
        email: invitation.email,
        no_mobile: invitation.no_mobile,
        applicant_form_url: applicantFormUrl
      }
    })
    .send()

  if (!result.status) {
    throw { message: `Gagal mengirim email: ${result.message}`, statusCode: 502 }
  }

  return { invitation, applicant_form_url: applicantFormUrl }
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
    decoded = jwt.verify(token, TOKEN_SECRET)
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
  completeInvitation,
  getInvitations
}
