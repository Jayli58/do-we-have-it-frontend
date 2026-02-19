"use strict";

const crypto = require("crypto");
const fs = require("fs");
const path = require("path");

const outputDir = process.env.DWHI_OUT_DIR
  ? path.resolve(process.env.DWHI_OUT_DIR)
  : path.join(__dirname, "..", "out");

const hashesPath = path.join(
  __dirname,
  "..",
  "..",
  "infra",
  "edge-lambdas",
  "csp-nonce",
  "script-hashes.json"
);

const isHtmlFile = (filePath) => filePath.toLowerCase().endsWith(".html");

const listFiles = (dir) => {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  return entries.flatMap((entry) => {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      return listFiles(fullPath);
    }
    return [fullPath];
  });
};

const extractInlineScripts = (html) => {
  const matches = [];
  const regex = /<script(?![^>]*\ssrc=)[^>]*>([\s\S]*?)<\/script>/gi;
  let match;
  while ((match = regex.exec(html)) !== null) {
    const content = match[1].trim();
    if (content) {
      matches.push(content);
    }
  }
  return matches;
};

const hashScript = (script) => {
  const digest = crypto.createHash("sha256").update(script, "utf8").digest("base64");
  return `'sha256-${digest}'`;
};

const buildHashes = () => {
  if (!fs.existsSync(outputDir)) {
    throw new Error(`Missing output directory: ${outputDir}`);
  }

  const htmlFiles = listFiles(outputDir).filter(isHtmlFile);
  const hashSet = new Set();

  htmlFiles.forEach((filePath) => {
    const html = fs.readFileSync(filePath, "utf8");
    extractInlineScripts(html).forEach((script) => {
      hashSet.add(hashScript(script));
    });
  });

  const hashes = Array.from(hashSet).sort();
  fs.writeFileSync(hashesPath, `${JSON.stringify(hashes)}\n`, "utf8");
  console.log(`Wrote ${hashes.length} CSP hashes to ${hashesPath}`);
};

buildHashes();
