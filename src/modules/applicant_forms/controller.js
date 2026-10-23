const service = require('./service')
const { runSpeechToText } = require('./speech_to_text')
const invitationService = require('../applicant_invitations/service')
const { successResponse, errorResponse } = require('../../utils/response')

const getList = async (req, res) => {
  try {
    const data = await service.getApplicantForms(req.body)
    return successResponse(res, data)
  } catch (error) {
    return errorResponse(res, error?.message || error, error?.statusCode || 500)
  }
}

const getById = async (req, res) => {
  try {
    const { id } = req.params
    const data = await service.getApplicantFormById(id)
    return successResponse(res, data)
  } catch (error) {
    return errorResponse(res, error?.message || error, error?.statusCode || 500)
  }
}

const create = async (req, res) => {
  try {
    const data = await service.createApplicantForm(req.body, req.user)

    // Tandai undangan sebagai completed supaya token/url tidak bisa dipakai ulang
    if (req.applicantFormToken) {
      await invitationService.completeInvitation(req.applicantFormToken, data.id)
    }

    // Setelah semua proses selesai: hit API speech to text per file_audio
    // (looping di background, tidak menunda / menggagalkan response)
    runSpeechToText(data, req.applicantFormToken)

    return successResponse(res, data, 'Data applicant form berhasil dibuat', 201)
  } catch (error) {
    return errorResponse(res, error?.message || error, error?.statusCode || 500)
  }
}

const update = async (req, res) => {
  try {
    const { id } = req.params
    const data = await service.updateApplicantForm(id, req.body, req.user)
    return successResponse(res, data, 'Data applicant form berhasil diupdate')
  } catch (error) {
    return errorResponse(res, error?.message || error, error?.statusCode || 500)
  }
}

const updateSummaryAll = async (req, res) => {
  try {
    const data = await service.updateSummaryAll(req.body, req.user)
    return successResponse(res, data, 'Summary applicant form berhasil diupdate')
  } catch (error) {
    return errorResponse(res, error?.message || error, error?.statusCode || 500)
  }
}

const createSummarizeAll = async (req, res) => {
  try {
    const token = req.headers.authorization?.replace(/^Bearer\s+/i, '') || null
    const data = await service.createSummarizeAll(req.body, req.user, token)
    return successResponse(res, data, 'Summarize all berhasil')
  } catch (error) {
    return errorResponse(res, error?.message || error, error?.statusCode || 500)
  }
}

const remove = async (req, res) => {
  try {
    const { id } = req.params
    await service.deleteApplicantForm(id, req.user)
    return successResponse(res, null, 'Data applicant form berhasil dihapus')
  } catch (error) {
    return errorResponse(res, error?.message || error, error?.statusCode || 500)
  }
}

module.exports = {
  getList,
  getById,
  create,
  update,
  updateSummaryAll,
  createSummarizeAll,
  remove
}
