const multer = require('multer')

const UPLOAD_MAX_SIZE = Number(process.env.UPLOAD_MAX_SIZE) || 52428800

const ALLOWED_MIME_TYPES = {
  file_video: [
    'video/mp4',
    'video/webm',
    'video/quicktime',
    'video/x-msvideo',
    'video/x-matroska',
    'video/mpeg'
  ],
  file_audio: [
    'audio/mpeg',
    'audio/mp3',
    'audio/wav',
    'audio/x-wav',
    'audio/webm',
    'audio/ogg',
    'audio/aac',
    'audio/mp4',
    'audio/x-m4a'
  ]
}

const storage = multer.memoryStorage()

const fileFilter = (req, file, cb) => {
  const allowed = ALLOWED_MIME_TYPES[file.fieldname] || []
  if (allowed.includes(file.mimetype)) {
    cb(null, true)
  } else {
    cb(new Error(`Tipe file ${file.fieldname} tidak diizinkan. Tipe yang diizinkan: ${allowed.join(', ')}`), false)
  }
}

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: UPLOAD_MAX_SIZE,
    files: 2
  }
})

const uploadContentFiles = upload.fields([
  { name: 'file_video', maxCount: 1 },
  { name: 'file_audio', maxCount: 1 }
])

const handleFileUpload = (req, res, next) => {
  uploadContentFiles(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({
          success: false,
          message: `File terlalu besar. Maksimal ${Math.floor(UPLOAD_MAX_SIZE / 1024 / 1024)}MB.`,
          errors: null,
          timestamp: new Date().toISOString()
        })
      }
      return res.status(400).json({
        success: false,
        message: 'Gagal upload file',
        errors: err.message,
        timestamp: new Date().toISOString()
      })
    } else if (err) {
      return res.status(400).json({
        success: false,
        message: err.message,
        errors: null,
        timestamp: new Date().toISOString()
      })
    }
    next()
  })
}

module.exports = { handleFileUpload }
