const jsonDbClient = require("../services/jsonDbClient");

async function list(req, res) {
  try {
    const data = await jsonDbClient.get("/delivery_schedule");
    res.json(data);
  } catch (e) {
    res.status(500).json({ error: "Failed to fetch delivery schedule" });
  }
}

async function create(req, res) {
  const { date, status, notes } = req.body || {};
  try {
    const created = await jsonDbClient.post("/delivery_schedule", {
      date,
      status,
      notes,
    });
    res.json(created);
  } catch (e) {
    res.status(500).json({ error: "Failed to create delivery schedule" });
  }
}

async function printDailyOrderList(req, res) {
  const date = req.query.date;
  if (!date) {
    return res.status(400).json({ error: "date is required" });
  }

  try {
    const orders = await jsonDbClient.get("/orders?date=" + date);
    // CSV 風の印刷データを生成
    let csv =
      "order_id,user_id,date,menu_item_id,price,status,picked_up,picked_up_at\n";
    orders.forEach(function (o) {
      csv +=
        o.order_id +
        "," +
        o.user_id +
        "," +
        o.date +
        "," +
        o.menu_item_id +
        "," +
        o.price +
        "," +
        o.status +
        "," +
        o.picked_up +
        "," +
        (o.picked_up_at || "") +
        "\n";
    });
    res.setHeader("Content-Type", "text/csv");
    res.send(csv);
  } catch (e) {
    res.status(500).json({ error: "Failed to generate print data" });
  }
}

module.exports = { list, create, printDailyOrderList };
