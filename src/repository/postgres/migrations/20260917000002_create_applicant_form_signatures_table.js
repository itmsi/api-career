/**
 * Migration: Create applicant_form_signatures table
 *
 * Menyimpan riwayat file signature yang diupload ke Nextcloud. Berdiri
 * sendiri (tidak direlasikan ke applicant_forms).
 */

exports.up = function(knex) {
  return knex.schema.createTable('applicant_form_signatures', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));

    // File signature yang diupload ke Nextcloud
    table.string('file_name').notNullable();
    table.string('nextcloud_path').notNullable();
    table.string('signature_link').notNullable();
    table.date('signature_date').nullable();

    // Audit & soft delete
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.string('created_by').nullable();
    table.timestamp('updated_at').defaultTo(knex.fn.now());
    table.string('updated_by').nullable();
    table.timestamp('deleted_at').nullable();
    table.string('deleted_by').nullable();
    table.boolean('is_delete').notNullable().defaultTo(false);

    table.index(['deleted_at'], 'idx_applicant_form_signatures_deleted_at');
    table.index(['is_delete'], 'idx_applicant_form_signatures_is_delete');
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('applicant_form_signatures');
};
