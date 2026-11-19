require("dotenv").config({ quiet: true });
const http = require("http");
const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const connectionDB = require("./config/database");
const User = require("./models/user");
const ConnectionRequest = require("./models/connectionRequest");
const Message = require("./models/message");
const initializeSocket = require("./utils/socket");
const { userAuth } = require("./middleware/auth");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  }),
);
app.use(express.json());
app.use(cookieParser());

app.use("/", require("./routes/auth"));
app.use("/", require("./routes/profile"));
app.use("/", require("./routes/request"));
app.use("/", require("./routes/user"));
app.use("/", require("./routes/chat"));
app.use("/", require("./routes/ai"));

// Delete the logged-in user's own account and their requests.
// (Before, anyone could delete any user by sending its id, with no login.)
app.delete("/user", userAuth, async (req, res) => {
  try {
    const userId = req.user._id;
    const mine = { $or: [{ fromUserId: userId }, { toUserId: userId }] };
    await ConnectionRequest.deleteMany(mine);
    await Message.deleteMany(mine);
    await User.findByIdAndDelete(userId);
    res.clearCookie("token", { httpOnly: true, sameSite: "lax" });
    res.send("Account deleted successfully");
  } catch (err) {
    res.status(400).send("Error deleting the user: " + err.message);
  }
});

// Unknown route: plain 404 instead of Express's HTML page
app.use((req, res) => {
  res.status(404).send("Route not found");
});

// Last-resort error handler: broken JSON in a request body, or any error a
// route didn't catch. Never send the stack trace to the browser.
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  if (err.type === "entity.parse.failed") {
    return res.status(400).send("Invalid JSON in request body");
  }
  console.error("Unhandled error:", err);
  res.status(500).send("Something went wrong, please try again");
});

// one HTTP server for both the REST API and the Socket.io chat
const server = http.createServer(app);
initializeSocket(server);

connectionDB()
  .then(() => {
    console.log("database connected successfully");
    server.listen(PORT, () => {
      console.log(`server is running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("database connection failed:", err.message);
  });
