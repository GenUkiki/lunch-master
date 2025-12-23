const jsonDbClient = require("../services/jsonDbClient");
async function verifyToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  const token = authHeader.substring(7); // remove "Bearer "
  // token 形式: token-<user_id>
  if (!token.startsWith("token-")) {
    return res.status(401).json({ error: "Invalid token" });
  }
  const userId = token.substring(6);
  try {
    const users = await jsonDbClient.get("/users");
    const user = users.find((u) => u.user_id === userId);
    if (!user) return res.status(401).json({ error: "Invalid user" });
    req.user = user;
    next();
  } catch (e) {
    return res.status(500).json({ error: "Auth error" });
  }
}
module.exports = verifyToken;
