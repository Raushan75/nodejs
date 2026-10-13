const express = require("express");
const connectionDB = require("./config/database");
const User = require("./models/user");

const app = express();
app.use(express.json());

app.post("/singup", async (req, res) => {
  //creating a new instance of the user model
  const user = new User(req.body);
  try {
    await user.save();
    res.send("User added successfully");
  } catch (err) {
    console.log("Error saving the user", err.message);
  }
});
//Get user by email
app.get("/user", async (req, res) => {
  const userEmail = req.body.emailId;

  try {
    console.log("userEmail", userEmail);
    const users = await User.findOne({ emailId: userEmail });
    if (!users) {
      return res.status(404).send("user not found");
    } else {
      res.send(users);
    }
    // const users = await User.find({ emailId: userEmail });
    // if(users.length === 0){
    //     return res.status(404).send("user not found");
    // }else{
    //     res.send(users);
    // }
  } catch (err) {
    res.status(400).send("something went wrong: " + err.message);
  }
});

// feed api - get/feed - get all the users from the database
app.get("/feed", async (req, res) => {
  try {
    const users = await User.find({});
    res.send(users);
  } catch (error) {
    res.status(400).send("something went wrong: " + err.message);
  }
});

//  delete  a user  from database
app.delete("/user", async (req, res) => {
  const userId = req.body.userId;
  try {
    // const user = await User.findByIdAndDelete({ _id: userId });
    const user = await User.findByIdAndDelete(userId);
    res.send("user deleted successfully");
  } catch (error) {
    console.error("Error deleting the user", err.message);
  }
});

// update data of the user

app.patch("/user/:userId", async (req, res) => {
  const userId = req.params?.userId;
  const data = req.body;

  try {
    const ALLOWED_UPDATE = ["photoUrl", "abbout", "skills", "gender", "age"];

    const isUpdateAllowed = Object.keys(data).every((k) =>
      ALLOWED_UPDATE.includes(update),
    );
    if (!isUpdateAllowed) {
      return res.status(400).send({ error: "invalid update" });
    }

    if (data?.skills.length > 10) {
      return res.status(400).send({ error: "skills should be moe than 5" });
    }

    await User.findByIdAndUpdate({ _id: userId }, data);
    runvalidators = true;
    res.send("user updated successfully");
  } catch (error) {
    console.error("Error updating the user", err.message);
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
