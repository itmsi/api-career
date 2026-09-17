/**
 * Swagger API Path Definitions for Applicant Form Signatures Module
 */

const applicantFormSignaturesPaths = {
  '/applicant-form-signatures/get': {
    post: {
      tags: ['Applicant Form Signatures'],
      summary: 'Get signature list',
      description: 'Retrieve signature records with pagination and sorting.',
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: false,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                page: { type: 'integer', example: 1 },
                limit: { type: 'integer', example: 10 },
                sort_by: { type: 'string', example: 'created_at' },
                sort_order: { type: 'string', example: 'desc' }
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
                        items: { $ref: '#/components/schemas/ApplicantFormSignature' }
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
  '/applicant-form-signatures/create': {
    post: {
      tags: ['Applicant Form Signatures'],
      summary: 'Upload signature baru',
      description:
        'Upload file signature (image/pdf) ke Nextcloud, lalu generate public share link. Tidak direlasikan ke applicant_forms manapun.',
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          'multipart/form-data': {
            schema: {
              type: 'object',
              properties: {
                file: { type: 'string', format: 'binary', description: 'File signature (png/jpg/jpeg/webp/pdf)' },
                signature_date: { type: 'string', format: 'date', example: '2026-09-17' }
              },
              required: ['file']
            }
          }
        }
      },
      responses: {
        201: {
          description: 'Uploaded successfully',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: true },
                  data: { $ref: '#/components/schemas/ApplicantFormSignatureResult' },
                  message: { type: 'string', example: 'Signature berhasil diupload' }
                }
              }
            }
          }
        }
      }
    }
  },
  '/applicant-form-signatures/{id}': {
    get: {
      tags: ['Applicant Form Signatures'],
      summary: 'Get signature by ID',
      security: [{ bearerAuth: [] }],
      parameters: [
        { name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }
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
                  data: { $ref: '#/components/schemas/ApplicantFormSignature' }
                }
              }
            }
          }
        }
      }
    },
    put: {
      tags: ['Applicant Form Signatures'],
      summary: 'Update signature (opsional re-upload file)',
      description:
        'File bersifat opsional saat update. Kalau dikirim, file lama di Nextcloud akan dihapus dan diganti dengan file baru.',
      security: [{ bearerAuth: [] }],
      parameters: [
        { name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }
      ],
      requestBody: {
        required: true,
        content: {
          'multipart/form-data': {
            schema: {
              type: 'object',
              properties: {
                file: { type: 'string', format: 'binary', description: 'File signature baru (opsional)' },
                signature_date: { type: 'string', format: 'date', example: '2026-09-17' }
              }
            }
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
                  data: { $ref: '#/components/schemas/ApplicantFormSignatureResult' },
                  message: { type: 'string', example: 'Signature berhasil diupdate' }
                }
              }
            }
          }
        }
      }
    },
    delete: {
      tags: ['Applicant Form Signatures'],
      summary: 'Delete signature',
      description: 'Soft delete record signature dan hapus file terkait di Nextcloud.',
      security: [{ bearerAuth: [] }],
      parameters: [
        { name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }
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
                  message: { type: 'string', example: 'Signature berhasil dihapus' }
                }
              }
            }
          }
        }
      }
    }
  }
}

module.exports = applicantFormSignaturesPaths
