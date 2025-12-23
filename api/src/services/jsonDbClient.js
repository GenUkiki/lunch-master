const fetch = require("node-fetch");

const DEFAULT_BASE = process.env.DB_BASE_URL || "http://localhost:3000";
const SITE_BASES = {
  siteA: "http://localhost:3000",
  siteB: "http://localhost:3001",
};

async function request(method, path, body, siteId) {
  const base = (siteId && SITE_BASES[siteId]) || DEFAULT_BASE;
  // path が / から始まることを保証
  const normalizedPath = path.startsWith("/") ? path : "/" + path;
  const url = base + normalizedPath;

  const opts = { method, headers: { "Content-Type": "application/json" } };
  if (body) opts.body = JSON.stringify(body);

  const res = await fetch(url, opts);
  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`DB error: ${res.status} ${errText}`);
  }

  const contentType = res.headers.get("content-type");
  if (contentType && contentType.includes("application/json")) {
    return res.json();
  }
  return {};
}

module.exports = {
  get: (path, siteId) => request("GET", path, null, siteId),
  post: (path, body, siteId) => request("POST", path, body, siteId),
  patch: (path, body, siteId) => request("PATCH", path, body, siteId),
  put: (path, body, siteId) => request("PUT", path, body, siteId),
};
