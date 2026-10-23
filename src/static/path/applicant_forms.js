/**
 * Swagger API Path Definitions for Applicant Forms Module
 */

const applicantFormsPaths = {
  "/applicant-forms/get": {
    post: {
      tags: ["Applicant Forms"],
      summary: "Get applicant forms list",
      description:
        "Retrieve applicant forms with pagination, search, and sorting. Query di-join dari applicant_form_invitations (LEFT JOIN applicant_forms via applicant_form_id, LEFT JOIN gate_sso_employees via applicant_form_invitations.created_by = employee_id), sehingga undangan yang belum diisi applicant form-nya tetap muncul.",
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                page: { type: "integer", example: 1 },
                limit: { type: "integer", example: 10 },
                search: { type: "string", example: "" },
                sort_by: { type: "string", example: "created_at" },
                sort_order: { type: "string", example: "desc" },
                position_applied_for: {
                  type: "string",
                  nullable: true,
                  example: "",
                },
                city: { type: "string", nullable: true, example: "" },
                marital_status: { type: "string", nullable: true, example: "" },
                is_completed: {
                  type: "boolean",
                  nullable: true,
                  example: "",
                  description:
                    "Filter berdasarkan status pengisian applicant form (undangan)",
                },
              },
            },
          },
        },
      },
      responses: {
        200: {
          description: "Success",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: true },
                  data: {
                    type: "object",
                    properties: {
                      data: {
                        type: "array",
                        items: {
                          $ref: "#/components/schemas/ApplicantFormListItem",
                        },
                      },
                      pagination: {
                        type: "object",
                        properties: {
                          page: { type: "integer" },
                          limit: { type: "integer" },
                          total: { type: "integer" },
                          totalPages: { type: "integer" },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  },
  "/applicant-forms/create": {
    post: {
      tags: ["Applicant Forms"],
      summary: "Create applicant form (public, pakai token undangan)",
      description:
        "Endpoint publik yang diakses pelamar dari halaman applicant-form. Bukan pakai token admin/HR, melainkan token undangan (JWT) dari url applicant-form, dikirim via header Authorization: Bearer <token>. Token divalidasi sama seperti GET /applicant-invitations/verify/{token} (signature, expired, is_completed). Setelah berhasil, undangan otomatis ditandai completed sehingga token/url tidak bisa dipakai ulang.",
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/ApplicantFormInput" },
          },
        },
      },
      responses: {
        201: {
          description: "Created successfully",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: true },
                  data: { $ref: "#/components/schemas/ApplicantForm" },
                  message: {
                    type: "string",
                    example: "Data applicant form berhasil dibuat",
                  },
                },
              },
            },
          },
        },
        401: {
          description: "Token tidak valid / tidak disertakan",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ErrorResponse" },
            },
          },
        },
        410: {
          description:
            "Token sudah expired atau form sudah pernah diisi (completed)",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ErrorResponse" },
            },
          },
        },
      },
    },
  },
  "/applicant-forms/summary-all": {
    post: {
      tags: ["Applicant Forms"],
      summary: "Update summary_all applicant form berdasarkan transcription_id",
      description:
        "Cari applicant_form_contents berdasarkan transcription_id, ambil applicant_form_id-nya, lalu update applicant_forms.summary_all (id = applicant_form_id) dengan summary yang dikirim. Kirim summary null untuk mengosongkan summary_all.",
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              required: ["transcription_id", "summary"],
              properties: {
                transcription_id: {
                  type: "string",
                  example: "72058640-5531-4c30-8213-faf94cc1f943",
                  description: "applicant_form_contents.transcription_id",
                },
                summary: {
                  type: "string",
                  nullable: true,
                  example: "Kandidat komunikatif dan berpengalaman ...",
                  description: "Disimpan ke applicant_forms.summary_all",
                },
              },
            },
          },
        },
      },
      responses: {
        200: {
          description: "Summary berhasil diupdate",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: true },
                  message: {
                    type: "string",
                    example: "Summary applicant form berhasil diupdate",
                  },
                  data: {
                    type: "object",
                    properties: {
                      id: {
                        type: "string",
                        format: "uuid",
                        example: "4509a494-0c6d-45ad-88fb-47f4eb7f0f70",
                        description: "applicant_forms.id",
                      },
                      transcription_id: {
                        type: "string",
                        example: "72058640-5531-4c30-8213-faf94cc1f943",
                      },
                      summary_all: {
                        type: "string",
                        nullable: true,
                        example: "Kandidat komunikatif dan berpengalaman ...",
                      },
                      updated_at: { type: "string", format: "date-time" },
                    },
                  },
                },
              },
            },
          },
        },
        400: {
          description: "Validation error",
          content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } },
        },
        401: {
          description: "Unauthorized",
          content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } },
        },
        404: {
          description: "Content dengan transcription_id tsb / applicant form tidak ditemukan",
          content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } },
        },
        422: {
          description: "Content belum terhubung ke applicant form (applicant_form_id kosong)",
          content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } },
        },
      },
    },
  },
  "/applicant-forms/create-summarize-all": {
    post: {
      tags: ["Applicant Forms"],
      summary: "Summarize all content applicant form",
      description:
        "Ambil applicant_form_contents (applicant_form_id = id) yang sudah punya transcription_id, ambil instruction dari db_hrm_master_questions.prompt_ai_summary (applicant_form_contents.id_question = db_hrm_master_questions.id); kalau kosong memakai instruction default \"Tuliskan kelebihan dan kekurangan kandidat dalam bentuk poin\". Lalu hit API summarize-all (POST {SUMMARIZE_ALL_URL}, default SUMMARIZE_URL + \"-all\") dengan payload [{ transcription_id, instruction }]. Request menunggu response API lalu mengembalikannya. Token API memakai SPEECH_TO_TEXT_TOKEN, atau Bearer token request kalau env tidak diisi.",
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              required: ["id"],
              properties: {
                id: {
                  type: "string",
                  format: "uuid",
                  example: "82957122-2eef-4461-b642-4de9e8d93876",
                  description: "applicant_forms.id",
                },
              },
            },
          },
        },
      },
      responses: {
        200: {
          description: "Summarize all berhasil",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: true },
                  message: { type: "string", example: "Summarize all berhasil" },
                  data: {
                    type: "object",
                    properties: {
                      id: {
                        type: "string",
                        format: "uuid",
                        example: "82957122-2eef-4461-b642-4de9e8d93876",
                        description: "applicant_forms.id",
                      },
                      items: {
                        type: "array",
                        description: "Data yang dikirim ke API summarize-all",
                        items: {
                          type: "object",
                          properties: {
                            content_id: { type: "string", format: "uuid" },
                            id_question: { type: "string", format: "uuid", nullable: true },
                            transcription_id: {
                              type: "string",
                              example: "72058640-5531-4c30-8213-faf94cc1f943",
                            },
                            instruction: {
                              type: "string",
                              example: "Tuliskan kelebihan dan kekurangan kandidat dalam bentuk poin",
                            },
                            instruction_source: {
                              type: "string",
                              enum: ["master_questions", "default"],
                              example: "master_questions",
                            },
                          },
                        },
                      },
                      summarize: {
                        nullable: true,
                        description: "Response mentah dari API summarize-all",
                      },
                    },
                  },
                },
              },
            },
          },
        },
        400: {
          description: "Validation error",
          content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } },
        },
        401: {
          description: "Unauthorized",
          content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } },
        },
        404: {
          description: "Tidak ada content dengan transcription_id untuk applicant form ini",
          content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } },
        },
        502: {
          description: "Gagal hit API summarize-all",
          content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } },
        },
      },
    },
  },
  "/applicant-forms/{id}": {
    get: {
      tags: ["Applicant Forms"],
      summary: "Get applicant form by ID",
      description:
        "Retrieve a single applicant form by ID. Query di-join dari applicant_form_invitations (LEFT JOIN applicant_forms via applicant_form_id, LEFT JOIN gate_sso_employees via applicant_form_invitations.created_by = employee_id). id bisa berupa applicant_form_id (form sudah diisi) atau id undangan (form belum diisi).",
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: "id",
          in: "path",
          required: true,
          description: "Applicant Form ID / Invitation ID",
          schema: { type: "string", format: "uuid" },
        },
      ],
      responses: {
        200: {
          description: "Success",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: true },
                  data: { $ref: "#/components/schemas/ApplicantFormDetail" },
                },
              },
            },
          },
        },
      },
    },
    put: {
      tags: ["Applicant Forms"],
      summary: "Update (atau create) applicant form dari undangan",
      description:
        "id di path dicek ke applicant_form_invitations.id dulu; kalau tidak ketemu, fallback dicek ke applicant_form_invitations.applicant_form_id. Kalau undangan ditemukan dan applicant_form_id-nya sudah terisi, data applicant_forms yang ada di-update secara partial: hanya field yang dikirim di payload yang diubah, field yang tidak dikirim tetap sesuai data di DB (kirim null kalau memang ingin mengosongkan field). Kalau applicant_form_id masih kosong (form belum pernah diisi), sebuah applicant_forms baru dibuat lalu undangan tsb ditandai completed dengan applicant_form_id yang baru. full_name/email/no_mobile yang dikirim juga dipakai untuk update applicant_form_invitations.full_name/email/no_mobile (kolom ini NOT NULL, jadi hanya field yang diisi yang di-sync).",
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: "id",
          in: "path",
          required: true,
          description: "Applicant Form Invitation ID atau Applicant Form ID",
          schema: { type: "string", format: "uuid" },
        },
      ],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/ApplicantFormInput" },
          },
        },
      },
      responses: {
        200: {
          description: "Updated (atau created) successfully",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: true },
                  data: { $ref: "#/components/schemas/ApplicantForm" },
                  message: {
                    type: "string",
                    example: "Data applicant form berhasil diupdate",
                  },
                },
              },
            },
          },
        },
      },
    },
    delete: {
      tags: ["Applicant Forms"],
      summary: "Delete applicant form (dan undangannya)",
      description:
        "id di path dicek ke applicant_form_invitations.id dulu, fallback ke applicant_form_invitations.applicant_form_id (lihat PUT /applicant-forms/{id}). Soft delete applicant_form_invitations selalu dilakukan; soft delete applicant_forms hanya dilakukan kalau form-nya sudah pernah diisi (applicant_form_id ada).",
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: "id",
          in: "path",
          required: true,
          description: "Applicant Form Invitation ID atau Applicant Form ID",
          schema: { type: "string", format: "uuid" },
        },
      ],
      responses: {
        200: {
          description: "Deleted successfully",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: true },
                  message: {
                    type: "string",
                    example: "Data applicant form berhasil dihapus",
                  },
                },
              },
            },
          },
        },
      },
    },
  },
};

module.exports = applicantFormsPaths;
