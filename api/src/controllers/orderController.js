const jsonDbClient = require("../services/jsonDbClient");
const { INPUT_WINDOW_MIN_START, INPUT_WINDOW_MIN_END } = require("../config");

// 入力窓口の判定（08:30〜08:50 に限定）
function isInInputWindow() {
  const now = new Date();
  const mins = now.getHours() * 60 + now.getMinutes();
  return (
    mins >= (INPUT_WINDOW_MIN_START || 0) && mins <= (INPUT_WINDOW_MIN_END || 0)
  );
}

async function getOrders(req, res) {
  const date = req.query.date;
  const siteId = req.siteId;
  if (!date) return res.status(400).json({ error: "date query is required" });

  try {
    const path = "/orders?date=" + date + (siteId ? "&site_id=" + siteId : "");
    const data = await jsonDbClient.get(path, siteId);
    res.json(data);
  } catch (e) {
    res.status(500).json({ error: "Failed to fetch orders" });
  }
}

async function createOrder(req, res) {
  if (!isInInputWindow()) {
    return res
      .status(403)
      .json({ error: "Outside input window (08:30-08:50)" });
  }

  const { user_id, date, menu_item_id, price } = req.body || {};
  const siteId = req.siteId;
  if (!user_id || !date || !menu_item_id || !price) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    const newOrder = {
      order_id: "ord_" + Date.now(),
      user_id,
      site_id: siteId,
      date,
      menu_item_id,
      price,
      status: "pending",
      locked_at: null,
      picked_up: false,
      picked_up_at: null,
    };
    const created = await jsonDbClient.post("/orders", newOrder, siteId);

    await jsonDbClient.post(
      "/audit_logs",
      {
        log_id: "log_" + Date.now(),
        user_id: req.user ? req.user.user_id : "unknown",
        action: "create_order",
        target_table: "orders",
        target_id: created.order_id,
        timestamp: new Date().toISOString(),
        details: "order_id=" + created.order_id,
      },
      siteId
    );

    res.status(201).json(created);
  } catch (e) {
    res.status(500).json({ error: "Failed to create order" });
  }
}

async function updateOrder(req, res) {
  const orderId = req.params.order_id;
  const updates = req.body || {};
  const siteId = req.siteId;

  try {
    const existing = await jsonDbClient.get("/orders/" + orderId, siteId);
    if (!existing) return res.status(404).json({ error: "Order not found" });

    // 09:30 ロック後の更新制御
    if (existing.status === "locked") {
      if (
        updates.hasOwnProperty("menu_item_id") ||
        updates.hasOwnProperty("date") ||
        updates.hasOwnProperty("price") ||
        updates.hasOwnProperty("status")
      ) {
        return res.status(403).json({ error: "Cannot modify locked order" });
      }
    }

    // picked_up の更新を補助
    if (updates.picked_up === true && existing.picked_up === false) {
      updates.picked_up_at = new Date().toISOString();
    }

    const updated = await jsonDbClient.patch(
      "/orders/" + orderId,
      { ...existing, ...updates },
      siteId
    );

    await jsonDbClient.post(
      "/audit_logs",
      {
        log_id: "log_" + Date.now(),
        user_id: req.user ? req.user.user_id : "unknown",
        action: "update_order",
        target_table: "orders",
        target_id: orderId,
        timestamp: new Date().toISOString(),
        details: JSON.stringify(updates),
      },
      siteId
    );

    res.json(updated);
  } catch (e) {
    res.status(500).json({ error: "Failed to update order" });
  }
}

module.exports = { getOrders, createOrder, updateOrder };
