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

const initApplicantFormSpeechToTextServices = async () => {
  const { channel, connection } = await connectRabbitMQ();
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
    await channel.prefetch(parseInt(process.env.SPEECH_TO_TEXT_CONCURRENCY || "1", 10) || 1);
    await channel.consume(
      QUEUE_NAME,
      async (msg) => {
        if (!msg) return;
        console.info(`Processing data ${msg?.fields?.consumerTag}`);
        try {
          const parseData = JSON.parse(msg.content.toString());
          const result = await processSpeechToText(parseData);
          writeLog(result?.status || "Done", JSON.stringify({ applicant_form_id: parseData?.applicant_form_id, ...result }));
        } catch (error) {
          console.info("error job", error);
          writeLog("Failed", `${error?.message || error}`);
        }
        channel.ack(msg);
      },
      {
        noAck: false,
        consumerTag: `consumer_${QUEUE_NAME}`,
      },
    );
  } catch (error) {
    console.info(error);
    writeLog("Error", `${error} - ${error.toString()}`);
  }
};

module.exports = {
  initApplicantFormSpeechToTextServices,
};
