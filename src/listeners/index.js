const { logger, logDateFormat, fullDateFormat } = require('../utils')
const { initEmailServices } = require('./email_listener')
const { initApplicantFormFileServices } = require('./applicant_form_file_listener')
const { initApplicantFormSpeechToTextServices } = require('./applicant_form_speech_to_text_listener')

// Setiap listener dijalankan terpisah, supaya kalau satu gagal (mis. RabbitMQ
// belum siap saat container start) listener lain tetap jalan
const LISTENERS = [
  ['email', initEmailServices],
  ['applicant_form_files', initApplicantFormFileServices],
  ['applicant_form_speech_to_text', initApplicantFormSpeechToTextServices]
]

const initListener = async () => {
  const fileName = `listener-${logDateFormat()}.txt`
  console.info('Listener is working waiting for message')

  for (const [name, init] of LISTENERS) {
    try {
      await init()
      logger(fileName, 'listener').write(`Listener ${name} is working waiting for message ${fullDateFormat(new Date().toISOString())} \n`)
    } catch (error) {
      console.info(`Listener ${name} is not working with error`, error)
      logger(fileName, 'listener').write(`Listener ${name} is not working with error ${fullDateFormat(new Date().toISOString())} ${error}\n`)
    }
  }
}

module.exports = {
  initListener
}