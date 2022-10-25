const mongoose = require("mongoose");

class ConnectDB {
  constructor() {
    this.connect();
  }
  connect(url) {
    mongoose
      .connect(url)
      .then(() => {
        console.log("Database connection successful");
      })
      .catch((err) => {
        console.error(err);
      });
  }
}

module.exports = new ConnectDB();