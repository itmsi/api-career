const { body, param } = require('express-validator')

const createValidation = [
  body('full_name')
    .notEmpty()
    .withMessage('full_name wajib diisi')
    .isLength({ min: 3, max: 150 })
    .withMessage('full_name harus antara 3-150 karakter')
    .trim(),
  body('email')
    .notEmpty()
    .withMessage('email wajib diisi')
    .isEmail()
    .withMessage('email harus valid')
    .trim(),
  body('no_mobile')
    .notEmpty()
    .withMessage('no_mobile wajib diisi')
    .isLength({ min: 8, max: 20 })
    .withMessage('no_mobile harus antara 8-20 karakter')
    .trim()
]

// Semua field opsional: hanya field yang dikirim yang akan di-update.
// full_name/email/no_mobile NOT NULL di DB, jadi kalau dikirim tidak boleh kosong.
const updateValidation = [
  param('id').notEmpty().withMessage('ID wajib diisi').isUUID().withMessage('Format ID tidak valid'),
  body('full_name')
    .optional()
    .isString().withMessage('full_name harus berupa teks')
    .trim()
    .isLength({ min: 3, max: 150 }).withMessage('full_name harus antara 3-150 karakter'),
  body('email')
    .optional()
    .isString().withMessage('email harus berupa teks')
    .trim()
    .isEmail().withMessage('email harus valid'),
  body('no_mobile')
    .optional()
    .isString().withMessage('no_mobile harus berupa teks')
    .trim()
    .isLength({ min: 8, max: 20 }).withMessage('no_mobile harus antara 8-20 karakter'),
  body('status_send_email')
    .optional({ nullable: true })
    .isIn(['Process', 'Success', 'Failed']).withMessage('status_send_email harus Process, Success, atau Failed'),
  body('response_send_email')
    .optional({ nullable: true })
    .custom((value) => typeof value === 'string' || typeof value === 'object')
    .withMessage('response_send_email harus berupa teks atau object'),
  body('is_completed')
    .optional()
    .isBoolean().withMessage('is_completed harus boolean'),
  body('applicant_form_id')
    .optional({ nullable: true })
    .isUUID().withMessage('Format applicant_form_id tidak valid')
]

const getByIdValidation = [
  param('id').notEmpty().withMessage('ID wajib diisi').isUUID().withMessage('Format ID tidak valid')
]

const verifyTokenValidation = [
  param('token').notEmpty().withMessage('Token wajib diisi')
]

const getListValidation = [
  body('page').optional().isInt({ min: 1 }).withMessage('Page harus berupa angka positif'),
  body('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit harus antara 1-100'),
  body('search').optional().isString().withMessage('Search harus berupa teks'),
  body('sort_by').optional().isIn(['created_at']).withMessage('sort_by tidak valid'),
  body('sort_order').optional().isIn(['asc', 'desc']).withMessage('sort_order harus asc atau desc'),
  body('is_completed').optional().isBoolean().withMessage('is_completed harus boolean')
]

module.exports = {
  createValidation,
  updateValidation,
  getByIdValidation,
  verifyTokenValidation,
  getListValidation
}
