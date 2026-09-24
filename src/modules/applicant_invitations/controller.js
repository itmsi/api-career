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
 * lalu coba kirim email berisi url + token tersebut.
 *
 * Data undangan sudah tersimpan di DB begitu createInvitation selesai -
 * pengiriman email sengaja dipisah dan error-nya tidak boleh membatalkan
 * atau membuat response ini gagal, supaya kegagalan SMTP/jaringan saat
 * kirim email tidak berdampak ke proses create yang sudah sukses.
 * Kalau email gagal terkirim, response tetap 201 sukses, hanya dengan
 * catatan email_sent: false + email_error.
 */
const create = async (req, res) => {
  try {
    const invitation = await service.createInvitation(req.body, req.user)

    let emailInfo = { email_sent: false, email_error: null }
    try {
      const sent = await service.sendInvitationEmail(invitation.id)
      emailInfo = { email_sent: sent.email_sent, email_error: null }
    } catch (emailError) {
      emailInfo = {
        email_sent: false,
        email_error: emailError?.message || 'Gagal mengirim email undangan'
      }
    }

    const message = emailInfo.email_sent
      ? 'Token berhasil dibuat dan email undangan telah dikirim'
      : 'Token berhasil dibuat, namun email undangan gagal dikirim'

    return successResponse(res, { ...invitation, ...emailInfo }, message, 201)
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
