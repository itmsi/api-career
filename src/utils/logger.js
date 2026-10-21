const fs = require('fs')

const generateFolderLogs = (dynamicFolder, path) => {
  const today = new Date()
  const year = today.getFullYear()
  const month = today.getMonth() + 1
  const date = today.getDate()
  const folderPath = `./${dynamicFolder}/${path}/${year}/${month}/${date}/`
  const pathForDatabase = `${dynamicFolder}/${path}/${year}/${month}/${date}/`
  try {
    if (!fs.existsSync(folderPath)) {
      console.log('generated folder');
      fs.mkdirSync(folderPath, { recursive: true, mode: 0o755 })
      return {
        pathForDatabase,
        folderPath
      }
    }
    return {
      pathForDatabase,
      folderPath
    }
  } catch (error) {
    console.log(error)
    return error
  }
}

// Return objek dengan method write(content). Kalau folder/file log tidak bisa
// ditulis (mis. permission denied di volume docker), isi log dialihkan ke
// console supaya tidak memicu uncaughtException di proses pemanggil.
const logger = (fileName, type) => {
  const fallback = (content, error) => {
    console.error(`Gagal menulis log ${type}/${fileName}: ${error?.message || error}`)
    console.info(String(content).trimEnd())
  }

  return {
    write: (content) => {
      const result = generateFolderLogs('logs', type)
      if (!result?.folderPath) return fallback(content, result)

      const finalPath = `${__dirname}/../../${result.folderPath}/${fileName}`
      fs.appendFile(finalPath, content, { mode: 0o755 }, (error) => {
        if (error) fallback(content, error)
      })
      return true
    }
  }
}

// Enhanced logger with different log levels
class Logger {
  constructor() {
    this.levels = {
      error: 0,
      warn: 1,
      info: 2,
      debug: 3
    }
    this.currentLevel = this.levels.info
  }

  formatMessage(level, message, meta = {}) {
    const timestamp = new Date().toISOString()
    const metaStr = Object.keys(meta).length > 0 ? ` ${JSON.stringify(meta)}` : ''
    return `[${timestamp}] ${level.toUpperCase()}: ${message}${metaStr}\n`
  }

  log(level, message, meta = {}) {
    if (this.levels[level] <= this.currentLevel) {
      const formattedMessage = this.formatMessage(level, message, meta)
      console.log(formattedMessage.trim())
      
      // Also write to file
      try {
        const { folderPath } = generateFolderLogs('logs', 'application')
        const finalPath = `${__dirname}/../../${folderPath}/app.log`
        fs.appendFileSync(finalPath, formattedMessage)
      } catch (error) {
        console.error('Failed to write to log file:', error)
      }
    }
  }

  error(message, meta = {}) {
    this.log('error', message, meta)
  }

  warn(message, meta = {}) {
    this.log('warn', message, meta)
  }

  info(message, meta = {}) {
    this.log('info', message, meta)
  }

  debug(message, meta = {}) {
    this.log('debug', message, meta)
  }
}

module.exports = {
  logger,
  Logger: new Logger()
}
