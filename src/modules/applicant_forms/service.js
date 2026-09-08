const repository = require('./repository')

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
  return await repository.findAll(params)
}

const getApplicantFormById = async (id) => {
  const data = await repository.findById(id)
  if (!data) {
    throw { message: 'Data applicant form tidak ditemukan', statusCode: 404 }
  }
  return data
}

const createApplicantForm = async (payload, user) => {
  const authorId = getRequesterId(user)
  return await repository.create({
    ...buildPayload(payload),
    created_by: authorId,
    updated_by: authorId
  })
}

const updateApplicantForm = async (id, payload, user) => {
  const existing = await repository.findById(id)
  if (!existing) {
    throw { message: 'Data applicant form tidak ditemukan', statusCode: 404 }
  }
  const authorId = getRequesterId(user)
  return await repository.update(id, {
    ...buildPayload(payload),
    updated_by: authorId
  })
}

const deleteApplicantForm = async (id, user) => {
  const existing = await repository.findById(id)
  if (!existing) {
    throw { message: 'Data applicant form tidak ditemukan', statusCode: 404 }
  }
  const authorId = getRequesterId(user)
  return await repository.remove(id, authorId)
}

module.exports = {
  getApplicantForms,
  getApplicantFormById,
  createApplicantForm,
  updateApplicantForm,
  deleteApplicantForm
}
