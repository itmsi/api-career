/**
 * Swagger API Path Definitions for Applicant Form Contents Module
 */

const idParameter = {
  name: 'id',
  in: 'path',
  required: true,
  description: 'Applicant Form Content UUID',
  schema: { type: 'string', format: 'uuid' }
}

const resultResponse = (description, message) => ({
  description,
  content: {
    'application/json': {
      schema: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: true },
          message: { type: 'string', example: message },
          data: { $ref: '#/components/schemas/ApplicantFormContentResult' }
        }
      }
    }
  }
})

const errorResponse = (description) => ({
  description,
  content: {
    'application/json': {
      schema: { $ref: '#/components/schemas/ErrorResponse' }
    }
  }
})

const applicantFormContentsPaths = {
  '/applicant_form_contents/get': {
    post: {
      tags: ['Applicant Form Contents'],
      summary: 'Get content list',
      description: 'Retrieve content (video & audio) records with pagination, search, and sorting.',
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
                search: { type: 'string', example: '' },
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
                        items: { $ref: '#/components/schemas/ApplicantFormContent' }
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
  '/applicant_form_contents/create': {
    post: {
      tags: ['Applicant Form Contents'],
      summary: 'Upload content baru (video & audio)',
      description:
        'Upload file video dan/atau audio ke Nextcloud, lalu generate public share link. File video dan audio tidak mandatory. created_by & updated_by diisi otomatis dari token.',
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: false,
        content: {
          'multipart/form-data': {
            schema: { $ref: '#/components/schemas/ApplicantFormContentInput' }
          }
        }
      },
      responses: {
        201: resultResponse('Uploaded successfully', 'File berhasil diupload'),
        400: errorResponse('Validation error')
      }
    }
  },
  '/applicant_form_contents/update-stt': {
    post: {
      tags: ['Applicant Form Contents'],
      summary: 'Update hasil speech to text',
      description: 'Update speech_text, status_speech_text dan message_speech_text untuk content yang file_link_audio-nya sama. Field selain file_link_audio opsional; yang tidak dikirim tidak diubah. message_speech_text dipotong maksimal 2000 karakter.',
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/ApplicantFormContentSpeechTextInput' }
          }
        }
      },
      responses: {
        200: {
          description: 'Speech to text berhasil diupdate',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: true },
                  message: { type: 'string', example: 'Speech to text berhasil diupdate' },
                  data: {
                    type: 'array',
                    items: { $ref: '#/components/schemas/ApplicantFormContentSpeechTextResult' }
                  }
                }
              }
            }
          }
        },
        400: errorResponse('Validation error'),
        401: errorResponse('Unauthorized'),
        404: errorResponse('Content dengan file_link_audio tsb tidak ditemukan')
      }
    }
  },
  '/applicant_form_contents/audio/{file_link_audio}': {
    get: {
      tags: ['Applicant Form Contents'],
      summary: 'Get content by file_link_audio',
      description: 'Ambil data audio & hasil speech to text berdasarkan file_link_audio. Parameter bisa berupa link lengkap (di-URL-encode, contoh: https%3A%2F%2Fcloud.motorsights.com%2Fs%2F4M6jZtj3FgWH38D) atau token share-nya saja (contoh: 4M6jZtj3FgWH38D). Kalau ada beberapa content dengan link yang sama, yang dikembalikan adalah yang terbaru.',
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: 'file_link_audio',
          in: 'path',
          required: true,
          description: 'file_link_audio (URL-encoded) atau token share Nextcloud',
          schema: { type: 'string', example: '4M6jZtj3FgWH38D' }
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
                  message: { type: 'string', example: 'Success' },
                  data: { $ref: '#/components/schemas/ApplicantFormContentAudio' },
                  timestamp: { type: 'string', format: 'date-time', example: '2026-10-19T01:59:11.842Z' }
                }
              }
            }
          }
        },
        400: errorResponse('Validation error'),
        401: errorResponse('Unauthorized'),
        404: errorResponse('Content dengan file_link_audio tsb tidak ditemukan')
      }
    }
  },
  '/applicant_form_contents/{id}': {
    get: {
      tags: ['Applicant Form Contents'],
      summary: 'Get content by ID',
      security: [{ bearerAuth: [] }],
      parameters: [idParameter],
      responses: {
        200: {
          description: 'Success',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: true },
                  data: { $ref: '#/components/schemas/ApplicantFormContent' }
                }
              }
            }
          }
        },
        404: errorResponse('Not found')
      }
    },
    put: {
      tags: ['Applicant Form Contents'],
      summary: 'Update content (opsional re-upload video/audio)',
      description:
        'File video dan audio tidak mandatory. Kalau dikirim, file lama di Nextcloud akan dihapus dan diganti dengan file baru. Field yang tidak dikirim tetap memakai nilai lama. updated_by diisi otomatis dari token.',
      security: [{ bearerAuth: [] }],
      parameters: [idParameter],
      requestBody: {
        required: false,
        content: {
          'multipart/form-data': {
            schema: { $ref: '#/components/schemas/ApplicantFormContentInput' }
          }
        }
      },
      responses: {
        200: resultResponse('Updated successfully', 'File berhasil diupload'),
        400: errorResponse('Validation error'),
        404: errorResponse('Not found')
      }
    },
    delete: {
      tags: ['Applicant Form Contents'],
      summary: 'Delete content',
      description: 'Soft delete record content dan hapus file video & audio terkait di Nextcloud. deleted_by diisi otomatis dari token.',
      security: [{ bearerAuth: [] }],
      parameters: [idParameter],
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
        },
        404: errorResponse('Not found')
      }
    }
  }
}

module.exports = applicantFormContentsPaths
