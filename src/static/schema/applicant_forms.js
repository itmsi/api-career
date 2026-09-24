const applicantFormsSchema = {
  ApplicantFormListItem: {
    type: 'object',
    description: 'Hasil list applicant forms, di-join dari applicant_form_invitations (LEFT JOIN applicant_forms via applicant_form_id, LEFT JOIN gate_sso_employees via applicant_form_invitations.created_by = employee_id) sehingga undangan yang belum diisi tetap muncul.',
    properties: {
      id: { type: 'string', format: 'uuid', example: '6f6c4d1d-4b90-41b8-90c5-6d2336f3f2a1', description: 'applicant_form_invitations.applicant_form_id kalau form sudah diisi, kalau belum fallback ke applicant_form_invitations.id' },
      name: { type: 'string', example: 'John Doe', description: 'Dari applicant_form_invitations.full_name' },
      email: { type: 'string', example: 'john.doe@example.com', description: 'Dari applicant_form_invitations.email' },
      no_mobile: { type: 'string', example: '081234567890', description: 'Dari applicant_form_invitations.no_mobile' },
      token: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...', description: 'Token akses (JWT) undangan applicant form' },
      applicant_form_url: { type: 'string', example: 'https://career.motorsights.com/applicant-form/eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...', description: 'URL applicant form yang dibangun dari token undangan' },
      token_expires_at: { type: 'string', format: 'date-time' },
      is_completed: { type: 'boolean', example: false, description: 'true jika pelamar sudah mengisi applicant form' },
      completed_at: { type: 'string', format: 'date-time', nullable: true },
      created_at: { type: 'string', format: 'date-time', description: 'Waktu undangan dibuat (applicant_form_invitations.created_at)' },
      created_by_name: { type: 'string', nullable: true, example: 'Jane Smith', description: 'Nama pembuat undangan, di-resolve dari gate_sso_employees.employee_name via applicant_form_invitations.created_by = employee_id' },
      position_applied_for: { type: 'string', nullable: true, example: 'Software Engineer' },
      city: { type: 'string', nullable: true, example: 'Yogyakarta' },
      working_available_date: { type: 'string', format: 'date', nullable: true, example: '2026-10-01' }
    }
  },
  ApplicantFormDetail: {
    type: 'object',
    description: 'Hasil GET /applicant-forms/:id, di-join dari applicant_form_invitations (LEFT JOIN applicant_forms via applicant_form_id, LEFT JOIN gate_sso_employees via applicant_form_invitations.created_by = employee_id). :id bisa berupa applicant_form_id (form sudah diisi) atau id undangan (form belum diisi).',
    properties: {
      id: { type: 'string', format: 'uuid', example: '6f6c4d1d-4b90-41b8-90c5-6d2336f3f2a1', description: 'applicant_form_invitations.applicant_form_id kalau form sudah diisi, kalau belum fallback ke applicant_form_invitations.id' },
      name: { type: 'string', example: 'John Doe', description: 'Dari applicant_form_invitations.full_name' },
      email: { type: 'string', example: 'john.doe@example.com', description: 'Dari applicant_form_invitations.email' },
      no_mobile: { type: 'string', example: '081234567890', description: 'Dari applicant_form_invitations.no_mobile' },
      token: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...', description: 'Token akses (JWT) undangan applicant form' },
      applicant_form_url: { type: 'string', example: 'https://career.motorsights.com/applicant-form/eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...', description: 'URL applicant form yang dibangun dari token undangan' },
      token_expires_at: { type: 'string', format: 'date-time' },
      is_completed: { type: 'boolean', example: false, description: 'true jika pelamar sudah mengisi applicant form' },
      completed_at: { type: 'string', format: 'date-time', nullable: true },
      created_at: { type: 'string', format: 'date-time', description: 'Waktu undangan dibuat (applicant_form_invitations.created_at)' },
      created_by_name: { type: 'string', nullable: true, example: 'Jane Smith', description: 'Nama pembuat undangan, di-resolve dari gate_sso_employees.employee_name via applicant_form_invitations.created_by = employee_id' },
      nickname: { type: 'string', nullable: true, example: 'Johnny' },
      name_relationship_emergency_contact_number: { type: 'string', nullable: true, example: 'Jane Doe (Istri) - 081234567891' },
      id_number: { type: 'string', nullable: true, example: '3271010101900001' },
      position_applied_for: { type: 'string', nullable: true, example: 'Software Engineer' },
      marital_status: { type: 'string', nullable: true, example: 'Menikah' },
      height_weight: { type: 'string', nullable: true, example: '170cm / 65kg' },
      driver_license: {
        type: 'array',
        nullable: true,
        items: { type: 'object', properties: { name: { type: 'string', example: 'SIM A' } } },
        example: [{ name: 'SIM A' }, { name: 'SIM B' }]
      },
      address_as_per_id_card: { type: 'string', nullable: true, example: 'Jl. Contoh No. 1' },
      present_address: { type: 'string', nullable: true, example: 'Jl. Contoh No. 2' },
      city: { type: 'string', nullable: true, example: 'Yogyakarta' },
      place_date_of_birth: { type: 'string', nullable: true, example: 'Yogyakarta, 01 Januari 1990' },
      blood_type: { type: 'string', nullable: true, example: 'O' },
      tax_identification_number: { type: 'string', nullable: true, example: '09.123.456.7-123.000' },
      working_available_date: { type: 'string', format: 'date', nullable: true, example: '2026-10-01' },
      relogion: { type: 'string', nullable: true, example: 'Islam' },
      tshirt_size: { type: 'string', nullable: true, example: 'L' },
      educational_background: { type: 'array', nullable: true, items: { type: 'object' } },
      informal_education_special_qualification: { type: 'array', nullable: true, items: { type: 'object' } },
      family_background: { type: 'array', nullable: true, items: { type: 'object' } },
      working_experiences: { type: 'array', nullable: true, items: { type: 'object' } },
      references_old_company: { type: 'array', nullable: true, items: { type: 'object' } },
      following_answers: { type: 'array', nullable: true, items: { type: 'object' } },
      applicant_form_files: { type: 'array', nullable: true, items: { type: 'object' } },
      signature_link: { type: 'string', nullable: true, example: 'https://cloud.inlinegroupdc.com/s/AbCdEfGhIjKlMnO', description: 'Share link Nextcloud dari file signature yang terakhir diupload' },
      signature_date: { type: 'string', format: 'date', nullable: true, example: '2026-09-17' },
      is_delete: { type: 'boolean', nullable: true, example: false }
    }
  },
  ApplicantForm: {
    type: 'object',
    properties: {
      id: { type: 'string', format: 'uuid', example: '6f6c4d1d-4b90-41b8-90c5-6d2336f3f2a1' },
      full_name: { type: 'string', nullable: true, example: 'John Doe' },
      nickname: { type: 'string', nullable: true, example: 'Johnny' },
      no_mobile: { type: 'string', nullable: true, example: '081234567890' },
      name_relationship_emergency_contact_number: { type: 'string', nullable: true, example: 'Jane Doe (Istri) - 081234567891' },
      email: { type: 'string', nullable: true, example: 'john.doe@example.com' },
      id_number: { type: 'string', nullable: true, example: '3271010101900001' },
      position_applied_for: { type: 'string', nullable: true, example: 'Software Engineer' },
      marital_status: { type: 'string', nullable: true, example: 'Menikah' },
      height_weight: { type: 'string', nullable: true, example: '170cm / 65kg' },
      driver_license: {
        type: 'array',
        nullable: true,
        items: {
          type: 'object',
          properties: {
            name: { type: 'string', example: 'SIM A' }
          }
        },
        example: [{ name: 'SIM A' }, { name: 'SIM B' }]
      },
      address_as_per_id_card: { type: 'string', nullable: true, example: 'Jl. Contoh No. 1' },
      present_address: { type: 'string', nullable: true, example: 'Jl. Contoh No. 2' },
      city: { type: 'string', nullable: true, example: 'Yogyakarta' },
      place_date_of_birth: { type: 'string', nullable: true, example: 'Yogyakarta, 01 Januari 1990' },
      blood_type: { type: 'string', nullable: true, example: 'O' },
      tax_identification_number: { type: 'string', nullable: true, example: '09.123.456.7-123.000' },
      working_available_date: { type: 'string', format: 'date', nullable: true, example: '2026-10-01' },
      relogion: { type: 'string', nullable: true, example: 'Islam' },
      tshirt_size: { type: 'string', nullable: true, example: 'L' },
      educational_background: {
        type: 'array',
        nullable: true,
        items: {
          type: 'object',
          properties: {
            type_of_school: { type: 'string', example: 'university' },
            name_of_school: { type: 'string', example: 'Universitas Jenderal Achmad Yani' },
            location: { type: 'string', example: 'Yogyakarta' },
            graduate: { type: 'string', example: 'sarjana S1' },
            major: { type: 'string', example: 'Teknik Komputer' },
            graduation_year: { type: 'string', example: '2019' }
          }
        },
        example: [{
          type_of_school: 'university',
          name_of_school: 'Universitas Jenderal Achmad Yani',
          location: 'Yogyakarta',
          graduate: 'sarjana S1',
          major: 'Teknik Komputer',
          graduation_year: '2019'
        }]
      },
      informal_education_special_qualification: {
        type: 'array',
        nullable: true,
        items: {
          type: 'object',
          properties: {
            type_of_training: { type: 'string', example: '' },
            institution_name: { type: 'string', example: '' },
            location: { type: 'string', example: '' },
            certification: { type: 'string', example: '' },
            periode: { type: 'string', example: '' }
          }
        },
        example: [{ type_of_training: '', institution_name: '', location: '', certification: '', periode: '' }]
      },
      family_background: {
        type: 'array',
        nullable: true,
        items: {
          type: 'object',
          properties: {
            relationship: { type: 'string', example: 'ayah' },
            name: { type: 'string', example: '' },
            age: { type: 'string', example: '' },
            employment: { type: 'string', example: '' },
            emergency_contact_number: { type: 'string', example: '' }
          }
        },
        example: [{ relationship: 'ayah', name: '', age: '', employment: '', emergency_contact_number: '' }]
      },
      working_experiences: {
        type: 'array',
        nullable: true,
        items: {
          type: 'object',
          properties: {
            name_of_company: { type: 'string', example: '' },
            date_from: { type: 'string', example: '' },
            date_final: { type: 'string', example: '' },
            pay_of_salary: { type: 'string', example: '' },
            name_of_supervisor: { type: 'string', example: '' },
            reason_of_leaving: { type: 'string', example: '' }
          }
        },
        example: [{ name_of_company: '', date_from: '', date_final: '', pay_of_salary: '', name_of_supervisor: '', reason_of_leaving: '' }]
      },
      references_old_company: {
        type: 'array',
        nullable: true,
        items: {
          type: 'object',
          properties: {
            name: { type: 'string', example: '' },
            position_company: { type: 'string', example: '' },
            phone: { type: 'string', example: '' }
          }
        },
        example: [{ name: '', position_company: '', phone: '' }]
      },
      following_answers: {
        type: 'array',
        nullable: true,
        items: {
          type: 'object',
          properties: {
            question: { type: 'string', example: '' },
            answers: { type: 'string', example: '' }
          }
        },
        example: [{ question: '', answers: '' }]
      },
      applicant_form_files: {
        type: 'array',
        nullable: true,
        description: 'Daftar file pelamar (jsonb). Isi file berupa link hasil upload lewat endpoint /applicant-form-files',
        items: {
          type: 'object',
          properties: {
            file_title: { type: 'string', example: 'KTP' },
            file_type: { type: 'string', example: 'image' },
            file: { type: 'string', example: 'https://cloud.inlinegroupdc.com/s/AbCdEfGhIjKlMnO' }
          }
        },
        example: [{ file_title: '', file_type: '', file: '' }]
      },
      signature_link: { type: 'string', nullable: true, example: 'https://cloud.inlinegroupdc.com/s/AbCdEfGhIjKlMnO', description: 'Share link Nextcloud dari file signature yang terakhir diupload (dikelola lewat endpoint /applicant-form-signatures)' },
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
  ApplicantFormInput: {
    type: 'object',
    properties: {
      full_name: { type: 'string', nullable: true },
      nickname: { type: 'string', nullable: true },
      no_mobile: { type: 'string', nullable: true },
      name_relationship_emergency_contact_number: { type: 'string', nullable: true },
      email: { type: 'string', nullable: true },
      id_number: { type: 'string', nullable: true },
      position_applied_for: { type: 'string', nullable: true },
      marital_status: { type: 'string', nullable: true },
      height_weight: { type: 'string', nullable: true },
      driver_license: {
        type: 'array',
        nullable: true,
        items: { type: 'object', properties: { name: { type: 'string' } } },
        example: [{ name: 'SIM A' }, { name: 'SIM B' }]
      },
      address_as_per_id_card: { type: 'string', nullable: true },
      present_address: { type: 'string', nullable: true },
      city: { type: 'string', nullable: true },
      place_date_of_birth: { type: 'string', nullable: true },
      blood_type: { type: 'string', nullable: true },
      tax_identification_number: { type: 'string', nullable: true },
      working_available_date: { type: 'string', format: 'date', nullable: true },
      relogion: { type: 'string', nullable: true },
      tshirt_size: { type: 'string', nullable: true },
      educational_background: {
        type: 'array',
        nullable: true,
        example: [{
          type_of_school: 'university',
          name_of_school: 'Universitas Jenderal Achmad Yani',
          location: 'Yogyakarta',
          graduate: 'sarjana S1',
          major: 'Teknik Komputer',
          graduation_year: '2019'
        }]
      },
      informal_education_special_qualification: {
        type: 'array',
        nullable: true,
        example: [{ type_of_training: '', institution_name: '', location: '', certification: '', periode: '' }]
      },
      family_background: {
        type: 'array',
        nullable: true,
        example: [{ relationship: 'ayah', name: '', age: '', employment: '', emergency_contact_number: '' }]
      },
      working_experiences: {
        type: 'array',
        nullable: true,
        example: [{ name_of_company: '', date_from: '', date_final: '', pay_of_salary: '', name_of_supervisor: '', reason_of_leaving: '' }]
      },
      references_old_company: {
        type: 'array',
        nullable: true,
        example: [{ name: '', position_company: '', phone: '' }]
      },
      following_answers: {
        type: 'array',
        nullable: true,
        example: [{ question: '', answers: '' }]
      },
      applicant_form_files: {
        type: 'array',
        nullable: true,
        example: [{ file_title: '', file_type: '', file: '' }]
      },
      signature_link: { type: 'string', nullable: true, example: 'https://cloud.inlinegroupdc.com/s/AbCdEfGhIjKlMnO' },
      signature_date: { type: 'string', format: 'date', nullable: true, example: '2026-09-17' }
    }
  }
}

module.exports = applicantFormsSchema
