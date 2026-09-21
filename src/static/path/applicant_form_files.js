/**
 * Swagger API Path Definitions for Applicant Form Files Module
 */

const applicantFormFilesPaths = {
  '/applicant-form-files/get': {
    post: {
      tags: ['Applicant Form Files'],
      summary: 'Get file list',
      description: 'Retrieve file records with pagination and sorting.',
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
                        items: { $ref: '#/components/schemas/ApplicantFormFile' }
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
  '/applicant-form-files/create': {
    post: {
      tags: ['Applicant Form Files'],
      summary: 'Upload file baru',
      description:
        'Upload file (image/pdf) ke Nextcloud, lalu generate public share link. Tidak direlasikan ke applicant_forms manapun.',
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          'multipart/form-data': {
            schema: {
              type: 'object',
              properties: {
                file_title: { type: 'string', example: 'KTP' },
                file_type: { type: 'string', example: 'image' },
                file: { type: 'string', format: 'binary', description: 'File (png/jpg/jpeg/webp/pdf)' }
              },
              required: ['file_title', 'file_type', 'file']
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
                  data: { $ref: '#/components/schemas/ApplicantFormFileResult' },
                  message: { type: 'string', example: 'File berhasil diupload' }
                }
              }
            }
          }
        }
      }
    }
  },
  '/applicant-form-files/{id}': {
    get: {
      tags: ['Applicant Form Files'],
      summary: 'Get file by ID',
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
                  data: { $ref: '#/components/schemas/ApplicantFormFile' }
                }
              }
            }
          }
        }
      }
    },
    put: {
      tags: ['Applicant Form Files'],
      summary: 'Update file (opsional re-upload file)',
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
                file_title: { type: 'string', example: 'KTP' },
                file_type: { type: 'string', example: 'image' },
                file: { type: 'string', format: 'binary', description: 'File baru (opsional)' }
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
                  data: { $ref: '#/components/schemas/ApplicantFormFileResult' },
                  message: { type: 'string', example: 'File berhasil diupdate' }
                }
              }
            }
          }
        }
      }
    },
    delete: {
      tags: ['Applicant Form Files'],
      summary: 'Delete file',
      description: 'Soft delete record file dan hapus file terkait di Nextcloud.',
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
                  message: { type: 'string', example: 'File berhasil dihapus' }
                }
              }
            }
          }
        }
      }
    }
  }
}

module.exports = applicantFormFilesPaths
