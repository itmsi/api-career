/**
 * Migration: Add status_send_email & response_send_email to applicant_form_invitations
 *
 * Diisi setiap kali email undangan dikirim (create & resend):
 * - status_send_email: Process / Success / Failed
 * - response_send_email: JSON (text) berisi pesan dari sistem kita dan,
 *   jika ada, respon dari provider email (SMTP)
 */

exports.up = async function (knex) {
  await knex.schema.alterTable("applicant_form_invitations", (table) => {
    table.string("status_send_email").nullable();
    table.text("response_send_email").nullable();
  });
};

exports.down = async function (knex) {
  await knex.schema.alterTable("applicant_form_invitations", (table) => {
    table.dropColumn("status_send_email");
    table.dropColumn("response_send_email");
  });
};
