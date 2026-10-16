/**
 * Migration: Add status_speech_text (varchar) & message_speech_text (text)
 * columns to applicant_form_contents
 *
 * Dipakai proses antrian speech to text untuk file audio:
 * - status_speech_text: Pending (antrian dibuat), Success, Failed
 * - message_speech_text: pesan/respon dari API speech to text (dipotong
 *   maksimal SPEECH_TEXT_MESSAGE_MAX_LENGTH karakter di level aplikasi)
 */

exports.up = async function (knex) {
  await knex.schema.alterTable("applicant_form_contents", (table) => {
    table.string("status_speech_text", 20).nullable();
    table.text("message_speech_text").nullable();
  });
};

exports.down = async function (knex) {
  await knex.schema.alterTable("applicant_form_contents", (table) => {
    table.dropColumn("message_speech_text");
    table.dropColumn("status_speech_text");
  });
};
