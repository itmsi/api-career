/**
 * Migration: Add summary_all_status (varchar) & summary_all_message (text)
 * to applicant_forms
 *
 * Status & pesan proses summarize all:
 * - POST /applicant-forms/create-summarize-all -> Pending
 * - POST /applicant-forms/summary-all -> dikirim service AI (Success/Failed)
 */

exports.up = async function (knex) {
  await knex.schema.alterTable("applicant_forms", (table) => {
    table.string("summary_all_status", 20).nullable();
    table.text("summary_all_message").nullable();
  });
};

exports.down = async function (knex) {
  await knex.schema.alterTable("applicant_forms", (table) => {
    table.dropColumn("summary_all_message");
    table.dropColumn("summary_all_status");
  });
};
