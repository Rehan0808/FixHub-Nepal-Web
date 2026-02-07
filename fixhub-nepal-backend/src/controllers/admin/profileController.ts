import { Request, Response } from "express";
import User from "../../models/User";
import Workshop from "../../models/Workshop";
import { single } from "../../middlewares/fileupload";
import { AuthRequest } from "../../types";

/**
 * Gets the admin user profile.
 */
export const getProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) {
      res.status(404).json({ success: false, message: "User not found" });
      return;
    }
    res.status(200).json({ success: true, data: user });
  } catch (error: any) {
    res.status(500).json({ success: false, message: "Server error.", error: error.message });
  }
};

/**
 * Updates the admin user profile.
 */
export const updateProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  const { fullName, phone, address } = req.body;

  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      res.status(404).json({ success: false, message: "User not found." });
      return;
    }

    user.fullName = fullName || user.fullName;
    user.phone = phone !== undefined ? phone : user.phone;
    user.address = address !== undefined ? address : user.address;

    if (req.file) {
      user.profilePicture = req.file.path.replace(/\\/g, "/");
    }

    const updatedUser = await user.save();
    const userResponse = updatedUser.toObject() as any;
    delete userResponse.password;

    res.status(200).json({ success: true, message: "Profile updated.", data: userResponse });
  } catch (error: any) {
    res.status(500).json({ success: false, message: "Server error.", error: error.message });
  }
};

/** Multer middleware for profile picture upload */
export const uploadProfilePicture = single("profilePicture");
