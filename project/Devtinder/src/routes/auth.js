const express = require("express");
const { validateSingupData } = require("../utils/validation");
const bcrypt = require("bcrypt");
const User = require("../models/user");

const authRouter = express.Router();

authRouter.post("/signup", async (req, res) => {
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
authRouter.post("/login", async (req, res) => {
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

module.exports = authRouter;
