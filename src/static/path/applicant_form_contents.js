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
                applicant_form_id: {
                  type: 'string',
                  format: 'uuid',
                  nullable: true,
                  description: 'Filter berdasarkan applicant_form_id. null, string kosong, "null" atau "nan" berarti tidak difilter',
                  example: ''
                },
                sort_by: {
                  type: 'string',
                  description: 'Bisa semua kolom applicant_form_contents (contoh: created_at, step, id_question, status_speech_text). Kolom yang tidak dikenal otomatis memakai created_at',
                  example: 'created_at'
                },
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
      description: 'Update speech_text, status_speech_text, message_speech_text dan transcription_id untuk content yang file_link_audio-nya sama. Field selain file_link_audio opsional; yang tidak dikirim tidak diubah. message_speech_text dipotong maksimal 2000 karakter.',
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
    },
    post: {
      tags: ['Applicant Form Contents'],
      summary: 'Proses speech to text berdasarkan file_link_audio',
      description: 'Tandai content sebagai Pending (speech_text dikosongkan), lalu hit API speech to text (POST {SPEECH_TO_TEXT_URL} dengan audio_url = file_link_audio) di background. Response langsung dikembalikan dengan status Pending; hasil transcript dikirim service AI lewat POST /applicant_form_contents/update-stt. Kalau hit API gagal, status berubah menjadi Failed beserta pesan error-nya. Parameter bisa berupa link lengkap (di-URL-encode) atau token share-nya saja. Token API speech to text memakai SPEECH_TO_TEXT_TOKEN, atau Bearer token request kalau env tidak diisi.',
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: 'file_link_audio',
          in: 'path',
          required: true,
          description: 'file_link_audio (URL-encoded) atau token share Nextcloud',
          schema: { type: 'string', example: 'Ja5WwrTnDHsWjPk' }
        }
      ],
      responses: {
        200: {
          description: 'Speech to text sedang diproses',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: true },
                  message: { type: 'string', example: 'Success' },
                  data: {
                    allOf: [{ $ref: '#/components/schemas/ApplicantFormContentAudio' }],
                    example: {
                      id: '2618a26e-7581-4df7-9323-856ef6be471e',
                      applicant_form_id: '4509a494-0c6d-45ad-88fb-47f4eb7f0f70',
                      id_question: '2aa0963e-b2d2-44f7-adc8-87ec0a6255d2',
                      file_title_audio: 'Rekaman Suara2',
                      file_type_audio: 'audio',
                      file_name_audio: 'audio-1792134483181-91a1b143-dd02-469a-b426-dbffb302ef34.webm',
                      nextcloud_path_audio: '/HRMS/applicantForms/feby@mail.com_feby/applicant_form_contents/audio-1792134483181-91a1b143-dd02-469a-b426-dbffb302ef34.webm',
                      file_link_audio: 'https://cloud.inlinegroupdc.com/s/Ja5WwrTnDHsWjPk',
                      speech_text: null,
                      status_speech_text: 'Pending',
                      message_speech_text: 'on proses AI Speech To Text'
                    }
                  },
                  timestamp: { type: 'string', format: 'date-time', example: '2026-10-19T02:09:57.732Z' }
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
