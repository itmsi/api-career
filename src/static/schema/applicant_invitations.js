/**
 * Swagger Schema Definitions for Applicant Invitations Module
 */

const applicantInvitationSchemas = {
  ApplicantInvitation: {
    type: 'object',
    properties: {
      id: {
        type: 'string',
        format: 'uuid',
        description: 'Unique identifier',
        example: '123e4567-e89b-12d3-a456-426614174000'
      },
      full_name: { type: 'string', example: 'John Doe' },
      email: { type: 'string', example: 'john.doe@example.com' },
      no_mobile: { type: 'string', example: '081234567890' },
      token: { type: 'string', description: 'JWT access token', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' },
      token_expires_at: { type: 'string', format: 'date-time', example: '2026-09-11T00:00:00.000Z' },
      is_completed: { type: 'boolean', example: false },
      completed_at: { type: 'string', format: 'date-time', nullable: true, example: null },
      applicant_form_id: { type: 'string', format: 'uuid', nullable: true, example: null },
      applicant_form_url: {
        type: 'string',
        description: 'URL lengkap applicant form beserta token',
        example: 'https://career.motorsights.com/applicant-form/eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
      },
      created_at: { type: 'string', format: 'date-time', example: '2026-09-08T00:00:00.000Z' },
      created_by: { type: 'string', nullable: true },
      updated_at: { type: 'string', format: 'date-time', example: '2026-09-08T00:00:00.000Z' },
      updated_by: { type: 'string', nullable: true },
      deleted_at: { type: 'string', format: 'date-time', nullable: true },
      deleted_by: { type: 'string', nullable: true },
      is_delete: { type: 'boolean', example: false }
    }
  },
  ApplicantInvitationInput: {
    type: 'object',
    required: ['full_name', 'email', 'no_mobile'],
    properties: {
      full_name: { type: 'string', minLength: 3, maxLength: 150, example: 'John Doe' },
      email: { type: 'string', format: 'email', example: 'john.doe@example.com' },
      no_mobile: { type: 'string', example: '081234567890' }
    }
  },
  ApplicantInvitationVerifyResult: {
    type: 'object',
    properties: {
      id: { type: 'string', format: 'uuid' },
      full_name: { type: 'string', example: 'John Doe' },
      email: { type: 'string', example: 'john.doe@example.com' },
      no_mobile: { type: 'string', example: '081234567890' }
    }
  }
}

module.exports = applicantInvitationSchemas
