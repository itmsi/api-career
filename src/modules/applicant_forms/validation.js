const { body, param } = require('express-validator')

const optionalString = (field, label) =>
  body(field).optional({ nullable: true }).isString().withMessage(`${label} harus berupa teks`).trim()

const optionalArray = (field, label) =>
  body(field).optional({ nullable: true }).isArray().withMessage(`${label} harus berupa array`)

const createValidation = [
  optionalString('full_name', 'full_name'),
  optionalString('nickname', 'nickname'),
  optionalString('no_mobile', 'no_mobile'),
  optionalString('name_relationship_emergency_contact_number', 'name_relationship_emergency_contact_number'),
  body('email').optional({ nullable: true }).isEmail().withMessage('email harus valid'),
  optionalString('id_number', 'id_number'),
  optionalString('position_applied_for', 'position_applied_for'),
  optionalString('marital_status', 'marital_status'),
  optionalString('height_weight', 'height_weight'),
  optionalArray('driver_license', 'driver_license'),
  optionalString('address_as_per_id_card', 'address_as_per_id_card'),
  optionalString('present_address', 'present_address'),
  optionalString('city', 'city'),
  optionalString('place_date_of_birth', 'place_date_of_birth'),
  optionalString('blood_type', 'blood_type'),
  optionalString('tax_identification_number', 'tax_identification_number'),
  body('working_available_date').optional({ nullable: true }).isDate().withMessage('working_available_date harus berupa tanggal yang valid'),
  optionalString('relogion', 'relogion'),
  optionalString('tshirt_size', 'tshirt_size'),
  optionalArray('educational_background', 'educational_background'),
  optionalArray('informal_education_special_qualification', 'informal_education_special_qualification'),
  optionalArray('family_background', 'family_background'),
  optionalArray('working_experiences', 'working_experiences'),
  optionalArray('references_old_company', 'references_old_company'),
  optionalArray('following_answers', 'following_answers'),
  body('is_delete').optional().isBoolean().withMessage('is_delete harus boolean')
]

const updateValidation = [
  param('id').notEmpty().withMessage('ID wajib diisi').isUUID().withMessage('Format ID tidak valid'),
  ...createValidation
]

const getByIdValidation = [
  param('id').notEmpty().withMessage('ID wajib diisi').isUUID().withMessage('Format ID tidak valid')
]

const getListValidation = [
  body('page').optional().isInt({ min: 1 }).withMessage('Page harus berupa angka positif'),
  body('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit harus antara 1-100'),
  body('search').optional().isString().withMessage('Search harus berupa teks'),
  body('sort_by').optional().isIn(['created_at']).withMessage('sort_by tidak valid'),
  body('sort_order').optional().isIn(['asc', 'desc']).withMessage('sort_order harus asc atau desc'),
  body('position_applied_for').optional().isString().withMessage('position_applied_for harus berupa teks'),
  body('city').optional().isString().withMessage('city harus berupa teks'),
  body('marital_status').optional().isString().withMessage('marital_status harus berupa teks')
]

module.exports = {
  createValidation,
  updateValidation,
  getByIdValidation,
  getListValidation
}
