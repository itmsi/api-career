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
        "id di path dicek ke applicant_form_invitations.id dulu; kalau tidak ketemu, fallback dicek ke applicant_form_invitations.applicant_form_id. Kalau undangan ditemukan dan applicant_form_id-nya sudah terisi, data applicant_forms yang ada di-update. Kalau applicant_form_id masih kosong (form belum pernah diisi), sebuah applicant_forms baru dibuat lalu undangan tsb ditandai completed dengan applicant_form_id yang baru. full_name/email/no_mobile yang dikirim juga dipakai untuk update applicant_form_invitations.full_name/email/no_mobile (kolom ini NOT NULL, jadi hanya field yang diisi yang di-sync).",
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
