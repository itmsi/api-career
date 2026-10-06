/**
 * Swagger Schema Definitions for Master Questions Module
 */

const masterQuestionSchemas = {
  MasterQuestion: {
    type: 'object',
    properties: {
      id: {
        type: 'string',
        format: 'uuid',
        description: 'Unique identifier',
        example: '123e4567-e89b-12d3-a456-426614174000'
      },
      question_id: { type: 'string', nullable: true, example: 'Q001' },
      question_en: { type: 'string', example: 'Tell us about yourself' },
      question_cn: { type: 'string', nullable: true, example: '请介绍一下你自己' },
      focus_assessment: { type: 'string', nullable: true, example: 'Communication' },
      created_at: { type: 'string', format: 'date-time', example: '2026-10-06T00:00:00.000Z' },
      created_by: { type: 'string', nullable: true },
      updated_at: { type: 'string', format: 'date-time', example: '2026-10-06T00:00:00.000Z' },
      updated_by: { type: 'string', nullable: true },
      deleted_at: { type: 'string', format: 'date-time', nullable: true },
      deleted_by: { type: 'string', nullable: true }
    }
  }
}

module.exports = masterQuestionSchemas
