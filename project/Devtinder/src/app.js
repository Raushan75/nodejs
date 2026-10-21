const express = require("express");
const connectionDB = require("./config/database");
const User = require("./models/user");
const cookieParser = require("cookie-parser");
const app = express();
app.use(express.json());
app.use(cookieParser());

const authRouter = require("./routes/auth");
const profileRouter = require("./routes/profile");
const requestsRouter = require("./routes/request");
const userRouter = require("./routes/user");

app.use("/", authRouter);
app.use("/", profileRouter);
app.use("/", requestsRouter);
app.use("/",userRouter)



//  delete  a user  from database
app.delete("/user", async (req, res) => {
  const userId = req.body.userId;
  try {
    // const user = await User.findByIdAndDelete({ _id: userId });
    const user = await User.findByIdAndDelete(userId);
    if (!user) {
      return res.status(404).send("user not found");
    }
    res.send("user deleted successfully");
  } catch (err) {
    res.status(400).send("Error deleting the user: " + err.message);
  }
});


connectionDB()
  .then(() => {
    console.log("database connected successfully");
    app.listen(3000, () => {
      console.log("server is running on port 3000");
    });
  })
  .catch((err) => {
    console.error("database connection failed", err);
  });
