const authMiddleware = require("../middleware/authMiddleware");
const authController = require("../controllers/authController");
const orderController = require("../controllers/orderController");
const menuController = require("../controllers/menuController");
const paymentController = require("../controllers/paymentController");
const auditController = require("../controllers/auditController");
const deliveryController = require("../controllers/deliveryController");
const { ensureAuthenticated } = require("../middleware/authMiddleware");

module.exports = function (app) {
  // 認証
  app.post("/auth/login", authController.login);

  // 一般ルーティング（認証必須）
  app.use("/api", authMiddleware); // すべての /api 以下を認証必須にする
  // 注文
  app.get("/api/orders", orderController.getOrders);
  app.post("/api/orders", orderController.createOrder);
  app.put("/api/orders/:order_id", orderController.updateOrder);
  app.patch("/api/orders/:order_id", orderController.updateOrder);
  // 献立
  app.get("/api/menu_items", menuController.getMenu);
  app.post("/api/menu_items", menuController.createMenu);
  // 請求
  app.get("/api/payments", paymentController.getPayments);
  app.patch("/api/payments/:payment_id", paymentController.updatePayment);
  // 監査
  app.get("/api/audit_logs", auditController.getLogs);
  // 配送
  app.get("/api/delivery_schedule", deliveryController.list);
  app.post("/api/delivery_schedule", deliveryController.create);

  // 印刷データ（当日分の注文者一覧など）
  app.get(
    "/api/print/daily_order_list",
    deliveryController.printDailyOrderList
  );
};
