const applicantFormContentsSchema = {
  ApplicantFormContent: {
    type: 'object',
    properties: {
      id: { type: 'string', format: 'uuid', example: '6f6c4d1d-4b90-41b8-90c5-6d2336f3f2a1' },
      applicant_form_id: { type: 'string', format: 'uuid', nullable: true, example: '9b2e7c1a-3d4f-4e5a-8b6c-7d8e9f0a1b2c' },
      id_question: { type: 'string', format: 'uuid', nullable: true, example: '3a1b2c4d-5e6f-4a7b-8c9d-0e1f2a3b4c5d' },
      file_title_video: { type: 'string', nullable: true, example: 'Video Perkenalan' },
      file_type_video: { type: 'string', nullable: true, example: 'video' },
      file_name_video: { type: 'string', nullable: true, example: 'video-1758000000000-abc123.mp4' },
      nextcloud_path_video: { type: 'string', nullable: true, example: '/HRMS/ApplicantContents/video-1758000000000-abc123.mp4' },
      file_link_video: { type: 'string', nullable: true, example: 'https://cloud.inlinegroupdc.com/s/AbCdEfGhIjKlMnO' },
      file_title_audio: { type: 'string', nullable: true, example: 'Rekaman Suara' },
      file_type_audio: { type: 'string', nullable: true, example: 'audio' },
      file_name_audio: { type: 'string', nullable: true, example: 'audio-1758000000000-def456.mp3' },
      nextcloud_path_audio: { type: 'string', nullable: true, example: '/HRMS/ApplicantContents/audio-1758000000000-def456.mp3' },
      file_link_audio: { type: 'string', nullable: true, example: 'https://cloud.inlinegroupdc.com/s/PqRsTuVwXyZaBcD' },
      speech_text: { type: 'string', nullable: true, example: 'Perkenalkan, nama saya ...' },
      status_speech_text: { type: 'string', nullable: true, enum: ['Pending', 'Success', 'Failed'], description: 'Status proses speech to text file audio', example: 'Success' },
      message_speech_text: { type: 'string', nullable: true, description: 'Pesan/respon terakhir dari API speech to text (dipotong maksimal 2000 karakter)' },
      created_at: { type: 'string', format: 'date-time' },
      created_by: { type: 'string', nullable: true },
      updated_at: { type: 'string', format: 'date-time' },
      updated_by: { type: 'string', nullable: true },
      deleted_at: { type: 'string', format: 'date-time', nullable: true },
      deleted_by: { type: 'string', nullable: true },
      is_delete: { type: 'boolean', example: false }
    }
  },
  ApplicantFormContentInput: {
    type: 'object',
    description: 'Semua field opsional, termasuk file video dan audio',
    properties: {
      applicant_form_id: { type: 'string', format: 'uuid', nullable: true, description: 'ID applicant form (applicant_forms.id), opsional. Otomatis terisi saat file_link_video dipakai di applicant form', example: '9b2e7c1a-3d4f-4e5a-8b6c-7d8e9f0a1b2c' },
      id_question: { type: 'string', format: 'uuid', nullable: true, description: 'ID master question (db_hrm_master_questions.id), opsional', example: '3a1b2c4d-5e6f-4a7b-8c9d-0e1f2a3b4c5d' },
      file_title_video: { type: 'string', example: 'Video Perkenalan' },
      file_type_video: { type: 'string', example: 'video' },
      file_video: { type: 'string', format: 'binary', description: 'File video (mp4/webm/mov/avi/mkv/mpeg), opsional' },
      file_title_audio: { type: 'string', example: 'Rekaman Suara' },
      file_type_audio: { type: 'string', example: 'audio' },
      file_audio: { type: 'string', format: 'binary', description: 'File audio (mp3/wav/webm/ogg/aac/m4a), opsional' },
      speech_text: { type: 'string', nullable: true, description: 'Teks hasil speech to text, opsional', example: 'Perkenalkan, nama saya ...' }
    }
  },
  ApplicantFormContentSpeechTextInput: {
    type: 'object',
    required: ['file_link_audio'],
    properties: {
      file_link_audio: { type: 'string', example: 'https://cloud.motorsights.com/s/AmjNdn8gmC7t96t' },
      speech_text: { type: 'string', nullable: true, example: 'Perkenalkan, nama saya ...' },
      status_speech_text: { type: 'string', nullable: true, enum: ['Pending', 'Success', 'Failed'], example: 'Success' },
      message_speech_text: { type: 'string', nullable: true, example: 'Transcribe berhasil' }
    }
  },
  ApplicantFormContentSpeechTextResult: {
    type: 'object',
    properties: {
      id: { type: 'string', format: 'uuid', example: '6f6c4d1d-4b90-41b8-90c5-6d2336f3f2a1' },
      applicant_form_id: { type: 'string', format: 'uuid', nullable: true, example: '9b2e7c1a-3d4f-4e5a-8b6c-7d8e9f0a1b2c' },
      file_link_audio: { type: 'string', example: 'https://cloud.motorsights.com/s/AmjNdn8gmC7t96t' },
      speech_text: { type: 'string', nullable: true, example: 'Perkenalkan, nama saya ...' },
      status_speech_text: { type: 'string', nullable: true, example: 'Success' },
      message_speech_text: { type: 'string', nullable: true, example: 'Transcribe berhasil' }
    }
  },
  ApplicantFormContentResult: {
    type: 'object',
    description: 'Response ringkas setelah create/update content',
    properties: {
      applicant_form_id: { type: 'string', format: 'uuid', nullable: true, example: '9b2e7c1a-3d4f-4e5a-8b6c-7d8e9f0a1b2c' },
      id_question: { type: 'string', format: 'uuid', nullable: true, example: '3a1b2c4d-5e6f-4a7b-8c9d-0e1f2a3b4c5d' },
      file_title_video: { type: 'string', nullable: true, example: 'Video Perkenalan' },
      file_type_video: { type: 'string', nullable: true, example: 'video' },
      file_video: { type: 'string', nullable: true, example: 'https://cloud.inlinegroupdc.com/s/AbCdEfGhIjKlMnO' },
      file_title_audio: { type: 'string', nullable: true, example: 'Rekaman Suara' },
      file_type_audio: { type: 'string', nullable: true, example: 'audio' },
      file_audio: { type: 'string', nullable: true, example: 'https://cloud.inlinegroupdc.com/s/PqRsTuVwXyZaBcD' },
      speech_text: { type: 'string', nullable: true, example: 'Perkenalkan, nama saya ...' }
    }
  }
}

module.exports = applicantFormContentsSchema
