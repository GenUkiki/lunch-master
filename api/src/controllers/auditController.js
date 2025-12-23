const jsonDbClient = require("../services/jsonDbClient");
async function getLogs(req, res) {
  try {
    const data = await jsonDbClient.get("/audit_logs");
    res.json(data);
  } catch (e) {
    res.status(500).json({ error: "Failed to fetch audit logs" });
  }
}

module.exports = { getLogs };
