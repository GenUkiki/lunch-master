module.exports = {
  DB_BASE_URL: process.env.DB_BASE_URL || "http://localhost:3000",
  INPUT_WINDOW_MIN_START: 8 * 60 + 30, // 08:30
  INPUT_WINDOW_MIN_END: 8 * 60 + 50, // 08:50
  TIMEZONE: "Asia/Tokyo", // 実運用時は正しい TZ を設定
};
