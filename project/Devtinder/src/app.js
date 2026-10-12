const express = require("express");
const connectionDB = require("./config/database");
const User = require("./models/user");

const app = express();

app.post("/singup", async (req, res) => {
  //creating a new instance of the user model
  const user = new User({
    firstName: "Himanshu",
    lastName: "Raj",
    emailId: "BwFt9@example.com",
    password: "123456",
    age: 18,
    gender: "male",
  });
  try {
    await user.save();
    res.send("User added successfully");
  } catch (err) {
    console.log("Error saving the user", err.message);
  }
});

connectionDB()
  .then(() => {
    console.log("database connected successfully");
    app.listen(3000, () => {
      console.log("server is running on port 3000");
    });
  })
  .catch((err) => {
    console.error("database connection failed", err);
  });
