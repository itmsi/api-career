/**
 * Migration: Add summary_score (numeric) & summary_rating (varchar)
 * to applicant_form_contents
 *
 * Diisi otomatis dari JSON hasil penilaian AI di summary_update
 * (weighted_score dan rating), supaya skor tiap audio bisa difilter/diurutkan.
 * - summary_score: skala 0-5, 2 angka desimal
 * - summary_rating: Strong, Good, Consider, Concern
 */

exports.up = async function (knex) {
  await knex.schema.alterTable("applicant_form_contents", (table) => {
    table.decimal("summary_score", 3, 2).nullable();
    table.string("summary_rating", 20).nullable();
    table.index(["applicant_form_id", "summary_score"]);
  });
};

exports.down = async function (knex) {
  await knex.schema.alterTable("applicant_form_contents", (table) => {
    table.dropIndex(["applicant_form_id", "summary_score"]);
    table.dropColumn("summary_rating");
    table.dropColumn("summary_score");
  });
};
