const jwt = require("jsonwebtoken");
const User = require("../models/user");
const userAuth = async(req, res, next) => {
  try {
  const {token} = req.cookies;

  if(!token){
    return res.status(401).send("unauthorized");
  }

  const decodeObj = await jwt.verify(token, "Raushan@1243$4542");

  const {_id} = decodeObj;

  const user = await User.findById(_id);

  if (!user) {
    return res.status(404).send("user not found");
  }

  req.user=user;
  next();
  } catch (error) {
    res.status(400).send("ERROR:"+ error.message);
  }
 
};
module.exports = { userAuth };
