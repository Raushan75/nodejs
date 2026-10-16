const express = require("express");
const { userAuth } = require("../middleware/auth");

const profileRouter = express.Router();
// profile
profileRouter.get("/profile", userAuth, async (req, res) => {
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

module.exports = profileRouter;