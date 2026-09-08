const express = require('express')
const router = express.Router()
const controller = require('./controller')
const {
  createValidation,
  getByIdValidation,
  verifyTokenValidation,
  getListValidation
} = require('./validation')
const { verifyToken } = require('../../middlewares')
const { validateMiddleware } = require('../../middlewares/validation')

router.post(
  '/get',
  verifyToken,
  getListValidation,
  validateMiddleware,
  controller.getList
)

router.post(
  '/create',
  verifyToken,
  createValidation,
  validateMiddleware,
  controller.create
)

router.post(
  '/:id/resend',
  verifyToken,
  getByIdValidation,
  validateMiddleware,
  controller.resendEmail
)

/**
 * Public endpoint - diakses dari halaman applicant-form tanpa auth
 */
router.get(
  '/verify/:token',
  verifyTokenValidation,
  validateMiddleware,
  controller.verifyToken
)

module.exports = router
