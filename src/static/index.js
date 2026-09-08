const info = {
  description:
    "Express.js API Boilerplate - Template untuk pengembangan REST API dengan fitur lengkap",
  version: "1.0.0",
  title: "Express.js API Boilerplate Documentation",
  contact: {
    email: "your-email@example.com",
  },
  license: {
    name: "MIT",
    url: "https://opensource.org/licenses/MIT",
  },
};

const servers = [
  {
    url: "/api/career/",
    description: "Development server",
  },
  {
    url: "https://gateway.motorsights.com/api/hrm",
    description: "Production server",
  },
  {
    url: "https://dev-gateway.motorsights.com/api/hrm",
    description: "Develop server",
  },
];

// Import schemas
// Tambahkan schema module Anda di sini
const exampleSchema = require("./schema/example");
const applicantFormsSchema = require("./schema/applicant_forms");
const applicantInvitationsSchema = require("./schema/applicant_invitations");

// Import paths
// Tambahkan path module Anda di sini
const examplePaths = require("./path/example");
const applicantFormsPaths = require("./path/applicant_forms");
const applicantInvitationsPaths = require("./path/applicant_invitations");

// Combine all schemas
const schemas = {
  ...exampleSchema,
  ...applicantFormsSchema,
  ...applicantInvitationsSchema,
};

// Combine all paths
const paths = {
  ...examplePaths,
  ...applicantFormsPaths,
  ...applicantInvitationsPaths,
};

const index = {
  openapi: "3.0.0",
  info,
  servers,
  paths,
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
      },
    },
    schemas,
  },
};

module.exports = {
  index,
};
