/**
 * Migration: Add summary_score (numeric) & summary_rating (varchar)
 * to applicant_forms
 *
 * Skor kandidat = rata-rata summary_score semua content (audio) miliknya.
 * Dihitung ulang otomatis setiap summary_update content berubah.
 * - summary_score: skala 0-5, 2 angka desimal
 * - summary_rating: Strong, Good, Consider, Concern (dari rata-rata)
 */

exports.up = async function (knex) {
  await knex.schema.alterTable("applicant_forms", (table) => {
    table.decimal("summary_score", 3, 2).nullable();
    table.string("summary_rating", 20).nullable();
    table.index(["summary_score"]);
  });
};

exports.down = async function (knex) {
  await knex.schema.alterTable("applicant_forms", (table) => {
    table.dropIndex(["summary_score"]);
    table.dropColumn("summary_rating");
    table.dropColumn("summary_score");
  });
};
