/**
 * Migration: Add status_summary (varchar) & message_summary (text)
 * to applicant_form_contents
 *
 * Status & pesan proses summarize, dikirim lewat
 * POST /applicant_form_contents/update-stt
 * - status_summary: Pending, Success, Failed
 */

exports.up = async function (knex) {
  await knex.schema.alterTable("applicant_form_contents", (table) => {
    table.string("status_summary", 20).nullable();
    table.text("message_summary").nullable();
  });
};

exports.down = async function (knex) {
  await knex.schema.alterTable("applicant_form_contents", (table) => {
    table.dropColumn("message_summary");
    table.dropColumn("status_summary");
  });
};
