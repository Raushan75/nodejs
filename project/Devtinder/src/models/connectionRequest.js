const mongoose = require("mongoose");
const connectionRequestschema = new mongoose.Schema(
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
// connectionRquestSchema.index({ fromUserId: 1, toUserId: 1 }, { unique: true });
connectionRequestschema.index({ fromUserId :1, toUserId:1 });

connectionRequestschema.pre("save", async function () {
  const connectionRequest = this;

  // check if the fromuserId is same as toUserId
  if (connectionRequest.fromUserId.equals(connectionRequest.toUserId)) {
    throw new Error("user cannot be send request to itself");
  }
});

const ConnectionRequest = mongoose.model(
  "ConnectionRequest",
  connectionRequestschema,
);
module.exports = ConnectionRequest;
