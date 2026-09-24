const multer = require('multer')

const UPLOAD_MAX_SIZE = Number(process.env.UPLOAD_MAX_SIZE) || 52428800

const ALLOWED_MIME_TYPES = [
  'image/png',
  'image/jpeg',
  'image/jpg',
  'image/webp',
  'application/pdf'
]

const storage = multer.memoryStorage()

const fileFilter = (req, file, cb) => {
  if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    cb(null, true)
  } else {
    cb(new Error(`Tipe file tidak diizinkan. Tipe yang diizinkan: ${ALLOWED_MIME_TYPES.join(', ')}`), false)
  }
}

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: UPLOAD_MAX_SIZE,
    files: 1
  }
})

const uploadFormFile = upload.single('file')

const handleFileUpload = (req, res, next) => {
  uploadFormFile(req, res, (err) => {
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
