const path = require('path')
const { v4: uuidv4 } = require('uuid')
const repository = require('./repository')
const {
  uploadFile,
  deleteFile,
  generateShareLink,
  NEXTCLOUD_UPLOAD_DIR
} = require('../../utils/nextcloud')

const SIGNATURE_DIR = `${NEXTCLOUD_UPLOAD_DIR}/Signature`

const getRequesterId = (user) => {
  if (!user) return null
  return user.employee_id || user.user_id || user.users_id || user.sub || null
}

const buildFileName = (originalName) => {
  const extension = path.extname(originalName || '') || ''
  return `signature-${Date.now()}-${uuidv4()}${extension}`
}

const uploadSignatureFile = async (file) => {
  const fileName = buildFileName(file.originalname)
  const nextcloudPath = await uploadFile(SIGNATURE_DIR, fileName, file.buffer)
  const signatureLink = await generateShareLink(nextcloudPath)
  return { fileName, nextcloudPath, signatureLink }
}

const getSignatures = async (params) => {
  return await repository.findAll(params)
}

const getSignatureById = async (id) => {
  const data = await repository.findById(id)
  if (!data) {
    throw { message: 'Data signature tidak ditemukan', statusCode: 404 }
  }
  return data
}

const createSignature = async (payload, file, user) => {
  if (!file) {
    throw { message: 'File signature wajib diupload', statusCode: 400 }
  }

  const authorId = getRequesterId(user)
  const { fileName, nextcloudPath, signatureLink } = await uploadSignatureFile(file)

  await repository.create({
    file_name: fileName,
    nextcloud_path: nextcloudPath,
    signature_link: signatureLink,
    signature_date: payload.signature_date,
    created_by: authorId,
    updated_by: authorId
  })

  return {
    signature_link: signatureLink,
    signature_date: payload.signature_date
  }
}

const updateSignature = async (id, payload, file, user) => {
  const existing = await repository.findById(id)
  if (!existing) {
    throw { message: 'Data signature tidak ditemukan', statusCode: 404 }
  }

  const authorId = getRequesterId(user)
  let fileName = existing.file_name
  let nextcloudPath = existing.nextcloud_path
  let signatureLink = existing.signature_link

  if (file) {
    const uploaded = await uploadSignatureFile(file)
    fileName = uploaded.fileName
    nextcloudPath = uploaded.nextcloudPath
    signatureLink = uploaded.signatureLink

    // Hapus file lama di Nextcloud supaya tidak menumpuk file yatim
    await deleteFile(existing.nextcloud_path)
  }

  const signatureDate = payload.signature_date !== undefined ? payload.signature_date : existing.signature_date

  await repository.update(id, {
    file_name: fileName,
    nextcloud_path: nextcloudPath,
    signature_link: signatureLink,
    signature_date: signatureDate,
    updated_by: authorId
  })

  return {
    signature_link: signatureLink,
    signature_date: signatureDate
  }
}

const deleteSignature = async (id, user) => {
  const existing = await repository.findById(id)
  if (!existing) {
    throw { message: 'Data signature tidak ditemukan', statusCode: 404 }
  }

  const authorId = getRequesterId(user)
  await repository.remove(id, authorId)
  await deleteFile(existing.nextcloud_path)

  return null
}

module.exports = {
  getSignatures,
  getSignatureById,
  createSignature,
  updateSignature,
  deleteSignature
}
