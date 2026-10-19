const express = require('express')
const router = express.Router()
const controller = require('./controller')
const {
  createValidation,
  updateValidation,
  updateSpeechTextValidation,
  getByIdValidation,
  getByAudioLinkValidation,
  getListValidation
} = require('./validation')
const { verifyToken } = require('../../middlewares')
const { validateMiddleware } = require('../../middlewares/validation')
const { handleFileUpload } = require('./upload')

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
  handleFileUpload,
  createValidation,
  validateMiddleware,
  controller.create
)

router.post(
  '/update-stt',
  verifyToken,
  updateSpeechTextValidation,
  validateMiddleware,
  controller.updateSpeechText
)

router.get(
  '/audio/:file_link_audio',
  verifyToken,
  getByAudioLinkValidation,
  validateMiddleware,
  controller.getByAudioLink
)

router.put(
  '/:id',
  verifyToken,
  handleFileUpload,
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
