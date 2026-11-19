const mongoose = require("mongoose");

const MESSAGE_MAX_LENGTH = 1000;

// One chat message between two connected users.
const messageSchema = new mongoose.Schema(
  {
    fromUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    toUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    text: {
      type: String,
      required: true,
      trim: true,
      minLength: 1,
      maxLength: MESSAGE_MAX_LENGTH,
    },
  },
  { timestamps: true },
);

// loading a conversation: both directions, newest first
messageSchema.index({ fromUserId: 1, toUserId: 1, createdAt: -1 });

module.exports = mongoose.model("Message", messageSchema);
module.exports.MESSAGE_MAX_LENGTH = MESSAGE_MAX_LENGTH;
