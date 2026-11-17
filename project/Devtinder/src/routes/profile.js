const express = require("express");
const bcrypt = require("bcrypt");
const { userAuth } = require("../middleware/auth");
const {
  validateEditProfileData,
  validatePassword,
} = require("../utils/validation");

const profileRouter = express.Router();

profileRouter.get("/profile/view", userAuth, (req, res) => {
  res.send(req.user);
});

profileRouter.patch("/profile/edit", userAuth, async (req, res) => {
  try {
    if (!validateEditProfileData(req)) {
      throw new Error("Some of these fields cannot be edited");
    }

    const loggedInUser = req.user;
    Object.keys(req.body).forEach((key) => {
      const value = req.body[key];
      // an empty age or gender means "not set"
      loggedInUser[key] =
        (key === "age" || key === "gender") && value === "" ? undefined : value;
    });
    await loggedInUser.save();

    res.send({
      message: `${loggedInUser.firstName}, your profile was updated successfully`,
      data: loggedInUser,
    });
  } catch (err) {
    res.status(400).send(err.message);
  }
});

// change the password of the logged-in user
profileRouter.patch("/profile/forgot-password", userAuth, async (req, res) => {
  try {
    const { password } = req.body;
    validatePassword(password);

    const user = req.user;
    user.password = await bcrypt.hash(password, 10);
    await user.save();

    res.send({
      message: `${user.firstName}, your password was updated successfully`,
    });
  } catch (err) {
    res.status(400).send(err.message);
  }
});

module.exports = profileRouter;
