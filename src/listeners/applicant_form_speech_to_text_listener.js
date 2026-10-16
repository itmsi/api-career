const { connectRabbitMQ } = require("../config/rabbitmq");
const { logger, todayFormat } = require("../utils");
const {
  QUEUE_NAME,
  processSpeechToText,
} = require("../modules/applicant_forms/speech_to_text");

const writeLog = (status, content) => {
  logger("applicant-form-speech-to-text.txt", "applicant_form_speech_to_text").write(
    `${status} applicant-form-speech-to-text-${todayFormat("YYYY-MM-DD hh:mm:ss")}: ${content}\n`,
  );
};

const RECONNECT_DELAY_MS = 10000;
let reconnectTimer = null;

// Coba connect ulang kalau RabbitMQ belum siap / koneksi putus, supaya
// consumer STT tidak mati diam-diam
const scheduleReconnect = (reason) => {
  if (reconnectTimer) return;
  console.error(`[STT] [CONSUME][RECONNECT] ${reason}, mencoba lagi dalam ${RECONNECT_DELAY_MS / 1000} detik`);
  reconnectTimer = setTimeout(() => {
    reconnectTimer = null;
    initApplicantFormSpeechToTextServices();
  }, RECONNECT_DELAY_MS);
};

const initApplicantFormSpeechToTextServices = async () => {
  console.info(`[STT] [CONSUME][INIT] menghubungkan listener ke queue ${QUEUE_NAME}`);

  let channel;
  let connection;
  try {
    ({ channel, connection } = await connectRabbitMQ());
  } catch (error) {
    writeLog("Error", `connect RabbitMQ gagal: ${error?.message || error}`);
    scheduleReconnect(`connect RabbitMQ gagal: ${error?.message || error?.code || error}`);
    return;
  }

  connection.on("error", (error) => {
    console.error(`[STT] [CONSUME][CONNECTION_ERROR] ${error?.message || error}`);
  });
  connection.on("close", () => scheduleReconnect("koneksi RabbitMQ tertutup"));

  process.once("SIGINT", async () => {
    console.info("got sigint, closing connection");
    await channel.close();
    await connection.close();
    process.exit(0);
  });

  try {
    await channel.assertQueue(QUEUE_NAME, { durable: true });
    // Satu request speech to text bisa sampai 15 menit, jadi jumlah yang
    // diproses bersamaan dibatasi
    const prefetch = parseInt(process.env.SPEECH_TO_TEXT_CONCURRENCY || "1", 10) || 1;
    await channel.prefetch(prefetch);
    const { messageCount, consumerCount } = await channel.checkQueue(QUEUE_NAME);
    await channel.consume(
      QUEUE_NAME,
      async (msg) => {
        if (!msg) {
          console.error("[STT] [CONSUME][CANCELLED] consumer dibatalkan oleh RabbitMQ");
          return;
        }
        try {
          const parseData = JSON.parse(msg.content.toString());
          console.info(`[STT] [CONSUME][RECEIVED] content_id=${parseData?.content_id} applicant_form_id=${parseData?.applicant_form_id} audio_url=${parseData?.audio_url} redelivered=${msg.fields?.redelivered}`);
          const result = await processSpeechToText(parseData);
          writeLog(result?.status || "Done", JSON.stringify({ applicant_form_id: parseData?.applicant_form_id, ...result }));
          console.info(`[STT] [CONSUME][DONE] content_id=${parseData?.content_id} status=${result?.status}`);
        } catch (error) {
          console.error("[STT] [CONSUME][ERROR]", error?.message || error);
          writeLog("Failed", `${error?.message || error}`);
        }
        channel.ack(msg);
        console.info("[STT] [CONSUME][ACK] message selesai di-ack");
      },
      {
        noAck: false,
        consumerTag: `consumer_${QUEUE_NAME}_${process.pid}`,
      },
    );
    console.info(`[STT] [CONSUME][READY] listener aktif di queue ${QUEUE_NAME} (pesan menunggu=${messageCount}, consumer lain=${consumerCount}, prefetch=${prefetch})`);
  } catch (error) {
    console.error(`[STT] [CONSUME][INIT_FAILED] ${error?.message || error}`);
    writeLog("Error", `${error} - ${error.toString()}`);
    await connection.close().catch(() => {});
  }
};

module.exports = {
  initApplicantFormSpeechToTextServices,
};
