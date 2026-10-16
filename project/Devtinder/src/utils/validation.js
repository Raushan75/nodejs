const validator = require("validator");
const validateSingupData = (req) => {
  const { firstName, lastName, emailId, password } = req.body;
  if (!firstName || !lastName) {
    throw new Error("Name is not valid");
  } else if (!validator.isEmail(emailId)) {
    throw new Error("Email is not valid");
  } else if (!validator.isStrongPassword(password)) {
    throw new Error("Password is not strong");
  }
};

const validateEditProfileData = (req) => {
  const allwedEditFields = [
    "firstName",
    "lastName",
    "photoUrl",
    "about",
    "skills",
    "gender",
    "age",
  ];

  const isEditAllowed = Object.keys(req.body).every((field) =>
    allwedEditFields.includes(field),
  );

  return isEditAllowed;
};

module.exports = { validateSingupData, validateEditProfileData };
