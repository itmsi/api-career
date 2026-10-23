const repository = require('./repository')
const invitationsRepository = require('../applicant_invitations/repository')
const masterQuestionsRepository = require('../master_questions/repository')
const { publishMoveFiles } = require('./file_mover')

const APPLICANT_FORM_URL = process.env.APPLICANT_FORM_URL || 'https://career.motorsights.com/applicant-form'
const buildApplicantFormUrl = (token) => (token ? `${APPLICANT_FORM_URL}/${token}` : null)

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

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

const CONTENT_FILE_FIELDS = [
  'file_title_video',
  'file_type_video',
  'file_video',
  'file_title_audio',
  'file_type_audio',
  'file_audio'
]

// Setiap item applicant_form_contents wajib punya id_question yang terdaftar di
// master questions (db_hrm_master_questions.id). Item yang id_question-nya kosong,
// tidak valid, atau tidak ditemukan di-skip. Item yang lolos dilengkapi data
// pertanyaan dari master questions, sehingga data yang dikirim klien untuk
// question_id/question_en/dll selalu ditimpa dengan data master.
const enrichContentsWithQuestions = async (contents) => {
  if (!Array.isArray(contents)) return contents ?? null

  const getIdQuestion = (item) => normalizeOptionalString(item?.id_question)
  const ids = [...new Set(contents.map(getIdQuestion).filter((id) => id && UUID_REGEX.test(id)))]
  const questions = await masterQuestionsRepository.findByIds(ids)
  const questionById = new Map(questions.map((question) => [question.id, question]))

  return contents.reduce((acc, item) => {
    const question = questionById.get(getIdQuestion(item)?.toLowerCase())
    if (!question) return acc

    acc.push({
      id_question: question.id,
      question_id: question.question_id ?? null,
      question_en: question.question_en ?? null,
      question_cn: question.question_cn ?? null,
      focus_assessment: question.focus_assessment ?? null,
      step: question.step ?? null,
      ...CONTENT_FILE_FIELDS.reduce((fields, field) => {
        fields[field] = item[field] ?? null
        return fields
      }, {})
    })
    return acc
  }, [])
}

const buildPayload = async (payload = {}) => ({
  full_name: normalizeOptionalString(payload.full_name),
  nickname: normalizeOptionalString(payload.nickname),
  no_mobile: normalizeOptionalString(payload.no_mobile),
  name_relationship_emergency_contact_number: normalizeOptionalString(payload.name_relationship_emergency_contact_number),
  email: normalizeOptionalString(payload.email),
  id_number: normalizeOptionalString(payload.id_number),
  position_applied_for: normalizeOptionalString(payload.position_applied_for),
  marital_status: normalizeOptionalString(payload.marital_status),
  height_weight: normalizeOptionalString(payload.height_weight),
  driver_license: payload.driver_license ?? null,
  address_as_per_id_card: normalizeOptionalString(payload.address_as_per_id_card),
  present_address: normalizeOptionalString(payload.present_address),
  city: normalizeOptionalString(payload.city),
  place_date_of_birth: normalizeOptionalString(payload.place_date_of_birth),
  place_of_birth: normalizeOptionalString(payload.place_of_birth),
  date_of_birth: normalizeOptionalString(payload.date_of_birth),
  blood_type: normalizeOptionalString(payload.blood_type),
  tax_identification_number: normalizeOptionalString(payload.tax_identification_number),
  working_available_date: normalizeOptionalString(payload.working_available_date),
  relogion: normalizeOptionalString(payload.relogion),
  tshirt_size: normalizeOptionalString(payload.tshirt_size),
  educational_background: payload.educational_background ?? null,
  informal_education_special_qualification: payload.informal_education_special_qualification ?? null,
  family_background: payload.family_background ?? null,
  working_experiences: payload.working_experiences ?? null,
  references_old_company: payload.references_old_company ?? null,
  following_answers: payload.following_answers ?? null,
  applicant_form_files: payload.applicant_form_files ?? null,
  applicant_form_contents: await enrichContentsWithQuestions(payload.applicant_form_contents),
  signature_link: normalizeOptionalString(payload.signature_link),
  signature_date: normalizeOptionalString(payload.signature_date),
  summary_all: normalizeOptionalString(payload.summary_all)
})

// Dipakai saat update: hanya field yang dikirim di payload yang diubah,
// field yang tidak dikirim (undefined) dibiarkan sesuai data di DB
const buildUpdatePayload = async (payload = {}) => {
  const data = await buildPayload(payload)
  return Object.keys(data).reduce((acc, key) => {
    if (payload[key] !== undefined) acc[key] = data[key]
    return acc
  }, {})
}

const nonEmptyLinks = (values) => [
  ...new Set(values.filter((value) => typeof value === 'string' && value.trim() !== '').map((value) => value.trim()))
]

// Isi applicant_form_id di tabel upload (signatures/files/contents) yang link-nya
// dipakai oleh applicant form ini:
// - applicant_form_signatures.signature_link  <- applicant_forms.signature_link
// - applicant_form_files.file_link            <- applicant_forms.applicant_form_files[].file
// - applicant_form_contents.file_link_video   <- applicant_forms.applicant_form_contents[].file_video
//   (sekaligus isi kolom step dari applicant_form_contents[].step)
const linkUploadsToForm = async (form) => {
  if (!form?.id) return

  const files = Array.isArray(form.applicant_form_files) ? form.applicant_form_files : []
  const contents = Array.isArray(form.applicant_form_contents) ? form.applicant_form_contents : []

  await repository.linkSignaturesToForm(nonEmptyLinks([form.signature_link]), form.id)
  await repository.linkFilesToForm(nonEmptyLinks(files.map((item) => item?.file)), form.id)
  const contentSteps = new Map()
  for (const item of contents) {
    const [videoLink] = nonEmptyLinks([item?.file_video])
    if (videoLink && !contentSteps.has(videoLink)) contentSteps.set(videoLink, item?.step ?? null)
  }
  await repository.linkContentsToForm(
    [...contentSteps].map(([fileVideo, step]) => ({ file_video: fileVideo, step })),
    form.id
  )
}

