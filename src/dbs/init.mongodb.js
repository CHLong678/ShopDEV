"use strict";
const {
  db: { host, port, name },
} = require("../configs/config.mongodb");
const mongoose = require("mongoose");
const connectString = `mongodb://${host}:${port}/${name}`;

class Database {
  constructor() {
    this.connect();
  }

  //connect
  connect(type = "mongodb") {
    // DEV
    if (1 === 1) {
      mongoose.set("debug", true);
      mongoose.set("debug", { color: true });
    }

    mongoose
      .connect(connectString, { maxPoolSize: 50 })
      .then((_) => console.log("Connection established"))
      .catch((err) => console.log(err.message));
  }

  static getInstance() {
    if (!Database.instance) {
      Database.instance = new Database();
    }

    return Database.instance;
  }
}

const instanceMongodb = Database.getInstance();
module.exports = instanceMongodb;
