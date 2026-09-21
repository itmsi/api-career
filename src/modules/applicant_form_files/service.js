const path = require('path')
const { v4: uuidv4 } = require('uuid')
const repository = require('./repository')
const {
  uploadFile,
  deleteFile: deleteNextcloudFile,
  generateShareLink,
  NEXTCLOUD_UPLOAD_DIR
} = require('../../utils/nextcloud')

const FILE_DIR = `${NEXTCLOUD_UPLOAD_DIR}/ApplicantFiles`

const getRequesterId = (user) => {
  if (!user) return null
  return user.employee_id || user.user_id || user.users_id || user.sub || null
}

const buildFileName = (originalName) => {
  const extension = path.extname(originalName || '') || ''
  return `file-${Date.now()}-${uuidv4()}${extension}`
}

const uploadFormFile = async (file) => {
  const fileName = buildFileName(file.originalname)
  const nextcloudPath = await uploadFile(FILE_DIR, fileName, file.buffer)
  const fileLink = await generateShareLink(nextcloudPath)
  return { fileName, nextcloudPath, fileLink }
}

const getFiles = async (params) => {
  return await repository.findAll(params)
}

const getFileById = async (id) => {
  const data = await repository.findById(id)
  if (!data) {
    throw { message: 'Data file tidak ditemukan', statusCode: 404 }
  }
  return data
}

const createFile = async (payload, file, user) => {
  if (!file) {
    throw { message: 'File wajib diupload', statusCode: 400 }
  }

  const authorId = getRequesterId(user)
  const { fileName, nextcloudPath, fileLink } = await uploadFormFile(file)

  await repository.create({
    file_title: payload.file_title,
    file_type: payload.file_type,
    file_name: fileName,
    nextcloud_path: nextcloudPath,
    file_link: fileLink,
    created_by: authorId,
    updated_by: authorId
  })

  return {
    file_title: payload.file_title,
    file_type: payload.file_type,
    file: fileLink
  }
}

const updateFile = async (id, payload, file, user) => {
  const existing = await repository.findById(id)
  if (!existing) {
    throw { message: 'Data file tidak ditemukan', statusCode: 404 }
  }

  const authorId = getRequesterId(user)
  let fileName = existing.file_name
  let nextcloudPath = existing.nextcloud_path
  let fileLink = existing.file_link

  if (file) {
    const uploaded = await uploadFormFile(file)
    fileName = uploaded.fileName
    nextcloudPath = uploaded.nextcloudPath
    fileLink = uploaded.fileLink

    // Hapus file lama di Nextcloud supaya tidak menumpuk file yatim
    await deleteNextcloudFile(existing.nextcloud_path)
  }

  const fileTitle = payload.file_title !== undefined ? payload.file_title : existing.file_title
  const fileType = payload.file_type !== undefined ? payload.file_type : existing.file_type

  await repository.update(id, {
    file_title: fileTitle,
    file_type: fileType,
    file_name: fileName,
    nextcloud_path: nextcloudPath,
    file_link: fileLink,
    updated_by: authorId
  })

  return {
    file_title: fileTitle,
    file_type: fileType,
    file: fileLink
  }
}

const deleteFile = async (id, user) => {
  const existing = await repository.findById(id)
  if (!existing) {
    throw { message: 'Data file tidak ditemukan', statusCode: 404 }
  }

  const authorId = getRequesterId(user)
  await repository.remove(id, authorId)
  await deleteNextcloudFile(existing.nextcloud_path)

  return null
}

module.exports = {
  getFiles,
  getFileById,
  createFile,
  updateFile,
  deleteFile
}
