const { body, param } = require("express-validator");

const MAX_TITLE = 255;
const MAX_TYPE = 100;
const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const optionalTextField = (field, max) =>
  body(field)
    .optional({ nullable: true })
    .isString()
    .withMessage(`${field} harus berupa teks`)
    .trim()
    .isLength({ max })
    .withMessage(`${field} maksimal ${max} karakter`);

// id_question dikirim lewat multipart, jadi string kosong / 'null' dianggap null
const questionIdValidation = body("id_question")
  .optional({ nullable: true })
  .custom((value) => {
    if (typeof value !== "string")
      throw new Error("id_question harus berupa UUID");
    const trimmed = value.trim();
    if (["", "null", "nan"].includes(trimmed)) return true;
    if (!UUID_REGEX.test(trimmed))
      throw new Error("Format id_question tidak valid");
    return true;
  });

const contentFieldsValidation = [
  questionIdValidation,
  optionalTextField("file_title_video", MAX_TITLE),
  optionalTextField("file_type_video", MAX_TYPE),
  optionalTextField("file_title_audio", MAX_TITLE),
  optionalTextField("file_type_audio", MAX_TYPE),
];

const createValidation = [...contentFieldsValidation];

const updateValidation = [
  param("id")
    .notEmpty()
    .withMessage("ID wajib diisi")
    .isUUID()
    .withMessage("Format ID tidak valid"),
  ...contentFieldsValidation,
];

const getByIdValidation = [
  param("id")
    .notEmpty()
    .withMessage("ID wajib diisi")
    .isUUID()
    .withMessage("Format ID tidak valid"),
];

const getListValidation = [
  body("page")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Page harus berupa angka positif"),
  body("limit")
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage("Limit harus antara 1-100"),
  body("search").optional().isString().withMessage("Search harus berupa teks"),
  body("sort_by")
    .optional()
    .isIn(["created_at"])
    .withMessage("sort_by tidak valid"),
  body("sort_order")
    .optional()
    .isIn(["asc", "desc"])
    .withMessage("sort_order harus asc atau desc"),
];

module.exports = {
  createValidation,
  updateValidation,
  getByIdValidation,
  getListValidation,
};
