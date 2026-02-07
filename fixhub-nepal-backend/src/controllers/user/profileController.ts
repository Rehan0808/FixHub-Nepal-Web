import { Response } from "express";
import User from "../../models/User";
import { AuthRequest } from "../../types";

/**
 * Gets the profile of the authenticated user.
 */
const getUserProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) {
      res.status(404).json({ success: false, message: "User not found" });
      return;
    }
    res.json({ success: true, data: user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

/**
 * Updates the profile of the authenticated user.
 */
const updateUserProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  const { fullName, email, phone, address } = req.body;

  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      res.status(404).json({ success: false, message: "User not found" });
      return;
    }

    user.fullName = fullName || user.fullName;
    user.email = email || user.email;
    user.phone = phone || user.phone;
    user.address = address !== undefined ? address : user.address;

    if (req.file) {
      user.profilePicture = req.file.path.replace(/\\/g, "/");
    }

    const updatedUser = await user.save();
    const userResponse = updatedUser.toObject() as any;
    delete userResponse.password;

    res.json({ success: true, data: userResponse, message: "Profile updated successfully." });
  } catch (error: any) {
    console.error(error);
    if (error.code === 11000) {
      res.status(400).json({ success: false, message: "Email address is already in use." });
      return;
    }
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

export { getUserProfile, updateUserProfile };
