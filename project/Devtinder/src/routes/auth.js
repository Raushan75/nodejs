const express = require("express");
const crypto = require("crypto");
const validator = require("validator");
const { validateSingupData, validatePassword } = require("../utils/validation");
const bcrypt = require("bcrypt");
const User = require("../models/user");
const { sendEmail } = require("../utils/sendEmail");

const RESET_TOKEN_MINUTES = 15;

// only the hash is stored, so a leaked database can't be used to reset passwords
const hashToken = (token) =>
  crypto.createHash("sha256").update(token).digest("hex");

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

// Step 1: user enters their email; we email them a one-time reset link.
authRouter.post("/forgot-password", async (req, res) => {
  // Same reply whether or not the email exists, so nobody can find out which emails are registered.
  const GENERIC_REPLY =
    "If an account exists for this email, a password reset link has been sent.";
  try {
    const { emailId } = req.body;
    if (!emailId || !validator.isEmail(emailId)) {
      return res.status(400).send("Please enter a valid email");
    }

    const user = await User.findOne({ emailId: emailId.toLowerCase().trim() });
    if (!user) {
      return res.send({ message: GENERIC_REPLY });
    }

    const token = crypto.randomBytes(32).toString("hex");
    user.passwordResetToken = hashToken(token);
    user.passwordResetExpires = new Date(Date.now() + RESET_TOKEN_MINUTES * 60 * 1000);
    await user.save();

    const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";
    const resetUrl = `${clientUrl}/reset-password/${token}`;

    try {
      await sendEmail({
        to: user.emailId,
        subject: "Reset your DevTinder password",
        text:
          `Hi ${user.firstName},\n\n` +
          `Open this link to choose a new password (it works for ${RESET_TOKEN_MINUTES} minutes):\n` +
          `${resetUrl}\n\n` +
          `If you didn't ask for this, you can ignore this email.`,
        html:
          `<p>Hi ${user.firstName},</p>` +
          `<p><a href="${resetUrl}">Click here to choose a new password</a>. ` +
          `The link works for ${RESET_TOKEN_MINUTES} minutes.</p>` +
          `<p>If you didn't ask for this, you can ignore this email.</p>`,
      });
    } catch (mailErr) {
      // the link can't be used if it was never delivered, so remove it
      user.passwordResetToken = undefined;
      user.passwordResetExpires = undefined;
      await user.save();
      console.error("Error sending reset email:", mailErr.message);
      return res.status(500).send("Could not send the email, please try again later");
    }

    res.send({ message: GENERIC_REPLY });
  } catch (err) {
    res.status(400).send(err.message);
  }
});

// Step 2: user opens the link and sends a new password.
authRouter.post("/reset-password/:token", async (req, res) => {
  try {
    const { password } = req.body;
    validatePassword(password);

    const user = await User.findOne({
      passwordResetToken: hashToken(req.params.token),
      passwordResetExpires: { $gt: new Date() },
    });
    if (!user) {
      return res
        .status(400)
        .send("This reset link is invalid or has expired. Please request a new one.");
    }

    user.password = await bcrypt.hash(password, 10);
    // the link works only once
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    res.send({ message: "Password updated. You can log in with your new password." });
  } catch (err) {
    res.status(400).send(err.message);
  }
});

authRouter.post("/logout", (req, res) => {
  res.clearCookie("token", { httpOnly: true, sameSite: "lax" });
  res.send("User logged out successfully");
});

module.exports = authRouter;
