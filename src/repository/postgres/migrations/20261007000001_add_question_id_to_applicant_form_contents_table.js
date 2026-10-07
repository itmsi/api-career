/**
 * Migration: Add id_question (uuid) column to applicant_form_contents
 *
 * Relasi ke master question (db_hrm_master_questions.id) yang dijawab
 * lewat content video/audio. Tidak pakai foreign key karena tabel
 * master question berupa foreign table (FDW).
 */

exports.up = async function (knex) {
  await knex.schema.alterTable("applicant_form_contents", (table) => {
    table.uuid("id_question").nullable();
    table.index(["id_question"], "idx_applicant_form_contents_id_question");
  });
};

exports.down = async function (knex) {
  await knex.schema.alterTable("applicant_form_contents", (table) => {
    table.dropIndex(["id_question"], "idx_applicant_form_contents_id_question");
    table.dropColumn("id_question");
  });
};
