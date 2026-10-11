const adminAuth = (req, res, next) => {
  console.log("auth admin check middleware");
  const token = "xyz";
  const isAuthorized = token === "xyz";
  if (!isAuthorized) {
    res.status(401).send("unauthorized");
  } else {
    next();
  }
};

const userAuth = (req, res, next) => {
  console.log("auth user check middleware");
  const token = "xyz";
  const isAuthorized = token === "xyz";
  if (!isAuthorized) {
    res.status(401).send("unauthorized");
  } else {
    next();
  }
};
module.exports = { adminAuth, userAuth };
