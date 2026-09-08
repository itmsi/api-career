/**
 * Swagger API Path Definitions for Applicant Forms Module
 */

const applicantFormsPaths = {
  '/applicant-forms/get': {
    post: {
      tags: ['Applicant Forms'],
      summary: 'Get applicant forms list',
      description: 'Retrieve applicant forms with pagination, search, and sorting',
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
                position_applied_for: { type: 'string', nullable: true, example: '' },
                city: { type: 'string', nullable: true, example: '' },
                marital_status: { type: 'string', nullable: true, example: '' }
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
                        items: { $ref: '#/components/schemas/ApplicantForm' }
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
  '/applicant-forms/create': {
    post: {
      tags: ['Applicant Forms'],
      summary: 'Create applicant form (public, pakai token undangan)',
      description: 'Endpoint publik yang diakses pelamar dari halaman applicant-form. Bukan pakai token admin/HR, melainkan token undangan (JWT) dari url applicant-form, dikirim via header Authorization: Bearer <token>. Token divalidasi sama seperti GET /applicant-invitations/verify/{token} (signature, expired, is_completed). Setelah berhasil, undangan otomatis ditandai completed sehingga token/url tidak bisa dipakai ulang.',
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/ApplicantFormInput' }
          }
        }
      },
      responses: {
        201: {
          description: 'Created successfully',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: true },
                  data: { $ref: '#/components/schemas/ApplicantForm' },
                  message: { type: 'string', example: 'Data applicant form berhasil dibuat' }
                }
              }
            }
          }
        },
        401: {
          description: 'Token tidak valid / tidak disertakan',
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
  },
  '/applicant-forms/{id}': {
    get: {
      tags: ['Applicant Forms'],
      summary: 'Get applicant form by ID',
      description: 'Retrieve a single applicant form by ID',
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: 'id',
          in: 'path',
          required: true,
          description: 'Applicant Form UUID',
          schema: { type: 'string', format: 'uuid' }
        }
      ],
      responses: {
        200: {
          description: 'Success',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: true },
                  data: { $ref: '#/components/schemas/ApplicantForm' }
                }
              }
            }
          }
        }
      }
    },
    put: {
      tags: ['Applicant Forms'],
      summary: 'Update applicant form',
      description: 'Update an existing applicant form',
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: 'id',
          in: 'path',
          required: true,
          description: 'Applicant Form UUID',
          schema: { type: 'string', format: 'uuid' }
        }
      ],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/ApplicantFormInput' }
          }
        }
      },
      responses: {
        200: {
          description: 'Updated successfully',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: true },
                  data: { $ref: '#/components/schemas/ApplicantForm' },
                  message: { type: 'string', example: 'Data applicant form berhasil diupdate' }
                }
              }
            }
          }
        }
      }
    },
    delete: {
      tags: ['Applicant Forms'],
      summary: 'Delete applicant form',
      description: 'Soft delete an applicant form',
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: 'id',
          in: 'path',
          required: true,
          description: 'Applicant Form UUID',
          schema: { type: 'string', format: 'uuid' }
        }
      ],
      responses: {
        200: {
          description: 'Deleted successfully',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: true },
                  message: { type: 'string', example: 'Data applicant form berhasil dihapus' }
                }
              }
            }
          }
        }
      }
    }
  }
}

module.exports = applicantFormsPaths
