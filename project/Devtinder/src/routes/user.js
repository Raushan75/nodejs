const express = require("express");
const userRouter = express();
const { userAuth } = require("../middleware/auth");
const ConnectionRequest = require("../models/connectionRequest");

//Get all the pending connections request for the logging user
userRouter.get("/user/request/received", userAuth, async (req, res) => {
  try {
    const loggedInUser = req.user;
    const connectionRequests = await ConnectionRequest.find({
      toUserId: loggedInUser._id,
      status: "interested",
    }).populate("fromUserId", ["firstName", "lastName"]);

    res.json({
      message: "Data fetched successfully",
      data: connectionRequests,
    });
  } catch (err) {
    res.status(400).send("something went wrong: " + err.message);
  }
});

module.exports = userRouter;
