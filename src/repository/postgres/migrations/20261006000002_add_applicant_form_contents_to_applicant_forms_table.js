/**
 * Migration: Add applicant_form_contents (jsonb) column to applicant_forms
 *
 * Menyimpan daftar content (video & audio) milik form, berisi link hasil
 * upload lewat endpoint /applicant_form_contents.
 */

exports.up = async function(knex) {
  await knex.schema.alterTable('applicant_forms', (table) => {
    table.jsonb('applicant_form_contents').nullable();
  });
};

exports.down = async function(knex) {
  await knex.schema.alterTable('applicant_forms', (table) => {
    table.dropColumn('applicant_form_contents');
  });
};
