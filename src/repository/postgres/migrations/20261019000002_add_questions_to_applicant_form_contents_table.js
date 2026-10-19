/**
 * Migration: Add questions (jsonb) column to applicant_form_contents
 *
 * Diisi saat create/update content, diambil dari master question
 * (db_hrm_master_questions) berdasarkan id_question, dengan format:
 * [{ question_id, question_en, question_cn, focus_assessment, step }]
 */

exports.up = async function (knex) {
  await knex.schema.alterTable("applicant_form_contents", (table) => {
    table.jsonb("questions").nullable();
  });
};

exports.down = async function (knex) {
  await knex.schema.alterTable("applicant_form_contents", (table) => {
    table.dropColumn("questions");
  });
};
