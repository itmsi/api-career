/**
 * Migration: Add applicant_form_id (uuid) column to applicant_form_signatures
 *
 * Diisi otomatis saat applicant form disimpan dan signature_link signature ini
 * dipakai di applicant_forms.signature_link.
 */

exports.up = async function (knex) {
  await knex.schema.alterTable("applicant_form_signatures", (table) => {
    table.uuid("applicant_form_id").nullable();
    table.index(["applicant_form_id"], "idx_applicant_form_signatures_applicant_form_id");
  });
};

exports.down = async function (knex) {
  await knex.schema.alterTable("applicant_form_signatures", (table) => {
    table.dropIndex(["applicant_form_id"], "idx_applicant_form_signatures_applicant_form_id");
    table.dropColumn("applicant_form_id");
  });
};
