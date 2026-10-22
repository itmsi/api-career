/**
 * Migration: Add summary & summary_update (text) to applicant_form_contents
 *
 * Ringkasan hasil speech to text, dikirim lewat
 * POST /applicant_form_contents/update-stt
 */

exports.up = async function (knex) {
  await knex.schema.alterTable("applicant_form_contents", (table) => {
    table.text("summary").nullable();
    table.text("summary_update").nullable();
  });
};

exports.down = async function (knex) {
  await knex.schema.alterTable("applicant_form_contents", (table) => {
    table.dropColumn("summary_update");
    table.dropColumn("summary");
  });
};
