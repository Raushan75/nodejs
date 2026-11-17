const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const DEFAULT_PHOTO_URL =
  "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png";
const DEFAULT_ABOUT = "This is a default description";

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
      minLength: 2,
      maxLength: 50,
      trim: true,
    },
    lastName: {
      type: String,
      trim: true,
      maxLength: 50,
    },
    emailId: {
      type: String,
      lowercase: true,
      required: true,
      unique: true,
      trim: true,
      validate(value) {
        if (!validator.isEmail(value)) {
          throw new Error("Invalid email: " + value);
        }
      },
    },
    // Stores the bcrypt hash. Password strength is checked on the plain
    // password before hashing (see utils/validation.js).
    password: {
      type: String,
      required: true,
    },
    age: {
      type: Number,
      min: [18, "You must be at least 18"],
      max: [100, "Please enter a valid age"],
    },
    gender: {
      type: String,
      lowercase: true,
      trim: true,
      validate(value) {
        if (!["male", "female", "other"].includes(value)) {
          throw new Error("Invalid gender");
        }
      },
    },
    photoUrl: {
      type: String,
      trim: true,
      default: DEFAULT_PHOTO_URL,
      // an empty string would skip the default, so turn it into the default
      set: (value) => (value && value.trim() ? value : DEFAULT_PHOTO_URL),
      validate(value) {
        if (!validator.isURL(value)) {
          throw new Error("Invalid photo URL: " + value);
        }
      },
    },
    about: {
      type: String,
      trim: true,
      maxLength: 500,
      default: DEFAULT_ABOUT,
      set: (value) => (value && value.trim() ? value : DEFAULT_ABOUT),
    },
    skills: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
    toJSON: {
      // never send the password hash (or internal fields) to the client
      transform: (doc, ret) => {
        delete ret.password;
        delete ret.__v;
        return ret;
      },
    },
  },
);

userSchema.methods.getJWT = function () {
  return jwt.sign({ _id: this._id }, process.env.JWT_SECRET, {
    expiresIn: "1d",
  });
};

userSchema.methods.validatePassword = function (passwordInputByUser) {
  return bcrypt.compare(passwordInputByUser, this.password);
};

module.exports = mongoose.model("User", userSchema);
