const express = require("express");
const { userAuth } = require("../middleware/auth");
const ConnectionRequest = require("../models/connectionRequest");
const User = require("../models/user");

const userRouter = express.Router();

// Public profile fields only: never the email or password.
const USER_SAFE_DATA = "firstName lastName photoUrl about age gender skills";

// pending connection requests sent to the logged-in user
userRouter.get("/user/request/received", userAuth, async (req, res) => {
  try {
    const connectionRequests = await ConnectionRequest.find({
      toUserId: req.user._id,
      status: "interested",
    }).populate("fromUserId", USER_SAFE_DATA);

    res.json({
      message: "Data fetched successfully",
      // skip requests whose sender account was deleted
      data: connectionRequests.filter((r) => r.fromUserId),
    });
  } catch (err) {
    res.status(400).send(err.message);
  }
});

userRouter.get("/user/connections", userAuth, async (req, res) => {
  try {
    const loggedInUser = req.user;
    const connectionRequests = await ConnectionRequest.find({
      $or: [
        { toUserId: loggedInUser._id, status: "accepted" },
        { fromUserId: loggedInUser._id, status: "accepted" },
      ],
    })
      .populate("fromUserId", USER_SAFE_DATA)
      .populate("toUserId", USER_SAFE_DATA);

    const data = connectionRequests
      // skip connections where one of the accounts was deleted
      .filter((row) => row.fromUserId && row.toUserId)
      .map((row) =>
        row.fromUserId._id.equals(loggedInUser._id)
          ? row.toUserId
          : row.fromUserId,
      );

    res.json({ message: "Data fetched successfully", data });
  } catch (error) {
    res.status(400).send(error.message);
  }
});

userRouter.get("/feed", userAuth, async (req, res) => {
  try {
    const loggedInUser = req.user;

    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit) || 10, 1), 50);
    const skip = (page - 1) * limit;

    const connectionRequests = await ConnectionRequest.find({
      $or: [{ fromUserId: loggedInUser._id }, { toUserId: loggedInUser._id }],
    }).select("fromUserId toUserId");

    // hide yourself and everyone you already sent to / received from
    const hideUsersFromFeed = new Set([loggedInUser._id.toString()]);
    connectionRequests.forEach((r) => {
      hideUsersFromFeed.add(r.fromUserId.toString());
      hideUsersFromFeed.add(r.toUserId.toString());
    });

    const users = await User.find({
      _id: { $nin: Array.from(hideUsersFromFeed) },
    })
      .select(USER_SAFE_DATA)
      .skip(skip)
      .limit(limit);

    res.send(users);
  } catch (err) {
    res.status(400).send(err.message);
  }
});

module.exports = userRouter;
