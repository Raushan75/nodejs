const express = require("express");
const connectionDB = require("./config/database");
const User = require("./models/user");
const { validateSingupData } = require("./utils/validation");
const bcrypt = require("bcrypt");
const cookieParser = require("cookie-parser");
const jwt = require("jsonwebtoken");
const { userAuth } = require("./middleware/auth");

const app = express();
app.use(express.json());
app.use(cookieParser());

app.post("/singup", async (req, res) => {
  try {
    // validation of data
    validateSingupData(req);

    const { firstName, lastName, emailId, password } = req.body;

    // Encrypt the password
    const passwordHash = await bcrypt.hash(password, 10);

    //creating a new instance of the user model
    const user = new User({
      firstName,
      lastName,
      emailId,
      password: passwordHash,
    });
    await user.save();
    res.send("User added successfully");
  } catch (err) {
    res.status(400).send("Error: " + err.message);
  }
});

// login api
app.post("/login", async (req, res) => {
  try {
    const { emailId, password } = req.body;
    const user = await User.findOne({ emailId: emailId });

    if (!user) {
      return res.status(404).send("Email is not valid");
    }

    const isPasswordValid = await user.validatePassword(password);

    if (isPasswordValid) {
      const token = await user.getJWT();

      res.cookie("token", token, {
        expiresIn: new Date(Date.now() + 24 * 60 * 60 * 1000),
        httpOnly: true,
      });

      res.send("User logged in successfully");
    } else {
      res.status(400).send("Password is not valid");
    }
  } catch (err) {
    console.error("Error logging in:", err.message);
    res.status(400).send("Error: " + err.message);
  }
});

// profile
app.get("/profile", userAuth, async (req, res) => {
  try {
    const user = req.user;

    if (!user) {
      return res.status(404).send("user not found");
    }

    res.send(user);
  } catch (error) {
    res.status(400).send("ERROR:" + error.message);
  }
});

// send connect api

app.post("/sendConnectionRequest", userAuth, async (req, res) => {
  const user = req.user;
  res.send(user.firstName + " request sent successfully");
});

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
