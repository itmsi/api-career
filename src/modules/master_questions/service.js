const repository = require('./repository')

/**
 * Service Layer - Business Logic
 *
 * Layer ini menangani business logic master questions.
 */

const getMasterQuestions = async (params) => {
  return await repository.findAll(params)
}

const getMasterQuestionById = async (id) => {
  const data = await repository.findById(id)

  if (!data) {
    throw { message: 'Data master question tidak ditemukan', statusCode: 404 }
  }

  return data
}

module.exports = {
  getMasterQuestions,
  getMasterQuestionById
}
