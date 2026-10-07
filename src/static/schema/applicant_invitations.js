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
      no_mobile: { type: 'string', example: '081234567890' },
      applicant_form_files: {
        type: 'array',
        description: 'File yang sudah diupload pelamar (applicant_form_files dengan created_by = id undangan). Array kosong kalau belum ada.',
        items: {
          type: 'object',
          properties: {
            file_title: { type: 'string', nullable: true, example: 'CV' },
            file_type: { type: 'string', nullable: true, example: 'pdf' },
            file: { type: 'string', nullable: true, example: 'https://cloud.inlinegroupdc.com/s/AbCdEfGhIjKlMnO' }
          }
        }
      },
      applicant_form_contents: {
        type: 'array',
        description: 'Content video & audio yang sudah diupload pelamar (applicant_form_contents dengan created_by = id undangan). Array kosong kalau belum ada.',
        items: {
          type: 'object',
          properties: {
            id_question: { type: 'string', format: 'uuid', nullable: true, example: '3a1b2c4d-5e6f-4a7b-8c9d-0e1f2a3b4c5d' },
            file_title_video: { type: 'string', nullable: true, example: 'Video Perkenalan' },
            file_type_video: { type: 'string', nullable: true, example: 'video' },
            file_video: { type: 'string', nullable: true, example: 'https://cloud.inlinegroupdc.com/s/3Y5K5Gw3sSrSX4d' },
            file_title_audio: { type: 'string', nullable: true, example: 'Rekaman Suara' },
            file_type_audio: { type: 'string', nullable: true, example: 'audio' },
            file_audio: { type: 'string', nullable: true, example: 'https://cloud.inlinegroupdc.com/s/3Y5K5Gw3sSrSX4d' }
          }
        }
      },
      signature_link: { type: 'string', nullable: true, example: 'https://cloud.inlinegroupdc.com/s/AbCdEfGhIjKlMnO', description: 'Signature terakhir yang diupload pelamar (applicant_form_signatures dengan created_by = id undangan)' },
      signature_date: { type: 'string', format: 'date', nullable: true, example: '2026-09-17' }
    }
  }
}

module.exports = applicantInvitationSchemas
