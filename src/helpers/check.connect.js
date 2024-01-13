const mongoose = require("mongoose");
const os = require("os");
const process = require("process");

const _SECONDS = 5000;

// Check number of connections to the database
const countConnections = () => {
  const numConnections = mongoose.connections.length;
  console.log(`Number of connections: ${numConnections}`);
};

// Check overload connections
const checkOverload = () => {
  setInterval(() => {
    const numConnections = mongoose.connections.length;
    const numCores = os.cpus().length;
    const memoryUsage = process.memoryUsage().rss;

    // Maximum number of connections based on number of cores (example: 5 connections for each cores)
    const maxConnections = numCores * 5;

    console.log(`Active connections: ${numConnections}`);
    console.log(`Memory usage: ${memoryUsage / 1024 / 1024} MB`);

    if (numConnections > maxConnections) {
      console.log(`Connection overloaded detected !!!`);
    }
  }, _SECONDS); // Monitor every 5s
};

module.exports = {
  countConnections,
  checkOverload,
};
