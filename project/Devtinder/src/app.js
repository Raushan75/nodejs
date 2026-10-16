const express = require("express");
const connectionDB = require("./config/database");
const User = require("./models/user");
const cookieParser = require("cookie-parser");
const app = express();
app.use(express.json());
app.use(cookieParser());

const authRouter = require("./routes/auth");
const profileRouter = require("./routes/profile");
const requestsRouter = require("./routes/request");

app.use("/", authRouter);
app.use("/", profileRouter);
app.use("/", requestsRouter);


//Get user by email
app.get("/user", async (req, res) => {
  const userEmail = req.body.emailId;

  try {
    if (!userEmail) {
      return res.status(400).send("emailId is required");
    }
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
  } catch (err) {
    res.status(400).send("something went wrong: " + err.message);
  }
});

//  delete  a user  from database
app.delete("/user", async (req, res) => {
  const userId = req.body.userId;
  try {
    // const user = await User.findByIdAndDelete({ _id: userId });
    const user = await User.findByIdAndDelete(userId);
    if (!user) {
      return res.status(404).send("user not found");
    }
    res.send("user deleted successfully");
  } catch (err) {
    res.status(400).send("Error deleting the user: " + err.message);
  }
});

// update data of the user

app.patch("/user/:userId", async (req, res) => {
  const userId = req.params?.userId;
  const data = req.body;

  try {
    const ALLOWED_UPDATE = ["photoUrl", "abbout", "skills", "gender", "age"];

    const isUpdateAllowed = Object.keys(data).every((k) =>
      ALLOWED_UPDATE.includes(k),
    );
    if (!isUpdateAllowed) {
      const invalidFields = Object.keys(data).filter(
        (k) => !ALLOWED_UPDATE.includes(k),
      );
      return res.status(400).send({
        error: "invalid update",
        invalidFields,
        allowedFields: ALLOWED_UPDATE,
      });
    }

    if (data?.skills?.length > 10) {
      return res.status(400).send({ error: "skills cannot be more than 10" });
    }

    const user = await User.findByIdAndUpdate({ _id: userId }, data, {
      runValidators: true,
    });
    if (!user) {
      return res.status(404).send("user not found");
    }
    res.send("user updated successfully");
  } catch (err) {
    res.status(400).send("Error updating the user: " + err.message);
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
