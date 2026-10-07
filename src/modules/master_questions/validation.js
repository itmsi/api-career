const { body, param } = require('express-validator')

const getByIdValidation = [
  param('id').notEmpty().withMessage('ID wajib diisi').isUUID().withMessage('Format ID tidak valid')
]

const getListValidation = [
  body('page').optional().isInt({ min: 1 }).withMessage('Page harus berupa angka positif'),
  body('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit harus antara 1-100'),
  body('search').optional().isString().withMessage('Search harus berupa teks'),
  body('sort_by')
    .optional()
    .isIn(['created_at', 'question_id', 'question_en', 'focus_assessment', 'step'])
    .withMessage('sort_by tidak valid'),
  body('sort_order').optional().customSanitizer((v) => (typeof v === 'string' ? v.toLowerCase() : v)).isIn(['asc', 'desc']).withMessage('sort_order harus asc atau desc')
]

module.exports = {
  getByIdValidation,
  getListValidation
}
