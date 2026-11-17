const express = require("express");
const { validateSingupData } = require("../utils/validation");
const bcrypt = require("bcrypt");
const User = require("../models/user");

const authRouter = express.Router();

const COOKIE_OPTIONS = {
  httpOnly: true,
  sameSite: "lax",
  maxAge: 24 * 60 * 60 * 1000, // 1 day, same as the JWT
};

authRouter.post("/signup", async (req, res) => {
  try {
    validateSingupData(req);

    const { firstName, lastName, emailId, password } = req.body;

    const existing = await User.findOne({
      emailId: emailId.toLowerCase().trim(),
    });
    if (existing) {
      return res.status(400).send("An account with this email already exists");
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = new User({
      firstName,
      lastName,
      emailId,
      password: passwordHash,
    });
    const savedUser = await user.save();

    res.cookie("token", savedUser.getJWT(), COOKIE_OPTIONS);
    res.json({ message: "User created successfully", data: savedUser });
  } catch (err) {
    res.status(400).send(err.message);
  }
});

authRouter.post("/login", async (req, res) => {
  try {
    const { emailId, password } = req.body;
    if (!emailId || !password) {
      return res.status(400).send("Email and password are required");
    }

    const user = await User.findOne({ emailId: emailId.toLowerCase().trim() });

    // Same message for a wrong email and a wrong password,
    // so nobody can find out which emails are registered.
    if (!user || !(await user.validatePassword(password))) {
      return res.status(401).send("Invalid email or password");
    }

    res.cookie("token", user.getJWT(), COOKIE_OPTIONS);
    res.send(user);
  } catch (err) {
    console.error("Error logging in:", err.message);
    res.status(400).send(err.message);
  }
});

authRouter.post("/logout", (req, res) => {
  res.clearCookie("token", { httpOnly: true, sameSite: "lax" });
  res.send("User logged out successfully");
});

module.exports = authRouter;
