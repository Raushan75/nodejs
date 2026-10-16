const express = require("express");
const { userAuth } = require("../middleware/auth");
const { validateEditProfileData } = require("../utils/validation");
const bcrypt = require("bcrypt");
const validator = require("validator");

const profileRouter = express.Router();
// profile
profileRouter.get("/profile/view", userAuth, async (req, res) => {
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

// update data of the user
profileRouter.patch("/profile/edit", userAuth, async (req, res) => {
  try {
    if (!validateEditProfileData(req)) {
      throw new Error("data is not valid");
    }

    const loginuser = req.user;
    Object.keys(req.body).forEach((key) => (loginuser[key] = req.body[key]));
    await loginuser.save();
    res.send({
      message: `${loginuser.firstName} your profile updated successfully`,
      data: loginuser,
    });
  } catch (err) {
    res.status(400).send("Error updating the user: " + err.message);
  }
});

profileRouter.patch("/profile/password", userAuth, async (req, res) => {
  // forgot password
  try {
    const user = req.user;
    const newPassword = req.body.password;
    const passwordHash = await bcrypt.hash(newPassword, 10);
    user.password = passwordHash;
    await user.save();
    res.send({
      message: `${user.firstName} your password updated successfully`,
    });
  } catch (err) {
    res.status(400).send("Error updating the password: " + err.message);
  }
});
module.exports = profileRouter;
