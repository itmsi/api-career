const { body, param, query } = require('express-validator');

/**
 * Validation rules for creating item
 */
const createValidation = [
  body('full_name').optional().isString().trim(),
  body('nickname').optional().isString().trim(),
  body('no_mobile').optional().isString().trim(),
  body('name_relationship_emergency_contact_number').optional().isString().trim(),
  body('email').optional().isEmail().withMessage('Format email tidak valid').trim(),
  body('id_number').optional().isString().trim(),
  body('position_applied_for').optional().isString().trim(),
  body('marital_status').optional().isString().trim(),
  body('height_weight').optional().isString().trim(),
  body('driver_license').optional().isArray().withMessage('driver_license harus berupa array'),
  body('address_as_per_id_card').optional().isString(),
  body('present_address').optional().isString(),
  body('city').optional().isString().trim(),
  body('place_date_of_birth').optional().isString().trim(),
  body('blood_type').optional().isString().trim(),
  body('tax_identification_number').optional().isString().trim(),
  body('working_available_date').optional().isDate().withMessage('Format tanggal tidak valid'),
  body('relogion').optional().isString().trim(),
  body('tshirt_size').optional().isString().trim(),
  body('educational_background').optional().isArray().withMessage('educational_background harus berupa array'),
  body('informal_education_special_qualification').optional().isArray().withMessage('informal_education_special_qualification harus berupa array'),
  body('family_background').optional().isArray().withMessage('family_background harus berupa array'),
  body('working_experiences').optional().isArray().withMessage('working_experiences harus berupa array'),
  body('references_old_company').optional().isArray().withMessage('references_old_company harus berupa array'),
  body('following_answers').optional().isArray().withMessage('following_answers harus berupa array'),
];

/**
 * Validation rules for updating item
 */
const updateValidation = [
  param('id')
    .notEmpty()
    .withMessage('ID wajib diisi')
    .isUUID()
    .withMessage('Format ID tidak valid'),
  body('full_name').optional().isString().trim(),
  body('nickname').optional().isString().trim(),
  body('no_mobile').optional().isString().trim(),
  body('name_relationship_emergency_contact_number').optional().isString().trim(),
  body('email').optional().isEmail().withMessage('Format email tidak valid').trim(),
  body('id_number').optional().isString().trim(),
  body('position_applied_for').optional().isString().trim(),
  body('marital_status').optional().isString().trim(),
  body('height_weight').optional().isString().trim(),
  body('driver_license').optional().isArray().withMessage('driver_license harus berupa array'),
  body('address_as_per_id_card').optional().isString(),
  body('present_address').optional().isString(),
  body('city').optional().isString().trim(),
  body('place_date_of_birth').optional().isString().trim(),
  body('blood_type').optional().isString().trim(),
  body('tax_identification_number').optional().isString().trim(),
  body('working_available_date').optional().isDate().withMessage('Format tanggal tidak valid'),
  body('relogion').optional().isString().trim(),
  body('tshirt_size').optional().isString().trim(),
  body('educational_background').optional().isArray().withMessage('educational_background harus berupa array'),
  body('informal_education_special_qualification').optional().isArray().withMessage('informal_education_special_qualification harus berupa array'),
  body('family_background').optional().isArray().withMessage('family_background harus berupa array'),
  body('working_experiences').optional().isArray().withMessage('working_experiences harus berupa array'),
  body('references_old_company').optional().isArray().withMessage('references_old_company harus berupa array'),
  body('following_answers').optional().isArray().withMessage('following_answers harus berupa array'),
];

/**
 * Validation rules for getting item by ID
 */
const getByIdValidation = [
  param('id')
    .notEmpty()
    .withMessage('ID wajib diisi')
    .isUUID()
    .withMessage('Format ID tidak valid'),
];

/**
 * Validation rules for list with pagination
 */
const listValidation = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page harus berupa angka positif'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit harus antara 1-100'),
];

module.exports = {
  createValidation,
  updateValidation,
  getByIdValidation,
  listValidation
};
