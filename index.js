/**
 * Imports
 */

const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const api = require("./lib/api");

/**
 * Constants
 */

const PORT = 8080;
const PUBLIC_DIR = "public";

/**
 * Initialization
 */

const app = express();

/**
 * Middlewares
 */

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, PUBLIC_DIR)));

/**
 * Endpoints
 */

app.get("/ping", function (req, res) {
  return res.json({ message: "pong" });
});

app.get("/search", api.search);

const port = process.env.PORT || PORT;
app
  .listen(port, () => {
    console.info("Server running at:", port);
  })
  .on("error", error => {
    if (error) {
      console.error("Failed to start server...", error.code);
      return;
    }
  });
