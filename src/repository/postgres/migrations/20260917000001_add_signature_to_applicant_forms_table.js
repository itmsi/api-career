/**
 * Migration: Add signature_link and signature_date columns to applicant_forms table
 */

exports.up = function(knex) {
  return knex.schema.alterTable('applicant_forms', (table) => {
    table.string('signature_link').nullable();
    table.date('signature_date').nullable();
  });
};

exports.down = function(knex) {
  return knex.schema.alterTable('applicant_forms', (table) => {
    table.dropColumn('signature_link');
    table.dropColumn('signature_date');
  });
};
