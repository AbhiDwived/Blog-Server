const User = require("../models/User");
const path = require("path");

exports.updateProfile = async (req, res) => {
  try {
    const { name, email } = req.body;
    const profileImage = req.file ? req.file.filename : null;

    const updateData = {};
    if (name) updateData.name = name;
    if (email) updateData.email = email;
    if (profileImage) updateData.profileImage = profileImage;

    const updatedUser = await User.findByIdAndUpdate(req.user.id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    res.status(200).json({
      success: true,
      user: updatedUser,
    });
  } catch (error) {
    console.error("Error updating profile:", error);
    res.status(400).json({
      success: false,
      error: "Failed to update profile. Please try again.",
    });
  }
};

exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    console.error("Error retrieving profile:", error);
    res.status(400).json({
      success: false,
      error: "Failed to retrieve profile. Please try again.",
    });
  }
};
