"use strict";

const fs = require("fs");
const path = require("path");

const readHashes = () => {
  const hashesPath = path.join(__dirname, "script-hashes.json");
  try {
    const raw = fs.readFileSync(hashesPath, "utf8");
    const hashes = JSON.parse(raw);
    return Array.isArray(hashes) ? hashes : [];
  } catch (error) {
    console.log("Failed to load CSP hashes:", error);
    return [];
  }
};

const buildCsp = (hashes) => {
  const scriptSources = ["'self'", ...hashes].join(" ").trim();
  const directives = [
    "default-src 'self'",
    `script-src ${scriptSources}`,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob:",
    "font-src 'self' data:",
    "connect-src 'self' https://api.dwhi.823252.xyz",
    "object-src 'none'",
    "base-uri 'self'",
    "frame-ancestors 'none'",
  ];
  return directives.join("; ");
};

exports.handler = async (event) => {
  const response = event.Records[0].cf.response;
  const headers = response.headers;
  const hashes = readHashes();

  headers["content-security-policy"] = [
    {
      key: "Content-Security-Policy",
      value: buildCsp(hashes),
    },
  ];
  headers["x-content-type-options"] = [
    { key: "X-Content-Type-Options", value: "nosniff" },
  ];
  headers["x-frame-options"] = [
    { key: "X-Frame-Options", value: "DENY" },
  ];
  headers["referrer-policy"] = [
    { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  ];
  headers["permissions-policy"] = [
    { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  ];

  return response;
};
