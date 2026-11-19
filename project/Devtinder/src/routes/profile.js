const express = require("express");
const { userAuth } = require("../middleware/auth");
const { COOKIE_OPTIONS } = require("../utils/cookieOptions");
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

// change the password of the logged-in user (needs the current password,
// so someone using an open session can't lock the owner out)
profileRouter.patch("/profile/password", userAuth, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword) {
      return res.status(400).send("Current password is required");
    }

    const user = req.user;
    if (!(await user.validatePassword(currentPassword))) {
      // 400, not 401: a 401 would make the frontend think the session ended
      return res.status(400).send("Current password is incorrect");
    }
    validatePassword(newPassword);
    if (await user.validatePassword(newPassword)) {
      return res
        .status(400)
        .send("New password must be different from the current one");
    }

    // logs out all other sessions...
    await user.setPassword(newPassword);
    await user.save();
    // ...but keeps this one logged in with a fresh token
    res.cookie("token", user.getJWT(), COOKIE_OPTIONS);

    res.send({
      message: `${user.firstName}, your password was updated successfully`,
    });
  } catch (err) {
    res.status(400).send(err.message);
  }
});

module.exports = profileRouter;
