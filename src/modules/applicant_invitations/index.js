const express = require('express')
const router = express.Router()
const controller = require('./controller')
const {
  createValidation,
  updateValidation,
  getByIdValidation,
  verifyTokenValidation,
  getListValidation
} = require('./validation')
const { verifyToken } = require('../../middlewares')
const { validateMiddleware } = require('../../middlewares/validation')
const { applicantFormLimiter } = require('../../middlewares/rate-limiter')

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

router.put(
  '/:id',
  verifyToken,
  updateValidation,
  validateMiddleware,
  controller.update
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
  applicantFormLimiter,
  verifyTokenValidation,
  validateMiddleware,
  controller.verifyToken
)

module.exports = router
