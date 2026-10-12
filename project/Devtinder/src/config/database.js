const mongoose = require("mongoose");

const connectionDB = async () => {
  await mongoose.connect(
    "mongodb+srv://graushan7585_db_user:A17zuiCVWHIgwtGG@learn-node.hl5eywo.mongodb.net/devTinder",
  );
};

module.exports = connectionDB;


