const path = require('path')
const { v4: uuidv4 } = require('uuid')
const repository = require('./repository')
const {
  uploadFile,
  deleteFile: deleteNextcloudFile,
  generateShareLink,
  NEXTCLOUD_UPLOAD_DIR
} = require('../../utils/nextcloud')

const FILE_DIR = `${NEXTCLOUD_UPLOAD_DIR}/ApplicantContents`

// Satu record berisi dua slot file: video dan audio
const MEDIA_KINDS = ['video', 'audio']

const getRequesterId = (user) => {
  if (!user) return null
  return user.employee_id || user.user_id || user.users_id || user.sub || null
}

const normalizeOptionalString = (value) => {
  if (value === undefined || value === null) return null
  if (typeof value !== 'string') return value
  const trimmed = value.trim()
  if (trimmed === '' || trimmed === 'null' || trimmed === 'nan') return null
  return trimmed
}

const buildFileName = (kind, originalName) => {
  const extension = path.extname(originalName || '') || ''
  return `${kind}-${Date.now()}-${uuidv4()}${extension}`
}

const uploadContentFile = async (kind, file) => {
  const fileName = buildFileName(kind, file.originalname)
  const nextcloudPath = await uploadFile(FILE_DIR, fileName, file.buffer)
  const fileLink = await generateShareLink(nextcloudPath)
  return { fileName, nextcloudPath, fileLink }
}

const getUploadedFile = (files, kind) => files?.[`file_${kind}`]?.[0] || null

const buildResult = (data) => ({
  file_title_video: data.file_title_video,
  file_type_video: data.file_type_video,
  file_video: data.file_link_video,
  file_title_audio: data.file_title_audio,
  file_type_audio: data.file_type_audio,
  file_audio: data.file_link_audio
})

const getContents = async (params) => {
  return await repository.findAll(params)
}

const getContentById = async (id) => {
  const data = await repository.findById(id)
  if (!data) {
    throw { message: 'Data content tidak ditemukan', statusCode: 404 }
  }
  return data
}

const createContent = async (payload, files, user) => {
  const authorId = getRequesterId(user)
  const data = {}

  for (const kind of MEDIA_KINDS) {
    data[`file_title_${kind}`] = normalizeOptionalString(payload[`file_title_${kind}`])
    data[`file_type_${kind}`] = normalizeOptionalString(payload[`file_type_${kind}`])

    const file = getUploadedFile(files, kind)
    if (file) {
      const { fileName, nextcloudPath, fileLink } = await uploadContentFile(kind, file)
      data[`file_name_${kind}`] = fileName
      data[`nextcloud_path_${kind}`] = nextcloudPath
      data[`file_link_${kind}`] = fileLink
    }
  }

  await repository.create({
    ...data,
    created_by: authorId,
    updated_by: authorId
  })

  return buildResult(data)
}

const updateContent = async (id, payload, files, user) => {
  const existing = await repository.findById(id)
  if (!existing) {
    throw { message: 'Data content tidak ditemukan', statusCode: 404 }
  }

  const authorId = getRequesterId(user)
  const data = { ...existing }
  const oldNextcloudPaths = []

  for (const kind of MEDIA_KINDS) {
    if (payload[`file_title_${kind}`] !== undefined) {
      data[`file_title_${kind}`] = normalizeOptionalString(payload[`file_title_${kind}`])
    }
    if (payload[`file_type_${kind}`] !== undefined) {
      data[`file_type_${kind}`] = normalizeOptionalString(payload[`file_type_${kind}`])
    }

    const file = getUploadedFile(files, kind)
    if (file) {
      const { fileName, nextcloudPath, fileLink } = await uploadContentFile(kind, file)
      oldNextcloudPaths.push(existing[`nextcloud_path_${kind}`])
      data[`file_name_${kind}`] = fileName
      data[`nextcloud_path_${kind}`] = nextcloudPath
      data[`file_link_${kind}`] = fileLink
    }
  }

  await repository.update(id, {
    ...data,
    updated_by: authorId
  })

  // Hapus file lama di Nextcloud setelah record berhasil diupdate
  // supaya tidak menumpuk file yatim
  for (const oldPath of oldNextcloudPaths) {
    await deleteNextcloudFile(oldPath)
  }

  return buildResult(data)
}

const deleteContent = async (id, user) => {
  const existing = await repository.findById(id)
  if (!existing) {
    throw { message: 'Data content tidak ditemukan', statusCode: 404 }
  }

  const authorId = getRequesterId(user)
  await repository.remove(id, authorId)

  for (const kind of MEDIA_KINDS) {
    await deleteNextcloudFile(existing[`nextcloud_path_${kind}`])
  }

  return null
}

module.exports = {
  getContents,
  getContentById,
  createContent,
  updateContent,
  deleteContent
}
