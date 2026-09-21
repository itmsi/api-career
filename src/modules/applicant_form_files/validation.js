const { body, param } = require('express-validator')

const MAX_TITLE = 255
const MAX_TYPE = 100

const createValidation = [
  body('file_title')
    .notEmpty().withMessage('file_title wajib diisi')
    .isString().withMessage('file_title harus berupa teks')
    .trim()
    .isLength({ max: MAX_TITLE }).withMessage(`file_title maksimal ${MAX_TITLE} karakter`),
  body('file_type')
    .notEmpty().withMessage('file_type wajib diisi')
    .isString().withMessage('file_type harus berupa teks')
    .trim()
    .isLength({ max: MAX_TYPE }).withMessage(`file_type maksimal ${MAX_TYPE} karakter`)
]

const updateValidation = [
  param('id').notEmpty().withMessage('ID wajib diisi').isUUID().withMessage('Format ID tidak valid'),
  body('file_title')
    .optional()
    .isString().withMessage('file_title harus berupa teks')
    .trim()
    .notEmpty().withMessage('file_title tidak boleh kosong')
    .isLength({ max: MAX_TITLE }).withMessage(`file_title maksimal ${MAX_TITLE} karakter`),
  body('file_type')
    .optional()
    .isString().withMessage('file_type harus berupa teks')
    .trim()
    .notEmpty().withMessage('file_type tidak boleh kosong')
    .isLength({ max: MAX_TYPE }).withMessage(`file_type maksimal ${MAX_TYPE} karakter`)
]

const getByIdValidation = [
  param('id').notEmpty().withMessage('ID wajib diisi').isUUID().withMessage('Format ID tidak valid')
]

const getListValidation = [
  body('page').optional().isInt({ min: 1 }).withMessage('Page harus berupa angka positif'),
  body('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit harus antara 1-100'),
  body('sort_by').optional().isIn(['created_at']).withMessage('sort_by tidak valid'),
  body('sort_order').optional().isIn(['asc', 'desc']).withMessage('sort_order harus asc atau desc')
]

module.exports = {
  createValidation,
  updateValidation,
  getByIdValidation,
  getListValidation
}