const getApplicantForms = async (params) => {
  const result = await repository.findAll(params)
  return {
    ...result,
    data: result.data.map((item) => ({
      ...item,
      applicant_form_url: buildApplicantFormUrl(item.token)
    }))
  }
}

const getApplicantFormById = async (id) => {
  const data = await repository.findDetailById(id)
  if (!data) {
    throw { message: 'Data applicant form tidak ditemukan', statusCode: 404 }
  }
  return {
    ...data,
    applicant_form_url: buildApplicantFormUrl(data.token)
  }
}

const createApplicantForm = async (payload, user) => {
  const authorId = getRequesterId(user)
  const created = await repository.create({
    ...(await buildPayload(payload)),
    created_by: authorId,
    updated_by: authorId
  })
  await linkUploadsToForm(created)
  publishMoveFiles(created)
  return created
}

// :id bisa berupa id undangan (applicant_form_invitations.id) atau id applicant_forms.
// - Dicek dulu di applicant_form_invitations.id.
//   - Kalau ketemu dan applicant_form_id-nya sudah terisi -> update applicant_forms yang ada.
//   - Kalau ketemu tapi applicant_form_id masih kosong -> create applicant_forms baru,
//     lalu tandai undangan tsb completed & simpan applicant_form_id-nya.
// - Kalau tidak ketemu di kolom id, dicek lagi di applicant_form_invitations.applicant_form_id
//   (berarti :id adalah id applicant_forms yang sudah ada) -> update applicant_forms.
// full_name/email/no_mobile yang dikirim juga dipakai buat sinkronkan data di
// applicant_form_invitations (kolom full_name/email/no_mobile).
const updateApplicantForm = async (id, payload, user) => {
  const authorId = getRequesterId(user)

  let invitation = await repository.findInvitationById(id)

  if (!invitation) {
    invitation = await repository.findInvitationByApplicantFormId(id)
  }

  if (!invitation) {
    throw { message: 'Data applicant form tidak ditemukan', statusCode: 404 }
  }

  await invitationsRepository.updateContact(invitation.id, {
    full_name: payload.full_name,
    email: payload.email,
    no_mobile: payload.no_mobile,
    updated_by: authorId
  })

  if (!invitation.applicant_form_id) {
    const created = await repository.create({
      ...(await buildPayload(payload)),
      created_by: authorId,
      updated_by: authorId
    })
    await invitationsRepository.markCompleted(invitation.id, created.id)
    await linkUploadsToForm(created)
    publishMoveFiles(created)
    return created
  }

  const existingForm = await repository.findById(invitation.applicant_form_id)
  if (!existingForm) {
    throw { message: 'Data applicant form tidak ditemukan', statusCode: 404 }
  }

  const updated = await repository.update(invitation.applicant_form_id, {
    ...(await buildUpdatePayload(payload)),
    updated_by: authorId
  })
  await linkUploadsToForm(updated)
  publishMoveFiles(updated)
  return updated
}

// Update applicant_forms.summary_all berdasarkan transcription_id content:
// applicant_form_contents.transcription_id -> applicant_form_id -> applicant_forms.id
const updateSummaryAll = async (payload, user) => {
  const transcriptionId = normalizeOptionalString(payload.transcription_id)
  const content = await repository.findContentByTranscriptionId(transcriptionId)
  if (!content) {
    throw { message: 'Data content dengan transcription_id tsb tidak ditemukan', statusCode: 404 }
  }
  if (!content.applicant_form_id) {
    throw { message: 'Content belum terhubung ke applicant form', statusCode: 422 }
  }

  const existingForm = await repository.findById(content.applicant_form_id)
  if (!existingForm) {
    throw { message: 'Data applicant form tidak ditemukan', statusCode: 404 }
  }

  const updated = await repository.updateSummaryAll(
    existingForm.id,
    normalizeOptionalString(payload.summary),
    getRequesterId(user)
  )
  return {
    id: updated.id,
    transcription_id: transcriptionId,
    summary_all: updated.summary_all,
    updated_at: updated.updated_at
  }
}

// :id bisa berupa id undangan atau id applicant_forms (lihat updateApplicantForm).
// Soft delete dilakukan ke applicant_form_invitations, dan ke applicant_forms
// juga kalau form-nya sudah pernah diisi.
const deleteApplicantForm = async (id, user) => {
  let invitation = await repository.findInvitationById(id)

  if (!invitation) {
    invitation = await repository.findInvitationByApplicantFormId(id)
  }

  if (!invitation) {
    throw { message: 'Data applicant form tidak ditemukan', statusCode: 404 }
  }

  const authorId = getRequesterId(user)

  if (invitation.applicant_form_id) {
    const existingForm = await repository.findById(invitation.applicant_form_id)
    if (existingForm) {
      await repository.remove(invitation.applicant_form_id, authorId)
    }
  }

  return await invitationsRepository.remove(invitation.id, authorId)
}

module.exports = {
  getApplicantForms,
  getApplicantFormById,
  createApplicantForm,
  updateApplicantForm,
  updateSummaryAll,
  deleteApplicantForm
}
