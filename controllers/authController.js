const User = require("../models/User");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const path = require("path");

exports.signup = async (req, res) => {
  const { email, password } = req.body;
  const profileImage = req.file ? req.file.filename : null; 

  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: ", email, and password are required.",
    });
  }

  try {
    const user = await User.create({ email, password, profileImage });
    res.status(201).json({
      success: true,
      user: {
        id: user._id,
        email: user.email,
        profileImage: user.profileImage,
      },
    });
  } catch (error) {
    console.error("Error during signup:", error);
    res.status(400).json({
      success: false,
      error: "User creation failed. Please try again.",
    });
  }
};
exports.login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res
      .status(400)
      .json({ success: false, message: "Email and password are required." });
  }

  try {
    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password))) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid credentials" });
    }

    const token = jwt.sign({ id: user._id }, process.env.USER_JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRY || "7d",
    });

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        email: user.email,
        profileImage: user.profileImage,
      },
    });
  } catch (error) {
    console.error("Error during login:", error);
    res
      .status(400)
      .json({ success: false, error: "Login failed. Please try again." });
  }
};
