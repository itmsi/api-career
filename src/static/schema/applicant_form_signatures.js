const applicantFormSignaturesSchema = {
  ApplicantFormSignature: {
    type: 'object',
    properties: {
      id: { type: 'string', format: 'uuid', example: '6f6c4d1d-4b90-41b8-90c5-6d2336f3f2a1' },
      file_name: { type: 'string', example: 'signature-1758000000000-abc123.png' },
      nextcloud_path: { type: 'string', example: '/HRMS/Signature/signature-1758000000000-abc123.png' },
      signature_link: { type: 'string', example: 'https://cloud.inlinegroupdc.com/s/AbCdEfGhIjKlMnO' },
      signature_date: { type: 'string', format: 'date', nullable: true, example: '2026-09-17' },
      created_at: { type: 'string', format: 'date-time' },
      created_by: { type: 'string', nullable: true },
      updated_at: { type: 'string', format: 'date-time' },
      updated_by: { type: 'string', nullable: true },
      deleted_at: { type: 'string', format: 'date-time', nullable: true },
      deleted_by: { type: 'string', nullable: true },
      is_delete: { type: 'boolean', example: false }
    }
  },
  ApplicantFormSignatureResult: {
    type: 'object',
    description: 'Response ringkas setelah create/update signature',
    properties: {
      signature_link: { type: 'string', example: 'https://cloud.inlinegroupdc.com/s/AbCdEfGhIjKlMnO' },
      signature_date: { type: 'string', format: 'date', nullable: true, example: '2026-09-17' }
    }
  }
}

module.exports = applicantFormSignaturesSchema
