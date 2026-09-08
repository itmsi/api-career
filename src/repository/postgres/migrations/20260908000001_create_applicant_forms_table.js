/**
 * Migration: Create applicant_forms table
 */

exports.up = function(knex) {
  return knex.schema.createTable('applicant_forms', (table) => {
    // Primary Key with UUID
    table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));

    // Personal data
    table.string('full_name').nullable();
    table.string('nickname').nullable();
    table.string('no_mobile').nullable();
    table.string('name_relationship_emergency_contact_number').nullable();
    table.string('email').nullable();
    table.string('id_number').nullable();
    table.string('position_applied_for').nullable();
    table.string('marital_status').nullable();
    table.string('height_weight').nullable();
    table.jsonb('driver_license').nullable();
    table.text('address_as_per_id_card').nullable();
    table.text('present_address').nullable();
    table.string('city').nullable();
    table.string('place_date_of_birth').nullable();
    table.string('blood_type').nullable();
    table.string('tax_identification_number').nullable();
    table.date('working_available_date').nullable();
    table.string('relogion').nullable();
    table.string('tshirt_size').nullable();

    // Background data (jsonb arrays)
    table.jsonb('educational_background').nullable();
    table.jsonb('informal_education_special_qualification').nullable();
    table.jsonb('family_background').nullable();
    table.jsonb('working_experiences').nullable();
    table.jsonb('references_old_company').nullable();
    table.jsonb('following_answers').nullable();

    // Audit & soft delete
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.string('created_by').nullable();
    table.timestamp('updated_at').defaultTo(knex.fn.now());
    table.string('updated_by').nullable();
    table.timestamp('deleted_at').nullable();
    table.string('deleted_by').nullable();
    table.boolean('is_delete').notNullable().defaultTo(false);

    // Indexes for better query performance
    table.index(['deleted_at'], 'idx_applicant_forms_deleted_at');
    table.index(['is_delete'], 'idx_applicant_forms_is_delete');
    table.index(['created_at'], 'idx_applicant_forms_created_at');
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('applicant_forms');
};
