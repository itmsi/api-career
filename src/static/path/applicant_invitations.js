/**
 * Swagger API Path Definitions for Applicant Invitations Module
 */

const applicantInvitationPaths = {
  '/applicant-invitations/get': {
    post: {
      tags: ['Applicant Invitations'],
      summary: 'Get applicant invitations list',
      description: 'Retrieve applicant form invitations with pagination, search, and sorting',
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                page: { type: 'integer', example: 1 },
                limit: { type: 'integer', example: 10 },
                search: { type: 'string', example: '' },
                sort_by: { type: 'string', example: 'created_at' },
                sort_order: { type: 'string', example: 'desc' },
                is_completed: { type: 'boolean', nullable: true, example: false }
              }
            }
          }
        }
      },
      responses: {
        200: {
          description: 'Success',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: true },
                  data: {
                    type: 'object',
                    properties: {
                      data: {
                        type: 'array',
                        items: { $ref: '#/components/schemas/ApplicantInvitation' }
                      },
                      pagination: {
                        type: 'object',
                        properties: {
                          page: { type: 'integer' },
                          limit: { type: 'integer' },
                          total: { type: 'integer' },
                          totalPages: { type: 'integer' }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  },
  '/applicant-invitations/create': {
    post: {
      tags: ['Applicant Invitations'],
      summary: 'Generate applicant-form access token & send invitation email',
      description: 'HR input full_name, email, dan no_mobile. Sistem otomatis generate token akses (JWT) dan langsung mengirim email berisi nama, email, no_mobile, serta URL applicant-form beserta token tersebut.',
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/ApplicantInvitationInput' }
          }
        }
      },
      responses: {
        201: {
          description: 'Token berhasil dibuat dan email undangan telah dikirim',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: true },
                  data: { $ref: '#/components/schemas/ApplicantInvitation' },
                  message: { type: 'string', example: 'Token berhasil dibuat dan email undangan telah dikirim' }
                }
              }
            }
          }
        },
        400: {
          description: 'Validation error',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ErrorResponse' }
            }
          }
        }
      }
    }
  },
  '/applicant-invitations/{id}/resend': {
    post: {
      tags: ['Applicant Invitations'],
      summary: 'Resend invitation email',
      description: 'Kirim ulang email undangan applicant-form ke pelamar',
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: 'id',
          in: 'path',
          required: true,
          description: 'Applicant Invitation UUID',
          schema: { type: 'string', format: 'uuid' }
        }
      ],
      responses: {
        200: {
          description: 'Email berhasil dikirim ulang',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: true },
                  data: {
                    type: 'object',
                    properties: {
                      applicant_form_url: { type: 'string', example: 'https://career.motorsights.com/applicant-form/eyJ...' }
                    }
                  },
                  message: { type: 'string', example: 'Email undangan berhasil dikirim ulang' }
                }
              }
            }
          }
        },
        404: {
          description: 'Not found'
        }
      }
    }
  },
  '/applicant-invitations/verify/{token}': {
    get: {
      tags: ['Applicant Invitations'],
      summary: 'Verify applicant-form access token',
      description: 'Dipanggil dari halaman applicant-form (public) untuk mengecek apakah token masih berlaku (belum expired) dan form belum pernah diisi (is_completed = false).',
      parameters: [
        {
          name: 'token',
          in: 'path',
          required: true,
          description: 'JWT access token dari URL applicant-form',
          schema: { type: 'string' }
        }
      ],
      responses: {
        200: {
          description: 'Token valid, form dapat diakses',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: true },
                  data: { $ref: '#/components/schemas/ApplicantInvitationVerifyResult' },
                  message: { type: 'string', example: 'Token valid' }
                }
              }
            }
          }
        },
        401: {
          description: 'Token tidak valid / sudah dicabut',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ErrorResponse' }
            }
          }
        },
        410: {
          description: 'Token sudah expired atau form sudah pernah diisi (completed)',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ErrorResponse' }
            }
          }
        }
      }
    }
  }
}

module.exports = applicantInvitationPaths
