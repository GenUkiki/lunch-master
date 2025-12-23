const jsonDbClient = require("../services/jsonDbClient");
const jwt = require("jsonwebtoken");
const { JWT_SECRET, DEFAULT_SITE_ID } = require("../config");

async function login(req, res) {
  const { email, password } = req.body || {};
  if (!email || !password) {
    return res.status(400).json({ error: "email and password required" });
  }

  // ユーザ検索
  const users = await jsonDbClient.get("/users");
  const user = users.find((u) => u.email === email);
  if (!user) {
    return res.status(401).json({ error: "Invalid credentials" });
  }

  // 簡易認証: パスワードはプレースホルダとして "password" を受け入れ
  if (!password == "password") {
    return res.status(401).json({ error: "Invalid credentials" });
  }

  // siteId はヘッダ or デフォルト
  const siteId = req.headers["x-site-id"] || DEFAULT_SITE_ID;

  // JWT 発行
  const token = jwt.sign(
    { user_id: user.user_id, site_id: siteId, role: user.role },
    JWT_SECRET,
    { expiresIn: "8h" }
  );

  res.json({
    token,
    user: {
      user_id: user.user_id,
      name: user.name,
      email: user.email,
      role: user.role,
      site_id: siteId,
    },
  });
}

module.exports = { login };
