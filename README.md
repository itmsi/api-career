# API Career

REST API untuk sistem Career (recruitment/applicant management), dibangun di atas Express.js boilerplate yang sudah dilengkapi dengan berbagai fitur esensial untuk pengembangan aplikasi production-ready.

Aplikasi ini berjalan secara default di **port `9585`** (lihat variabel `APP_PORT` pada file `.env`).

## Fitur Utama

- **Applicant Forms Module**: Module untuk formulir data pelamar kerja (data pribadi, pendidikan, pengalaman kerja, referensi, dll) dengan CRUD, pagination, soft delete, validation
- **Example Module Template**: Module contoh lengkap dengan CRUD, pagination, soft delete, validation
- **Database**: PostgreSQL dengan Knex.js untuk query builder, migration, dan seeding
- **Authentication Ready**: JWT middleware dan utilities (tinggal implement)
- **File Upload**: Integrasi dengan AWS S3 dan MinIO untuk object storage
- **Email Service**: Template email dengan Nodemailer
- **Message Queue**: RabbitMQ untuk async task processing
- **API Documentation**: Swagger/OpenAPI 3.0 dengan contoh lengkap
- **Security**: Rate limiting, CORS, input validation, XSS protection
- **Monitoring**: Prometheus metrics dan comprehensive logging
- **Internationalization**: Multi-language support dengan i18n
- **Docker Support**: Docker & Docker Compose untuk development dan production
- **CI/CD**: Jenkins & Bitbucket Pipelines configuration

## Prerequisites

Sebelum memulai, pastikan Anda sudah menginstall:

- **Node.js** (v14 atau lebih baru)
- **PostgreSQL** (v12 atau lebih baru)
- **Redis** (opsional, untuk session storage)
- **Docker & Docker Compose** (opsional, untuk containerization)

## Installation

### 1. Clone Repository

```bash
git clone https://github.com/your-username/api-career.git
cd api-career
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Setup

Copy file environment example dan sesuaikan konfigurasi:

```bash
cp environment.example .env
```

Edit file `.env` dan sesuaikan dengan konfigurasi Anda:

```env
# Application
APP_NAME=API Career
NODE_ENV=development
APP_PORT=9585
APP_BASE_URL=http://localhost:9585

# Database
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=yourpassword
DB_NAME=db_career

# JWT
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=24h

# AWS S3 (optional)
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_REGION=
AWS_BUCKET=

# MinIO (optional)
MINIO_ENDPOINT=
MINIO_PORT=
MINIO_ACCESS_KEY=
MINIO_SECRET_KEY=
MINIO_BUCKET=

# Email
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USER=
MAIL_PASSWORD=
MAIL_FROM=

# RabbitMQ (optional)
RABBITMQ_URL=amqp://localhost:5672

# Swagger
SWAGGER_ENABLED=true
```

### 4. Database Setup

Jalankan migration untuk membuat struktur database:

```bash
npm run migrate
```

Jalankan seeder untuk data awal (opsional):

```bash
npm run seed
```

### 5. Start Development Server

```bash
npm run dev
```

Server akan berjalan di `http://localhost:9585`

Akses dokumentasi API di `http://localhost:9585/documentation`

## Struktur Proyek

