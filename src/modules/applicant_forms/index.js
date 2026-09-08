const express = require('express')
const router = express.Router()
const controller = require('./controller')
const {
  createValidation,
  updateValidation,
  getByIdValidation,
  getListValidation
} = require('./validation')
const { verifyToken } = require('../../middlewares')
const { validateMiddleware } = require('../../middlewares/validation')
const { verifyApplicantFormToken } = require('./applicant_token')

router.post(
  '/get',
  verifyToken,
  getListValidation,
  validateMiddleware,
  controller.getList
)

/**
 * Diakses publik oleh pelamar menggunakan token undangan dari url
 * applicant-form (bukan token admin/HR). Lihat ./applicant_token.js
 */
router.post(
  '/create',
  verifyApplicantFormToken,
  createValidation,
  validateMiddleware,
  controller.create
)

router.put(
  '/:id',
  verifyToken,
  updateValidation,
  validateMiddleware,
  controller.update
)

router.delete(
  '/:id',
  verifyToken,
  getByIdValidation,
  validateMiddleware,
  controller.remove
)

router.get(
  '/:id',
  verifyToken,
  getByIdValidation,
  validateMiddleware,
  controller.getById
)

module.exports = router
