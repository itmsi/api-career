const invitationService = require('../applicant_invitations/service')
const { errorResponse } = require('../../utils/response')

/**
 * Middleware untuk endpoint applicant-form yang diakses publik (pelamar)
 * menggunakan token undangan dari url, contoh:
 * https://career.motorsights.com/applicant-form/eyJ...
 *
 * Pengecekan sama persis dengan GET /api/applicant-invitations/verify/:token:
 * - Signature & masa berlaku token (JWT exp)
 * - Undangan masih ada / belum direvoke (soft delete)
 * - Form belum pernah diisi (is_completed)
 *
 * Token dikirim via header: Authorization: Bearer <token>
 */
const verifyApplicantFormToken = async (req, res, next) => {
  try {
    const authHeader = req?.headers?.authorization
    const token = authHeader && authHeader.split(' ')[1]

    if (!token) {
      return errorResponse(res, 'Token akses applicant-form wajib disertakan pada header Authorization', 401)
    }

    const invitation = await invitationService.verifyAccessToken(token)

    req.applicantInvitation = invitation
    req.applicantFormToken = token
    next()
  } catch (error) {
    return errorResponse(res, error?.message || error, error?.statusCode || 401)
  }
}

module.exports = { verifyApplicantFormToken }
