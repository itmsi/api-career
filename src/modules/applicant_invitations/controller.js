const service = require('./service')
const { successResponse, errorResponse } = require('../../utils/response')

const getList = async (req, res) => {
  try {
    const data = await service.getInvitations(req.body)
    return successResponse(res, data)
  } catch (error) {
    return errorResponse(res, error?.message || error, error?.statusCode || 500)
  }
}

/**
 * HR input nama, email, no_mobile -> generate token undangan,
 * lalu langsung kirim email berisi url + token tersebut.
 */
const create = async (req, res) => {
  try {
    const invitation = await service.createInvitation(req.body, req.user)
    const { applicant_form_url } = await service.sendInvitationEmail(invitation.id)

    return successResponse(
      res,
      { ...invitation, applicant_form_url },
      'Token berhasil dibuat dan email undangan telah dikirim',
      201
    )
  } catch (error) {
    return errorResponse(res, error?.message || error, error?.statusCode || 500)
  }
}

/**
 * Kirim ulang email undangan (misal HR ingin resend)
 */
const resendEmail = async (req, res) => {
  try {
    const { id } = req.params
    const { applicant_form_url } = await service.sendInvitationEmail(id)

    return successResponse(res, { applicant_form_url }, 'Email undangan berhasil dikirim ulang')
  } catch (error) {
    return errorResponse(res, error?.message || error, error?.statusCode || 500)
  }
}

/**
 * Dipanggil dari halaman applicant-form (public, tanpa auth) untuk mengecek
 * apakah token masih berlaku dan formnya belum pernah diisi.
 */
const verifyToken = async (req, res) => {
  try {
    const { token } = req.params
    const data = await service.verifyAccessToken(token)
    return successResponse(res, data, 'Token valid')
  } catch (error) {
    return errorResponse(res, error?.message || error, error?.statusCode || 500)
  }
}

module.exports = {
  getList,
  create,
  resendEmail,
  verifyToken
}
