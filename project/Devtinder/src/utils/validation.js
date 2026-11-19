const validator = require("validator");

const PASSWORD_RULES =
  "Password must be at least 8 characters with an uppercase letter, a lowercase letter, a number and a symbol";

const validatePassword = (password) => {
  if (typeof password !== "string" || !validator.isStrongPassword(password)) {
    throw new Error(PASSWORD_RULES);
  }
};

const validateSingupData = (req) => {
  const { firstName, emailId, password } = req.body;
  if (typeof firstName !== "string" || firstName.trim().length < 2) {
    throw new Error("First name must be at least 2 characters");
  }
  if (typeof emailId !== "string" || !validator.isEmail(emailId)) {
    throw new Error("Email is not valid");
  }
  validatePassword(password);
};

const validateEditProfileData = (req) => {
  const allowedEditFields = [
    "firstName",
    "lastName",
    "photoUrl",
    "about",
    "skills",
    "gender",
    "age",
  ];

  return Object.keys(req.body).every((field) =>
    allowedEditFields.includes(field),
  );
};

module.exports = { validateSingupData, validateEditProfileData, validatePassword };
