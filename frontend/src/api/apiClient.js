const BASE = process.env.REACT_APP_API_BASE_URL || "http://localhost:8080";
const DEFAULT_SITE_ID = "siteA";
async function request(method, path, body) {
  const token = localStorage.getItem("token");
  const siteId = localStorage.getItem("siteId") || DEFAULT_SITE_ID;
  const headers = {
    "Content-Type": "application/json",
  };
  if (token) headers["Authorization"] = "Bearer " + token;
  if (siteId) headers["X-Site-Id"] = siteId;

  const res = await fetch(BASE + path, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error("API error: " + (err || res.status));
  }

  const ct = res.headers.get("content-type") || "";
  if (ct.includes("application/json")) {
    return res.json();
  }
  return {};
}

export default {
  login: (email, password) =>
    request("POST", "/auth/login", { email, password }),
  get: (path) => request("GET", path),
  post: (path, body) => request("POST", path, body),
  patch: (path, body) => request("PATCH", path, body),
  put: (path, body) => request("PUT", path, body),
  setSite: (siteId) => localStorage.setItem("siteId", siteId),
};
