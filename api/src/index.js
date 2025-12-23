// api/src/index.js
const express = require("express");
const morgan = require("morgan");
require("dotenv").config();

const app = express();
app.use(express.json());
app.use(morgan("dev"));

require("./config/routes")(app);

const PORT = process.env.API_PORT || 8080;
app.listen(PORT, function () {
  console.log("API server listening on port " + PORT);
});
module.exports = app;
