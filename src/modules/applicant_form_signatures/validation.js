const { body, param } = require('express-validator')

const createValidation = [
  body('signature_date').optional({ nullable: true }).isDate().withMessage('signature_date harus berupa tanggal yang valid (YYYY-MM-DD)')
]

const updateValidation = [
  param('id').notEmpty().withMessage('ID wajib diisi').isUUID().withMessage('Format ID tidak valid'),
  body('signature_date').optional({ nullable: true }).isDate().withMessage('signature_date harus berupa tanggal yang valid (YYYY-MM-DD)')
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
