const mongoose = require("mongoose");
const connectionRequestSchema = new mongoose.Schema(
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
    status: {
      type: String,
      required: true,
      enum: {
        values: ["ignored", "interested", "accepted", "rejected"],
        message: `{VALUE} is incorrect `,
      },
    },
  },
  {
    timestamps: true,
  },
);
// One request per pair (in this direction). The database enforces it, so two
// requests sent at the same moment can't both be saved.
connectionRequestSchema.index({ fromUserId: 1, toUserId: 1 }, { unique: true });
// used by the "requests received" and "connections" lists
connectionRequestSchema.index({ toUserId: 1, status: 1 });

connectionRequestSchema.pre("save", async function () {
  const connectionRequest = this;

  // check if the fromuserId is same as toUserId
  if (connectionRequest.fromUserId.equals(connectionRequest.toUserId)) {
    throw new Error("user cannot be send request to itself");
  }
});

const ConnectionRequest = mongoose.model(
  "ConnectionRequest",
  connectionRequestSchema,
);
module.exports = ConnectionRequest;
