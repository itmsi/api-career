module.exports = {
  development: {
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
    sender: process.env.EMAIL_FROM,
    secure: process?.env?.SMTP_SECURE === 'true',
    ignoreTLS: process?.env?.IGNORE_TLS ?? false
  },
  production: {
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
    sender: process.env.EMAIL_FROM,
    secure: process?.env?.SMTP_SECURE === 'true',
    tls: {
      rejectUnauthorized: false
    }
  }
}
