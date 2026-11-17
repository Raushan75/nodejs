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
      minLength: 5,
      maxLength: 50,
      trim: true,
    },
    lastName: {
      type: String,
    },
    emailId: {
      type: String,
      lowercase: true,
      required: true,
      unique: true,
      trim: true,
      validate(value) {
        if (!validator.isEmail(value)) {
          throw new Error("Invalid email" + value);
        }
      },
    },
    password: {
      type: String,
      required: true,
      validate(value) {
        if (!validator.isStrongPassword(value)) {
          throw new Error("Invalid password" + value);
        }
      },
    },
    age: {
      type: Number,
      min: 18,
    },
    gender: {
      type: String,
      lowercase: true,
      trim: true,
      validate(value) {
        if (["male", "female", "other"].includes(value) === false) {
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
          throw new Error("Invalid url" + value);
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
    connectRequest:[""]
  },
  
  {
    timestamps: true,
  },
);


userSchema.methods.getJWT = async function () {
  const user = this;
  const token = await jwt.sign({ _id: user._id }, "Raushan@1243$4542", {
    expiresIn: "1d",
  });

  return token;
};

userSchema.methods.validatePassword = async function (passwordInputByUser) {
  const user = this;
  const passwordHash = user.password;
  const isPasswordValid = await bcrypt.compare(
    passwordInputByUser,
    passwordHash,
  );
  return isPasswordValid;
};

module.exports = mongoose.model("User", userSchema);
