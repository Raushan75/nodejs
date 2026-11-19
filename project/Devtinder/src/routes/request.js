const express = require("express");
const mongoose = require("mongoose");
const { userAuth } = require("../middleware/auth");
const ConnectionRequest = require("../models/connectionRequest");
const User = require("../models/user");

const requestsRouter = express.Router();

// send a request (interested) or skip a user (ignored)
requestsRouter.post(
  "/request/send/:status/:toUserId",
  userAuth,
  async (req, res) => {
    try {
      const fromUserId = req.user._id;
      const { status, toUserId } = req.params;

      if (!["ignored", "interested"].includes(status)) {
        return res.status(400).send("Invalid status: " + status);
      }
      if (!mongoose.isValidObjectId(toUserId)) {
        return res.status(400).send("Invalid user id");
      }
      if (fromUserId.equals(toUserId)) {
        return res.status(400).send("You cannot send a request to yourself");
      }

      const toUser = await User.findById(toUserId);
      if (!toUser) {
        return res.status(404).send("User not found");
      }

      const existingConnectionRequest = await ConnectionRequest.findOne({
        $or: [
          { fromUserId, toUserId },
          { fromUserId: toUserId, toUserId: fromUserId },
        ],
      });
      if (existingConnectionRequest) {
        return res.status(400).send("Connection request already exists");
      }

      const data = await new ConnectionRequest({
        fromUserId,
        toUserId,
        status,
      }).save();

      res.json({ message: "Connection request sent successfully", data });
    } catch (error) {
      // unique index hit: the same request was sent twice at the same time
      if (error.code === 11000) {
        return res.status(400).send("Connection request already exists");
      }
      res.status(400).send(error.message);
    }
  },
);

// accept or reject a request that was sent to the logged-in user
requestsRouter.post(
  "/request/review/:status/:requestId",
  userAuth,
  async (req, res) => {
    try {
      const { status, requestId } = req.params;

      if (!["accepted", "rejected"].includes(status)) {
        return res.status(400).send("Invalid status: " + status);
      }
      if (!mongoose.isValidObjectId(requestId)) {
        return res.status(400).send("Invalid request id");
      }

      const connectionRequest = await ConnectionRequest.findOne({
        _id: requestId,
        toUserId: req.user._id,
        status: "interested",
      });
      if (!connectionRequest) {
        return res.status(404).send("Connection request not found");
      }

      connectionRequest.status = status;
      const data = await connectionRequest.save();

      res.json({ message: "Connection request " + status, data });
    } catch (error) {
      res.status(400).send(error.message);
    }
  },
);

module.exports = requestsRouter;
