const repository = require('./repository')
const invitationsRepository = require('../applicant_invitations/repository')

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

const buildPayload = (payload = {}) => ({
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
  following_answers: payload.following_answers ?? null
})

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
  return await repository.create({
    ...buildPayload(payload),
    created_by: authorId,
    updated_by: authorId
  })
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
      ...buildPayload(payload),
      created_by: authorId,
      updated_by: authorId
    })
    await invitationsRepository.markCompleted(invitation.id, created.id)
    return created
  }

  const existingForm = await repository.findById(invitation.applicant_form_id)
  if (!existingForm) {
    throw { message: 'Data applicant form tidak ditemukan', statusCode: 404 }
  }

  return await repository.update(invitation.applicant_form_id, {
    ...buildPayload(payload),
    updated_by: authorId
  })
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
  deleteApplicantForm
}
