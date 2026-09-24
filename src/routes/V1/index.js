const express = require("express");
// const { verifyToken } = require('../../middlewares')

const routing = express();
const API_TAG = "/api/career";

/* RULE
naming convention endpoint: using plural
Example:
- GET /api/examples
- POST /api/examples
- GET /api/examples/:id
- PUT /api/examples/:id
- DELETE /api/examples/:id
*/

// Example Module (Template untuk module Anda)
const exampleModule = require("../../modules/example");
routing.use(`${API_TAG}/examples`, exampleModule);

// Applicant Forms Module
const applicantFormsModule = require("../../modules/applicant_forms");
routing.use(`${API_TAG}/applicant-forms`, applicantFormsModule);

// Applicant Invitations Module (generate & verify applicant-form access token)
const applicantInvitationsModule = require("../../modules/applicant_invitations");
routing.use(`${API_TAG}/applicant-invitations`, applicantInvitationsModule);

// Applicant Form Signatures Module (upload signature file ke Nextcloud)
const applicantFormSignaturesModule = require("../../modules/applicant_form_signatures");
routing.use(`${API_TAG}/applicant-form-signatures`, applicantFormSignaturesModule);

// Applicant Form Files Module (upload file ke Nextcloud)
const applicantFormFilesModule = require("../../modules/applicant_form_files");
routing.use(`${API_TAG}/applicant-form-files`, applicantFormFilesModule);

// Tambahkan routes module Anda di sini
// Example:
// const yourModule = require('../../modules/yourModule')
// routing.use(`${API_TAG}/your-endpoint`, yourModule)

module.exports = routing;
