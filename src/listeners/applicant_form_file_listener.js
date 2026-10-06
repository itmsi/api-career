const { connectRabbitMQ } = require("../config/rabbitmq");
const { logger, todayFormat } = require("../utils");
const {
  QUEUE_NAME,
  processMoveFiles,
} = require("../modules/applicant_forms/file_mover");

const writeLog = (status, content) => {
  logger("applicant-form-files.txt", "applicant_form_files").write(
    `${status} move-applicant-form-files-${todayFormat("YYYY-MM-DD hh:mm:ss")}: ${content}\n`,
  );
};

const initApplicantFormFileServices = async () => {
  const { channel, connection } = await connectRabbitMQ();
  process.once("SIGINT", async () => {
    console.info("got sigint, closing connection");
    await channel.close();
    await connection.close();
    process.exit(0);
  });

  try {
    await channel.assertQueue(QUEUE_NAME, { durable: true });
    // Diproses satu per satu supaya tidak ada dua message yang memindahkan
    // file yang sama secara bersamaan
    await channel.prefetch(1);
    await channel.consume(
      QUEUE_NAME,
      async (msg) => {
        if (!msg) return;
        console.info(`Processing data ${msg?.fields?.consumerTag}`);
        try {
          const parseData = JSON.parse(msg.content.toString());
          const result = await processMoveFiles(parseData);
          writeLog("Success", JSON.stringify({ applicant_form_id: parseData?.applicant_form_id, ...result }));
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
  initApplicantFormFileServices,
};
