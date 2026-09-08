/**
 * Standard response utilities for SSO API
 */

/**
 * Success response
 */
const successResponse = (res, data = null, message = 'Success', statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
    timestamp: new Date().toISOString()
  })
}

/**
 * Base response used by module controllers
 * Usage: baseResponse(res, { data, message }, statusCode)
 */
const baseResponse = (res, payload = {}, statusCode = 200) => {
  const { data = null, message = 'Success' } = payload
  return res.status(statusCode).json({
    success: true,
    message,
    data,
    timestamp: new Date().toISOString()
  })
}

/**
 * Error response
 * Accepts either a plain message string or a thrown error object
 * shaped like `{ message, statusCode }`
 */
const errorResponse = (res, error = 'Error', statusCode = 500, errors = null) => {
  const resolvedStatusCode = (error && error.statusCode) || statusCode
  const message = (error && error.message) || (typeof error === 'string' ? error : 'Error')
  return res.status(resolvedStatusCode).json({
    success: false,
    message,
    errors,
    timestamp: new Date().toISOString()
  })
}

/**
 * Validation error response
 */
const validationErrorResponse = (res, errors) => {
  return res.status(400).json({
    success: false,
    message: 'Validation failed',
    errors,
    timestamp: new Date().toISOString()
  })
}

/**
 * Not found response
 */
const notFoundResponse = (res, message = 'Resource not found') => {
  return res.status(404).json({
    success: false,
    message,
    timestamp: new Date().toISOString()
  })
}

/**
 * Unauthorized response
 */
const unauthorizedResponse = (res, message = 'Unauthorized') => {
  return res.status(401).json({
    success: false,
    message,
    timestamp: new Date().toISOString()
  })
}

/**
 * Forbidden response
 */
const forbiddenResponse = (res, message = 'Forbidden') => {
  return res.status(403).json({
    success: false,
    message,
    timestamp: new Date().toISOString()
  })
}

module.exports = {
  successResponse,
  baseResponse,
  errorResponse,
  validationErrorResponse,
  notFoundResponse,
  unauthorizedResponse,
  forbiddenResponse
}
