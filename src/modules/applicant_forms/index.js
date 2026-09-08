const express = require('express');
const router = express.Router();
const controller = require('./controller');
const {
  createValidation,
  updateValidation,
  getByIdValidation,
  listValidation
} = require('./validation');
// Uncomment jika sudah ada authentication
// const { verifyToken } = require('../../middlewares');
const { validateMiddleware } = require('../../middlewares/validation');

/**
 * @route   GET /api/applicant-forms
 * @desc    Get all applicant forms with pagination
 * @access  Public (change to verifyToken for protected)
 */
router.get(
  '/',
  listValidation,
  validateMiddleware,
  controller.getAll
);

/**
 * @route   GET /api/applicant-forms/:id
 * @desc    Get applicant form by ID
 * @access  Public
 */
router.get(
  '/:id',
  getByIdValidation,
  validateMiddleware,
  controller.getById
);

/**
 * @route   POST /api/applicant-forms
 * @desc    Create new applicant form
 * @access  Public
 */
router.post(
  '/',
  createValidation,
  validateMiddleware,
  controller.create
);

/**
 * @route   PUT /api/applicant-forms/:id
 * @desc    Update applicant form
 * @access  Public
 */
router.put(
  '/:id',
  updateValidation,
  validateMiddleware,
  controller.update
);

/**
 * @route   DELETE /api/applicant-forms/:id
 * @desc    Soft delete applicant form
 * @access  Public
 */
router.delete(
  '/:id',
  getByIdValidation,
  validateMiddleware,
  controller.remove
);

/**
 * @route   POST /api/applicant-forms/:id/restore
 * @desc    Restore soft deleted applicant form
 * @access  Public
 */
router.post(
  '/:id/restore',
  getByIdValidation,
  validateMiddleware,
  controller.restore
);

module.exports = router;
