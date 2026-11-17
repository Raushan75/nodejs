require("dotenv").config({ quiet: true });
const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const connectionDB = require("./config/database");
const User = require("./models/user");
const ConnectionRequest = require("./models/connectionRequest");
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

// Delete the logged-in user's own account and their requests.
// (Before, anyone could delete any user by sending its id, with no login.)
app.delete("/user", userAuth, async (req, res) => {
  try {
    const userId = req.user._id;
    await ConnectionRequest.deleteMany({
      $or: [{ fromUserId: userId }, { toUserId: userId }],
    });
    await User.findByIdAndDelete(userId);
    res.clearCookie("token", { httpOnly: true, sameSite: "lax" });
    res.send("Account deleted successfully");
  } catch (err) {
    res.status(400).send("Error deleting the user: " + err.message);
  }
});

connectionDB()
  .then(() => {
    console.log("database connected successfully");
    app.listen(PORT, () => {
      console.log(`server is running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("database connection failed:", err.message);
  });
