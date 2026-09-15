/**
 * Migration: Cegah undangan aktif ganda untuk email yang sama
 * di applicant_form_invitations.
 *
 * Sebelumnya tidak ada constraint apa pun di level DB, sehingga
 * double-click / dua request yang datang bersamaan (dalam hitungan
 * milidetik) pada POST /applicant-invitations/create bisa lolos
 * dan membuat dua baris undangan untuk email yang sama sekaligus
 * (race condition check-then-insert di level aplikasi tidak cukup
 * untuk mencegah ini).
 *
 * Unique index bersifat partial: hanya berlaku untuk undangan yang
 * masih aktif (belum di-soft-delete dan belum selesai diisi), supaya
 * tetap bisa mengundang ulang orang yang sama setelah undangan lama
 * selesai/di-nonaktifkan. Dibuat lewat knex.raw karena knex schema
 * builder tidak punya API untuk partial unique index.
 *
 * Data lama kemungkinan sudah ada duplikat aktif untuk email yang sama
 * (dari bug race condition ini sendiri), jadi sebelum index dibuat,
 * duplikat itu dirapikan dulu: untuk tiap email yang punya lebih dari
 * satu undangan aktif, hanya yang paling baru (created_at terbesar)
 * yang dipertahankan aktif, sisanya di-soft-delete (bukan dihapus
 * permanen, jadi tetap bisa ditelusuri/dipulihkan manual kalau perlu).
 */

const INDEX_NAME = 'uq_applicant_form_invitations_active_email'

exports.up = async function (knex) {
  await knex.raw(`
    WITH ranked AS (
      SELECT id, ROW_NUMBER() OVER (
        PARTITION BY lower(email)
        ORDER BY created_at DESC, id DESC
      ) AS rn
      FROM applicant_form_invitations
      WHERE is_delete = false AND is_completed = false
    )
    UPDATE applicant_form_invitations afi
    SET is_delete = true,
        deleted_at = now(),
        deleted_by = 'system:migration_20260915000001_dedupe',
        updated_at = now()
    FROM ranked
    WHERE afi.id = ranked.id AND ranked.rn > 1
  `)

  await knex.raw(`
    CREATE UNIQUE INDEX ${INDEX_NAME}
    ON applicant_form_invitations (lower(email))
    WHERE is_delete = false AND is_completed = false
  `)
}

exports.down = function (knex) {
  return knex.raw(`DROP INDEX IF EXISTS ${INDEX_NAME}`)
}
