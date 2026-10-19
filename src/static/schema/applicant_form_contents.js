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
      step: { type: 'string', nullable: true, description: 'Step dari master question (diisi otomatis saat applicant form dibuat/diupdate)', example: '1' },
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
      message_speech_text: { type: 'string', nullable: true, example: 'Transcribe berhasil' },
      updated_at: { type: 'string', format: 'date-time', example: '2026-10-16T07:30:00.000Z' }
    }
  },
  ApplicantFormContentAudio: {
    type: 'object',
    description: 'Data audio & hasil speech to text dari sebuah content',
    properties: {
      id: { type: 'string', format: 'uuid', example: 'dd096cc0-4365-431a-aeee-dd625df52535' },
      applicant_form_id: { type: 'string', format: 'uuid', nullable: true, example: 'e0c7ae63-61ed-461d-bebc-c22982749a6f' },
      id_question: { type: 'string', format: 'uuid', nullable: true, example: '2aa0963e-b2d2-44f7-adc8-87ec0a6255d2' },
      file_title_audio: { type: 'string', nullable: true, example: 'Rekaman Suara' },
      file_type_audio: { type: 'string', nullable: true, example: 'audio' },
      file_name_audio: { type: 'string', nullable: true, example: 'audio-1792135447655-8b037d01-9c98-4458-8a7e-933a54e84d0f.webm' },
      nextcloud_path_audio: { type: 'string', nullable: true, example: '/HRMS/applicantForms/dev2@mail.com_devdua/applicant_form_contents/audio-1792135447655-8b037d01-9c98-4458-8a7e-933a54e84d0f.webm' },
      file_link_audio: { type: 'string', nullable: true, example: 'https://cloud.motorsights.com/s/4M6jZtj3FgWH38D' },
      speech_text: { type: 'string', nullable: true, example: 'Halo, perkenalkan nama saya ...' },
      status_speech_text: { type: 'string', nullable: true, enum: ['Pending', 'Success', 'Failed'], example: 'Success' },
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
