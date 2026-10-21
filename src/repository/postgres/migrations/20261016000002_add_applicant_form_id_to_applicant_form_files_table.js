/**
 * Migration: Add applicant_form_id (uuid) column to applicant_form_files
 *
 * Diisi otomatis saat applicant form disimpan dan file_link file ini dipakai
 * di applicant_forms.applicant_form_files.
 */

exports.up = async function (knex) {
  await knex.schema.alterTable("applicant_form_files", (table) => {
    table.uuid("applicant_form_id").nullable();
    table.index(["applicant_form_id"], "idx_applicant_form_files_applicant_form_id");
  });
};

exports.down = async function (knex) {
  await knex.schema.alterTable("applicant_form_files", (table) => {
    table.dropIndex(["applicant_form_id"], "idx_applicant_form_files_applicant_form_id");
    table.dropColumn("applicant_form_id");
  });
};