```
├── src/
│   ├── app.js                  # Express app configuration
│   ├── server.js              # Server entry point
│   ├── config/                # Konfigurasi aplikasi
│   │   ├── database.js        # Database configuration
│   │   ├── aws.js            # AWS S3 configuration
│   │   ├── minio.js          # MinIO configuration
│   │   ├── email.js          # Email configuration
│   │   ├── rabbitmq.js       # RabbitMQ configuration
│   │   └── prometheus.js     # Prometheus configuration
│   ├── modules/               # Business logic modules
│   │   ├── example/          # Example module (TEMPLATE)
│   │   │   ├── handler.js    # Controllers
│   │   │   ├── postgre_repository.js  # DB operations
│   │   │   ├── validation.js # Validation rules
│   │   │   ├── index.js      # Routes
│   │   │   └── README.md     # Documentation
│   │   └── helpers/          # Helper functions
│   ├── middlewares/           # Custom middlewares
│   │   ├── token.js          # JWT verification
│   │   ├── validation.js     # Input validation
│   │   ├── rate-limiter.js   # Rate limiting
│   │   ├── recaptcha.js      # reCAPTCHA verification
│   │   └── fileUpload.js     # File upload handling
│   ├── routes/               # API routes
│   │   ├── index.js          # Main routes
│   │   └── V1/               # API version 1
│   ├── repository/           # Database layer
│   │   └── postgres/         # PostgreSQL specific
│   │       ├── migrations/   # Database migrations
│   │       └── seeders/      # Database seeders
│   ├── utils/                # Utility functions
│   │   ├── response.js       # Standard API response
│   │   ├── logger.js         # Logging utility
│   │   ├── validation.js     # Validation helpers
│   │   ├── pagination.js     # Pagination helper
│   │   └── ...
│   ├── static/               # Swagger documentation
│   │   ├── index.js          # Swagger config
│   │   ├── path/             # API path definitions
│   │   └── schema/           # Schema definitions
│   ├── templates/            # Email templates
│   ├── views/                # View templates
│   ├── listeners/            # RabbitMQ message listeners
│   ├── scripts/              # Background scripts
│   └── debug/                # Debug utilities
├── docker/                   # Docker configurations
├── public/                   # Static files
├── logs/                     # Application logs
├── uploads/                  # Uploaded files
├── test/                     # Test files
├── scripts/                  # Utility scripts
├── docs/                     # Additional documentation
├── .env                      # Environment variables (create from .env.example)
├── package.json              # Dependencies
├── QUICKSTART.md             # Quick start guide
├── CONTRIBUTING.md           # Contribution guidelines
└── README.md                # This file
```

## Cara Membuat Module Baru

> **\* Tip:** Gunakan module `example` sebagai template! Copy dan customize sesuai kebutuhan.

### Cara Cepat (Recommended)

```bash
# Copy module example sebagai template
cp -r src/modules/example src/modules/products

# Edit files di src/modules/products:
# - Ganti "example" dengan "product"
# - Ganti "examples" dengan "products"
# - Customize fields sesuai kebutuhan
```

### Cara Manual

### 1. Buat Folder Module

Buat folder baru di `src/modules/namaModule/`

### 2. Buat File-file Module

Struktur minimal sebuah module:

```
src/modules/namaModule/
├── index.js              # Export semua handler
├── handler.js            # Request handlers
├── validation.js         # Input validation rules
└── postgre_repository.js # Database operations
```

#### Contoh `handler.js`:

```javascript
const repository = require("./postgre_repository");
const { baseResponse, errorResponse } = require("../../utils/response");

const getAll = async (req, res) => {
  try {
    const data = await repository.findAll();
    return baseResponse(res, { data });
  } catch (error) {
    return errorResponse(res, error);
  }
};

const getById = async (req, res) => {
  try {
    const { id } = req.params;
    const data = await repository.findById(id);

    if (!data) {
      return errorResponse(res, { message: "Data not found" }, 404);
    }

    return baseResponse(res, { data });
  } catch (error) {
    return errorResponse(res, error);
  }
};

const create = async (req, res) => {
  try {
    const data = await repository.create(req.body);
    return baseResponse(res, { data }, 201);
  } catch (error) {
    return errorResponse(res, error);
  }
};

const update = async (req, res) => {
  try {
    const { id } = req.params;
    const data = await repository.update(id, req.body);
    return baseResponse(res, { data });
  } catch (error) {
    return errorResponse(res, error);
  }
};

const remove = async (req, res) => {
  try {
    const { id } = req.params;
    await repository.remove(id);
    return baseResponse(res, { message: "Data deleted successfully" });
  } catch (error) {
    return errorResponse(res, error);
  }
};

module.exports = {
  getAll,
  getById,
  create,
  update,
  remove,
};
```

#### Contoh `postgre_repository.js`:

