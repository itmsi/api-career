/**
 * Migration: Add transcription_id (varchar) to applicant_form_contents
 *
 * ID transcription dari service speech to text, dikirim lewat
 * POST /applicant_form_contents/update-stt
 */

exports.up = async function (knex) {
  await knex.schema.alterTable("applicant_form_contents", (table) => {
    table.string("transcription_id").nullable();
  });
};

exports.down = async function (knex) {
  await knex.schema.alterTable("applicant_form_contents", (table) => {
    table.dropColumn("transcription_id");
  });
};
