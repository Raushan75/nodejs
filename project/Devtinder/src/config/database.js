const mongoose = require("mongoose");

const connectionDB = async () => {
  if (!process.env.MONGODB_URI) {
    throw new Error("MONGODB_URI is missing in the .env file");
  }
  await mongoose.connect(process.env.MONGODB_URI);
};

module.exports = connectionDB;
