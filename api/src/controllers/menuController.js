const jsonDbClient = require("../services/jsonDbClient");

async function getMenu(req, res) {
  const date = req.query.date;
  try {
    // テンプレートリテラルを避けて文字列結合にする
    const data = await jsonDbClient.get("/menu_items?date=" + date);
    res.json(data);
  } catch (e) {
    res.status(500).json({ error: "Failed to fetch menu items" });
  }
}

async function createMenu(req, res) {
  const { date, name, description, price, content_ref } = req.body || {};
  if (!date || !name) {
    return res.status(400).json({ error: "date and name required" });
  }
  try {
    const created = await jsonDbClient.post("/menu_items", {
      date,
      name,
      description,
      price,
      content_ref,
    });
    res.status(201).json(created);
  } catch (e) {
    res.status(500).json({ error: "Failed to create menu item" });
  }
}

module.exports = { getMenu, createMenu };
