const express = require("express");
const { userAuth } = require("../middleware/auth");
const Message = require("../models/message");
const User = require("../models/user");
const { areConnected } = require("../utils/chat");

const chatRouter = express.Router();

const USER_SAFE_DATA = "firstName lastName photoUrl";
const HISTORY_LIMIT = 100;

// Chat history with one connection (last 100 messages, oldest first)
// plus that person's name and photo for the chat header.
chatRouter.get("/chat/:targetUserId", userAuth, async (req, res) => {
  try {
    const userId = req.user._id;
    const { targetUserId } = req.params;

    if (!(await areConnected(userId, targetUserId))) {
      return res.status(403).send("You can only chat with your connections");
    }

    const [targetUser, newestFirst] = await Promise.all([
      User.findById(targetUserId).select(USER_SAFE_DATA),
      Message.find({
        $or: [
          { fromUserId: userId, toUserId: targetUserId },
          { fromUserId: targetUserId, toUserId: userId },
        ],
      })
        .sort({ createdAt: -1 })
        .limit(HISTORY_LIMIT),
    ]);
    if (!targetUser) {
      return res.status(404).send("User not found");
    }

    res.json({ targetUser, messages: newestFirst.reverse() });
  } catch (err) {
    res.status(400).send(err.message);
  }
});

module.exports = chatRouter;
