/**
 * Migration: Add step (varchar) column to applicant_form_contents
 *
 * Diisi saat applicant form dibuat/diupdate, diambil dari master question
 * (db_hrm_master_questions.step) berdasarkan id_question content tsb.
 */

exports.up = async function (knex) {
  await knex.schema.alterTable("applicant_form_contents", (table) => {
    table.string("step", 255).nullable();
  });
};

exports.down = async function (knex) {
  await knex.schema.alterTable("applicant_form_contents", (table) => {
    table.dropColumn("step");
  });
};
