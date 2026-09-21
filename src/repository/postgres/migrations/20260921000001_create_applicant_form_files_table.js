/**
 * Migration: Create applicant_form_files table and add applicant_form_files
 * (jsonb) column to applicant_forms
 *
 * applicant_form_files menyimpan file yang diupload ke Nextcloud. Berdiri
 * sendiri (tidak direlasikan ke applicant_forms), sedangkan kolom jsonb di
 * applicant_forms menyimpan daftar file milik form tsb.
 */

exports.up = async function(knex) {
  await knex.schema.createTable('applicant_form_files', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));

    table.string('file_title').notNullable();
    table.string('file_type').notNullable();
    table.string('file_name').notNullable();
    table.string('nextcloud_path').notNullable();
    table.string('file_link').notNullable();

    // Audit & soft delete
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.string('created_by').nullable();
    table.timestamp('updated_at').defaultTo(knex.fn.now());
    table.string('updated_by').nullable();
    table.timestamp('deleted_at').nullable();
    table.string('deleted_by').nullable();
    table.boolean('is_delete').notNullable().defaultTo(false);

    table.index(['deleted_at'], 'idx_applicant_form_files_deleted_at');
    table.index(['is_delete'], 'idx_applicant_form_files_is_delete');
  });

  await knex.schema.alterTable('applicant_forms', (table) => {
    table.jsonb('applicant_form_files').nullable();
  });
};

exports.down = async function(knex) {
  await knex.schema.alterTable('applicant_forms', (table) => {
    table.dropColumn('applicant_form_files');
  });
  await knex.schema.dropTable('applicant_form_files');
};
