/**
 * Swagger API Path Definitions for Applicant Forms Module
 */

const applicantFormPaths = {
  '/applicant-forms': {
    get: {
      tags: ['Applicant Forms'],
      summary: 'Get all applicant forms',
      description: 'Retrieve all applicant forms with pagination',
      parameters: [
        {
          name: 'page',
          in: 'query',
          description: 'Page number',
          required: false,
          schema: { type: 'integer', default: 1 }
        },
        {
          name: 'limit',
          in: 'query',
          description: 'Items per page',
          required: false,
          schema: { type: 'integer', default: 10 }
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
                  data: {
                    type: 'object',
                    properties: {
                      items: {
                        type: 'array',
                        items: { $ref: '#/components/schemas/ApplicantForm' }
                      },
                      pagination: { $ref: '#/components/schemas/Pagination' }
                    }
                  }
                }
              }
            }
          }
        }
      }
    },
    post: {
      tags: ['Applicant Forms'],
      summary: 'Create new applicant form',
      description: 'Create a new applicant form entry',
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
                  message: { type: 'string', example: 'Data berhasil dibuat' }
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
  '/applicant-forms/{id}': {
    get: {
      tags: ['Applicant Forms'],
      summary: 'Get applicant form by ID',
      description: 'Retrieve a single applicant form by ID',
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
        },
        404: {
          description: 'Not found',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ErrorResponse' }
            }
          }
        }
      }
    },
    put: {
      tags: ['Applicant Forms'],
      summary: 'Update applicant form',
      description: 'Update an existing applicant form',
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
                  message: { type: 'string', example: 'Data berhasil diupdate' }
                }
              }
            }
          }
        },
        404: {
          description: 'Not found'
        }
      }
    },
    delete: {
      tags: ['Applicant Forms'],
      summary: 'Delete applicant form',
      description: 'Soft delete an applicant form (sets deleted_at/is_delete)',
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
        required: false,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                deleted_by: { type: 'string', example: 'admin' }
              }
            }
          }
        }
      },
      responses: {
        200: {
          description: 'Deleted successfully',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: true },
                  message: { type: 'string', example: 'Data berhasil dihapus' }
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
  '/applicant-forms/{id}/restore': {
    post: {
      tags: ['Applicant Forms'],
      summary: 'Restore deleted applicant form',
      description: 'Restore a soft-deleted applicant form',
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
          description: 'Restored successfully',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: true },
                  data: { $ref: '#/components/schemas/ApplicantForm' },
                  message: { type: 'string', example: 'Data berhasil direstore' }
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
  }
};

module.exports = applicantFormPaths;
