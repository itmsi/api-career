/**
 * Backfill: jalankan ulang linkUploadsToForm + publish move Nextcloud
 * untuk applicant form yang video/audio contents-nya belum ter-link.
 *
 * Default = DRY RUN (hanya menampilkan daftar). Tambah --apply untuk eksekusi.
 *
 *   node scripts/relink-applicant-form-uploads.js                 # dry run semua form
 *   node scripts/relink-applicant-form-uploads.js --id=<uuid>     # dry run 1 form
 *   node scripts/relink-applicant-form-uploads.js --id=<uuid> --apply
 *   node scripts/relink-applicant-form-uploads.js --apply         # semua form
 *
 * Tambah --no-move kalau hanya mau link DB tanpa publish ke RabbitMQ/Nextcloud.
 */
require("dotenv").config();

const { pgCore } = require("../src/config/database");
const repository = require("../src/modules/applicant_forms/repository");
const service = require("../src/modules/applicant_forms/service");
const { buildMessage } = require("../src/modules/applicant_forms/file_mover");
const { publishToRabbitMqQueueSingle } = require("../src/config/rabbitmq");
const { EXCHANGES } = require("../src/utils/constant");

const args = process.argv.slice(2);
const APPLY = args.includes("--apply");
const NO_MOVE = args.includes("--no-move");
const ID = (args.find((a) => a.startsWith("--id=")) || "").split("=")[1];

const findUnlinkedFormIds = async () => {
  const { rows } = await pgCore.raw(
    `
    SELECT DISTINCT af.id, af.full_name, af.created_at
    FROM applicant_forms af
    CROSS JOIN LATERAL jsonb_array_elements(
      CASE WHEN jsonb_typeof(af.applicant_form_contents) = 'array'
           THEN af.applicant_form_contents ELSE '[]'::jsonb END
    ) AS item
    WHERE af.deleted_at IS NULL
      AND coalesce(item->>'file_video','') <> ''
      AND (:id::text IS NULL OR af.id::text = :id::text)
      AND NOT EXISTS (
        SELECT 1 FROM applicant_form_contents c
        WHERE c.file_link_video = item->>'file_video'
          AND c.applicant_form_id = af.id
          AND c.deleted_at IS NULL)
    ORDER BY af.created_at
    `,
    { id: ID || null },
  );
  return rows;
};

const main = async () => {
  const targets = await findUnlinkedFormIds();
  console.log(
    `${APPLY ? "APPLY" : "DRY RUN"}: ${targets.length} form belum ter-link${ID ? ` (id=${ID})` : ""}`,
  );
  if (!APPLY) {
    targets.forEach((t) => console.log(` - ${t.id}  ${t.full_name}  ${t.created_at.toISOString()}`));
    console.log("\nTambah --apply untuk menjalankan.");
    return;
  }

  const rabbitOn =
    process.env.RABBITMQ_ENABLED === "true" &&
    process.env.RABBITMQ_URL &&
    process.env.RABBITMQ_URL !== "disabled";
  if (!NO_MOVE && !rabbitOn) {
    console.warn("RABBITMQ_ENABLED belum true -> move Nextcloud dilewati, hanya link DB.");
  }

  for (const t of targets) {
    try {
      const form = await repository.findById(t.id);
      if (!form) {
        console.log(`SKIP ${t.id}: form tidak ditemukan`);
        continue;
      }
      await service.linkUploadsToForm(form);
      let moved = "tidak";
      if (!NO_MOVE && rabbitOn) {
        const message = buildMessage(form);
        if (message) {
          await publishToRabbitMqQueueSingle(
            EXCHANGES.APPLICANT_FORM_FILES,
            EXCHANGES.APPLICANT_FORM_FILES,
            message,
          );
          moved = "dipublish";
        }
      }
      console.log(`OK   ${t.id}  ${t.full_name}  (move: ${moved})`);
    } catch (error) {
      console.error(`FAIL ${t.id}: ${error?.message || error}`);
    }
  }
};

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(() => pgCore.destroy());
