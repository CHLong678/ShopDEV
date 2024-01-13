const compression = require("compression");
const express = require("express");
const { default: helmet } = require("helmet");
const morgan = require("morgan");
require("dotenv").config();

const connectDB = require("./dbs/init.mongodb");
const { countConnections, checkOverload } = require("./helpers/check.connect");
const app = express();

// Init middlewares
app.use(morgan("dev"));
app.use(helmet());
app.use(compression());

// Init database
connectDB;
countConnections();
// checkOverload();

// Init routes
app.get("/", (req, res) => {
  return res.status(200).json({
    message: "Welcome to my world",
  });
});

// Handling error

module.exports = app;
