const express = require("express");
const { userAuth } = require("../middleware/auth");

const requestsRouter = express.Router();

// send connect api

requestsRouter.post("/sendConnectionRequest", userAuth, async (req, res) => {
  const user = req.user;
  res.send(user.firstName + " request sent successfully");
});

module.exports = requestsRouter;