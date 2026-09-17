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
const { handleSignatureUpload } = require('./upload')

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
  handleSignatureUpload,
  createValidation,
  validateMiddleware,
  controller.create
)

router.put(
  '/:id',
  verifyToken,
  handleSignatureUpload,
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