```javascript
const db = require("../../config/database");

const TABLE_NAME = "your_table_name";

const findAll = async () => {
  return await db(TABLE_NAME)
    .select("*")
    .where({ deleted_at: null })
    .orderBy("created_at", "desc");
};

const findById = async (id) => {
  return await db(TABLE_NAME).where({ id, deleted_at: null }).first();
};

const create = async (data) => {
  const [result] = await db(TABLE_NAME)
    .insert({
      ...data,
      created_at: db.fn.now(),
      updated_at: db.fn.now(),
    })
    .returning("*");
  return result;
};

const update = async (id, data) => {
  const [result] = await db(TABLE_NAME)
    .where({ id })
    .update({
      ...data,
      updated_at: db.fn.now(),
    })
    .returning("*");
  return result;
};

const remove = async (id) => {
  // Soft delete
  return await db(TABLE_NAME).where({ id }).update({
    deleted_at: db.fn.now(),
  });
};

module.exports = {
  findAll,
  findById,
  create,
  update,
  remove,
};
```

#### Contoh `validation.js`:

```javascript
const { body, param, query } = require("express-validator");

const createValidation = [
  body("name")
    .notEmpty()
    .withMessage("Name is required")
    .isLength({ min: 3 })
    .withMessage("Name must be at least 3 characters"),
  body("email")
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Email must be valid"),
];

const updateValidation = [
  param("id")
    .notEmpty()
    .withMessage("ID is required")
    .isUUID()
    .withMessage("ID must be valid UUID"),
  body("name")
    .optional()
    .isLength({ min: 3 })
    .withMessage("Name must be at least 3 characters"),
];

module.exports = {
  createValidation,
  updateValidation,
};
```

#### Contoh `index.js`:

```javascript
const express = require("express");
const router = express.Router();
const handler = require("./handler");
const { createValidation, updateValidation } = require("./validation");
const { verifyToken } = require("../../middlewares");
const { handleValidationErrors } = require("../../middlewares/validation");

router.get("/", verifyToken, handler.getAll);
router.get("/:id", verifyToken, handler.getById);
router.post(
  "/",
  verifyToken,
  createValidation,
  handleValidationErrors,
  handler.create,
);
router.put(
  "/:id",
  verifyToken,
  updateValidation,
  handleValidationErrors,
  handler.update,
);
router.delete("/:id", verifyToken, handler.remove);

module.exports = router;
```

### 3. Daftarkan Route

Edit file `src/routes/V1/index.js`:

```javascript
const yourModule = require("../../modules/yourModule");

// ... existing code ...

routing.use(`${API_TAG}/your-endpoint`, yourModule);
```

### 4. Buat Migration

Buat file migration untuk table:

```bash
npm run migrate:make create_your_table
```

Edit file migration di `src/repository/postgres/migrations/`:

```javascript
exports.up = function (knex) {
  return knex.schema.createTable("your_table_name", (table) => {
    table.uuid("id").primary().defaultTo(knex.raw("uuid_generate_v4()"));
    table.string("name").notNullable();
    table.string("email").unique();
    table.text("description");
    table.timestamp("created_at").defaultTo(knex.fn.now());
    table.timestamp("updated_at").defaultTo(knex.fn.now());
    table.timestamp("deleted_at").nullable();
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable("your_table_name");
};
```

Jalankan migration:

```bash
npm run migrate
```

## Applicant Forms API Endpoints

Module `applicant_forms` menyediakan endpoint untuk mengelola formulir data pelamar kerja (data pribadi, pendidikan, pengalaman kerja, referensi, dll):

### Get All Applicant Forms

```bash
GET /api/applicant-forms?page=1&limit=10
```

### Get Applicant Form by ID

```bash
GET /api/applicant-forms/:id
```

### Create Applicant Form

```bash
POST /api/applicant-forms
Content-Type: application/json

{
  "full_name": "John Doe",
  "email": "john.doe@example.com",
  "position_applied_for": "Software Engineer",
  "driver_license": [{"name": "SIM A"}, {"name": "SIM B"}],
  "educational_background": [
    {
      "type_of_school": "university",
      "name_of_school": "Universitas Jenderal Achmad Yani",
      "location": "Yogyakarta",
      "graduate": "sarjana S1",
      "major": "Teknik Komputer",
      "graduation_year": "2019"
    }
  ]
}
```

