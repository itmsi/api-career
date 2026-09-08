const applicantFormsSchema = {
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
      }
    }
  }
}

module.exports = applicantFormsSchema
