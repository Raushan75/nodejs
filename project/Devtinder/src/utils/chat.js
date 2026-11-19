const mongoose = require("mongoose");
const ConnectionRequest = require("../models/connectionRequest");
const Message = require("../models/message");

// Only users who accepted a connection request can chat with each other.
const areConnected = async (userId, otherUserId) => {
  if (!mongoose.isValidObjectId(otherUserId)) return false;
  const connection = await ConnectionRequest.exists({
    status: "accepted",
    $or: [
      { fromUserId: userId, toUserId: otherUserId },
      { fromUserId: otherUserId, toUserId: userId },
    ],
  });
  return Boolean(connection);
};

// Same room name no matter who opens the chat first.
const getRoomId = (userId, otherUserId) =>
  [userId.toString(), otherUserId.toString()].sort().join("_");

// Validate and save one message. Throws an Error with a user-friendly message.
const saveMessage = async (fromUserId, toUserId, text) => {
  if (typeof text !== "string" || !text.trim()) {
    throw new Error("Message cannot be empty");
  }
  if (text.trim().length > Message.MESSAGE_MAX_LENGTH) {
    throw new Error(
      `Message is too long (max ${Message.MESSAGE_MAX_LENGTH} characters)`,
    );
  }
  if (!(await areConnected(fromUserId, toUserId))) {
    throw new Error("You can only chat with your connections");
  }
  return Message.create({ fromUserId, toUserId, text });
};

module.exports = { areConnected, getRoomId, saveMessage };
