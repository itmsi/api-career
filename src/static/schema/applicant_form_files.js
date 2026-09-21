const applicantFormFilesSchema = {
  ApplicantFormFile: {
    type: 'object',
    properties: {
      id: { type: 'string', format: 'uuid', example: '6f6c4d1d-4b90-41b8-90c5-6d2336f3f2a1' },
      file_title: { type: 'string', example: 'KTP' },
      file_type: { type: 'string', example: 'image' },
      file_name: { type: 'string', example: 'file-1758000000000-abc123.png' },
      nextcloud_path: { type: 'string', example: '/HRMS/ApplicantFiles/file-1758000000000-abc123.png' },
      file_link: { type: 'string', example: 'https://cloud.inlinegroupdc.com/s/AbCdEfGhIjKlMnO' },
      created_at: { type: 'string', format: 'date-time' },
      created_by: { type: 'string', nullable: true },
      updated_at: { type: 'string', format: 'date-time' },
      updated_by: { type: 'string', nullable: true },
      deleted_at: { type: 'string', format: 'date-time', nullable: true },
      deleted_by: { type: 'string', nullable: true },
      is_delete: { type: 'boolean', example: false }
    }
  },
  ApplicantFormFileResult: {
    type: 'object',
    description: 'Response ringkas setelah create/update file',
    properties: {
      file_title: { type: 'string', example: 'KTP' },
      file_type: { type: 'string', example: 'image' },
      file: { type: 'string', example: 'https://cloud.inlinegroupdc.com/s/AbCdEfGhIjKlMnO' }
    }
  }
}

module.exports = applicantFormFilesSchema
