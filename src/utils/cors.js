const defaultWhitelist = [
  "http://localhost",
  "https://88c98d580c697d.lhr.life",
  "http://localhost:5173",
  "https://career.motorsights.com",
  "https://dev-career.motorsights.com",
];

const whitelist = process.env.CORS_ORIGINS
  ? process.env.CORS_ORIGINS.split(",").map((origin) => origin.trim())
  : defaultWhitelist;

const corsEnabled = process.env.CORS_ENABLED !== "false";

let allow;
if (!corsEnabled) {
  allow = false;
} else if (process.env.NODE_ENV === "development") {
  // `true` reflects the request Origin instead of a literal "*",
  // which is required for CORS to work when credentials are sent.
  allow = true;
} else {
  allow = function (origin, callback) {
    if (!origin || whitelist.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  };
}

const corsOptions = {
  origin: allow,
  methods: process.env.CORS_METHODS
    ? process.env.CORS_METHODS.split(",").map((method) => method.trim())
    : undefined,
  allowedHeaders: process.env.CORS_HEADERS
    ? process.env.CORS_HEADERS.split(",").map((header) => header.trim())
    : undefined,
  credentials: process.env.CORS_CREDENTIALS === "true",
};

module.exports = { corsOptions };
