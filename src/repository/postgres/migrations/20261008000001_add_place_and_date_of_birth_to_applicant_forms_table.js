/**
 * Migration: Add place_of_birth (string) and date_of_birth (date) to applicant_forms
 *
 * Memisahkan tempat dan tanggal lahir. Kolom place_date_of_birth lama
 * dipertahankan agar data yang sudah ada tidak hilang.
 */

exports.up = async function (knex) {
  await knex.schema.alterTable("applicant_forms", (table) => {
    table.string("place_of_birth").nullable();
    table.date("date_of_birth").nullable();
  });
};

exports.down = async function (knex) {
  await knex.schema.alterTable("applicant_forms", (table) => {
    table.dropColumn("place_of_birth");
    table.dropColumn("date_of_birth");
  });
};
