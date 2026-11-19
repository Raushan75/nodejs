const jwt = require("jsonwebtoken");
const User = require("../models/user");

// Turns a login token into the user it belongs to.
// Throws an Error with a user-friendly message when the token can't be used.
// Shared by the HTTP middleware below and the chat socket (utils/socket.js).
const getUserFromToken = async (token) => {
  if (!token) throw new Error("Please login first");

  let payload;
  try {
    payload = jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    // invalid or expired token
    throw new Error("Session expired, please login again");
  }

  const user = await User.findById(payload._id);
  if (!user) throw new Error("User not found, please login again");
  if (user.tokenIssuedBeforePasswordChange(payload.iat)) {
    throw new Error("Your password was changed, please login again");
  }
  return user;
};

const userAuth = async (req, res, next) => {
  try {
    req.user = await getUserFromToken(req.cookies.token);
    next();
  } catch (error) {
    res.status(401).send(error.message);
  }
};

module.exports = { userAuth, getUserFromToken };
