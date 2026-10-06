/**
 * Migration: Create applicant_form_contents table
 *
 * applicant_form_contents menyimpan file video dan audio yang diupload ke
 * Nextcloud. Video dan audio sama-sama opsional, jadi semua kolom file nullable.
 */

exports.up = async function(knex) {
  await knex.schema.createTable('applicant_form_contents', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));

    // Video
    table.string('file_title_video').nullable();
    table.string('file_type_video').nullable();
    table.string('file_name_video').nullable();
    table.string('nextcloud_path_video').nullable();
    table.string('file_link_video').nullable();

    // Audio
    table.string('file_title_audio').nullable();
    table.string('file_type_audio').nullable();
    table.string('file_name_audio').nullable();
    table.string('nextcloud_path_audio').nullable();
    table.string('file_link_audio').nullable();

    // Audit & soft delete
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.string('created_by').nullable();
    table.timestamp('updated_at').defaultTo(knex.fn.now());
    table.string('updated_by').nullable();
    table.timestamp('deleted_at').nullable();
    table.string('deleted_by').nullable();
    table.boolean('is_delete').notNullable().defaultTo(false);

    table.index(['deleted_at'], 'idx_applicant_form_contents_deleted_at');
    table.index(['is_delete'], 'idx_applicant_form_contents_is_delete');
  });
};

exports.down = async function(knex) {
  await knex.schema.dropTable('applicant_form_contents');
};
