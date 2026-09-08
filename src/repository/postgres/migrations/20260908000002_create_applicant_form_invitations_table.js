/**
 * Migration: Create applicant_form_invitations table
 *
 * Menyimpan undangan pengisian applicant form yang dikirim oleh HR.
 * Setiap undangan punya token akses (JWT) dengan masa berlaku (expired)
 * dan flag `is_completed` supaya link tidak bisa dipakai ulang setelah
 * form diisi.
 */

exports.up = function(knex) {
  return knex.schema.createTable('applicant_form_invitations', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));

    // Data pelamar yang diinput HR
    table.string('full_name').notNullable();
    table.string('email').notNullable();
    table.string('no_mobile').notNullable();

    // Token akses (JWT) beserta masa berlakunya
    table.text('token').notNullable();
    table.timestamp('token_expires_at').notNullable();

    // Status pengisian form
    table.boolean('is_completed').notNullable().defaultTo(false);
    table.timestamp('completed_at').nullable();
    table.uuid('applicant_form_id').nullable();

    // Audit & soft delete
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.string('created_by').nullable();
    table.timestamp('updated_at').defaultTo(knex.fn.now());
    table.string('updated_by').nullable();
    table.timestamp('deleted_at').nullable();
    table.string('deleted_by').nullable();
    table.boolean('is_delete').notNullable().defaultTo(false);

    table.index(['token'], 'idx_applicant_form_invitations_token');
    table.index(['email'], 'idx_applicant_form_invitations_email');
    table.index(['is_completed'], 'idx_applicant_form_invitations_is_completed');
    table.index(['is_delete'], 'idx_applicant_form_invitations_is_delete');
    table.index(['token_expires_at'], 'idx_applicant_form_invitations_token_expires_at');
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('applicant_form_invitations');
};