### Update Applicant Form

```bash
PUT /api/applicant-forms/:id
Content-Type: application/json

{
  "full_name": "Updated Name"
}
```

### Delete Applicant Form (Soft Delete)

```bash
DELETE /api/applicant-forms/:id
```

### Restore Applicant Form

```bash
POST /api/applicant-forms/:id/restore
```

## Example API Endpoints

Boilerplate ini sudah include module `example` sebagai template dengan endpoints berikut:

### Get All Examples

```bash
GET /api/examples?page=1&limit=10
```

### Get Example by ID

```bash
GET /api/examples/:id
```

### Create Example

```bash
POST /api/examples
Content-Type: application/json

{
  "name": "Example Name",
  "description": "Description",
  "status": "active"
}
```

### Update Example

```bash
PUT /api/examples/:id
Content-Type: application/json

{
  "name": "Updated Name"
}
```

### Delete Example

```bash
DELETE /api/examples/:id
```

### Restore Example

```bash
POST /api/examples/:id/restore
```

> **\* Full API Documentation:** `http://localhost:9585/documentation`

## Authentication (Ready to Implement)

Boilerplate sudah include JWT middleware. Untuk menggunakannya:

### 1. Uncomment di route:

```javascript
const { verifyToken } = require("../../middlewares");

router.get("/", verifyToken, handler.getAll);
```

### 2. Tambahkan header Authorization:

```bash
Authorization: Bearer your-jwt-token
```

> **\* Tip:** Lihat `src/middlewares/token.js` untuk JWT verification logic

## API Documentation

Dokumentasi API tersedia via Swagger UI. Akses di:

```
http://localhost:9585/documentation
```

Untuk menambahkan dokumentasi API Anda, edit file:

- `src/static/path/yourModule.js` - untuk endpoint paths
- `src/static/schema/yourModule.js` - untuk schema definitions

## Docker

### Development

```bash
docker-compose -f docker-compose.dev.yml up
```

### Production

```bash
docker-compose -f docker-compose.server.yml up -d
```

## Monitoring

### Prometheus Metrics

Metrics tersedia di endpoint:

```
http://localhost:9585/metrics
```

### Logs

Log tersimpan di folder `logs/`:

- `logs/application/` - Application logs
- `logs/listener/` - RabbitMQ listener logs

## Testing

```bash
npm test
```

## Available Scripts

- `npm start` - Jalankan server production
- `npm run dev` - Jalankan server development dengan nodemon
- `npm run migrate` - Jalankan database migrations
- `npm run migrate:rollback` - Rollback migration terakhir
- `npm run migrate:make <name>` - Buat file migration baru
- `npm run seed` - Jalankan database seeders
- `npm run seed:make <name>` - Buat file seeder baru
- `npm run consumer` - Jalankan RabbitMQ consumer
- `npm test` - Jalankan tests

## Dependencies

### Core

- **express** - Web framework
- **pg** - PostgreSQL client
- **knex** - SQL query builder
- **jsonwebtoken** - JWT implementation
- **bcrypt** - Password hashing

### Utilities

- **joi** - Schema validation
- **express-validator** - Request validation
- **morgan** - HTTP request logger
- **winston** - Logging library
- **moment** - Date manipulation
- **uuid** - UUID generator

### File Upload

- **multer** - Multipart/form-data handling
- **aws-sdk** - AWS S3 client
- **minio** - MinIO client
- **sharp** - Image processing

### Others

- **swagger-ui-express** - API documentation
- **prom-client** - Prometheus metrics
- **amqplib** - RabbitMQ client
- **nodemailer** - Email sending
- **i18n** - Internationalization
- **compression** - Response compression
- **xss-clean** - XSS protection
- **express-rate-limit** - Rate limiting

## Contributing

Contributions are welcome! Silakan buat pull request atau issue untuk saran dan perbaikan.

## License

MIT License - lihat file [LICENSE](LICENSE) untuk detail.

---

Made with for the developer community
