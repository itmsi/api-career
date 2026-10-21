/**
 * Migration: Add applicant_form_id (uuid) & speech_text (text) columns to
 * applicant_form_contents
 *
 * applicant_form_id diisi otomatis saat applicant form disimpan dan
 * file_link_video content ini dipakai di applicant_forms.applicant_form_contents.
 * speech_text menyimpan hasil teks dari rekaman (speech to text).
 */

exports.up = async function (knex) {
  await knex.schema.alterTable("applicant_form_contents", (table) => {
    table.uuid("applicant_form_id").nullable();
    table.text("speech_text").nullable();
    table.index(["applicant_form_id"], "idx_applicant_form_contents_applicant_form_id");
  });
};

exports.down = async function (knex) {
  await knex.schema.alterTable("applicant_form_contents", (table) => {
    table.dropIndex(["applicant_form_id"], "idx_applicant_form_contents_applicant_form_id");
    table.dropColumn("speech_text");
    table.dropColumn("applicant_form_id");
  });
};
