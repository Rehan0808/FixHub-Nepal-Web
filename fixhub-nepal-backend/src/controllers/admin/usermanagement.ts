import { Request, Response } from "express";
import bcrypt from "bcrypt";
import User from "../../models/User";

/**
 * Gets all users with pagination and search.
 */
export const getUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = (req.query.search as string) || "";
    const skip = (page - 1) * limit;

    const query = search
      ? {
          $or: [
            { fullName: { $regex: search, $options: "i" } },
            { email: { $regex: search, $options: "i" } },
          ],
        }
      : {};

    const totalItems = await User.countDocuments(query);
    const users = await User.find(query).select("-password").sort({ createdAt: -1 }).limit(limit).skip(skip);

    res.status(200).json({
      success: true,
      data: users,
      totalPages: Math.ceil(totalItems / limit),
      currentPage: page,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "Server error while fetching users.",
      error: error.message,
    });
  }
};

/**
 * Creates a new user (admin action).
 */
export const createUser = async (req: Request, res: Response): Promise<void> => {
  const { fullName, email, password, role, phone } = req.body;
  if (!fullName || !email || !password) {
    res.status(400).json({
      success: false,
      message: "Please provide full name, email, and password.",
    });
    return;
  }
  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      res.status(400).json({
        success: false,
        message: "User with this email already exists.",
      });
      return;
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
      fullName,
      email,
      password: hashedPassword,
      role: role || "user",
      phone: phone || " ",
    });
    await newUser.save();
    const { password: _, ...userWithoutPassword } = newUser.toObject();
    res.status(201).json({
      success: true,
      message: "User created successfully.",
      data: userWithoutPassword,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "Server error during user creation.",
      error: error.message,
    });
  }
};

/**
 * Gets a single user by ID.
 */
export const getOneUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) {
      res.status(404).json({ success: false, message: "User not found." });
      return;
    }
    res.status(200).json({ success: true, data: user });
  } catch (error: any) {
    res.status(500).json({ success: false, message: "Server error.", error: error.message });
  }
};

/**
 * Updates a user by ID.
 */
export const updateOneUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { fullName, email, role, phone } = req.body;
    const updateData: any = { fullName, email, role, phone };
    if (req.body.password) {
      updateData.password = await bcrypt.hash(req.body.password, 10);
    }
    const updatedUser = await User.findByIdAndUpdate(req.params.id, updateData, { new: true }).select("-password");
    if (!updatedUser) {
      res.status(404).json({ success: false, message: "User not found." });
      return;
    }
    res.status(200).json({ success: true, message: "User updated successfully.", data: updatedUser });
  } catch (error: any) {
    res.status(500).json({ success: false, message: "Server error.", error: error.message });
  }
};

/**
 * Deletes a user by ID.
 */
export const deleteOneUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      res.status(404).json({ success: false, message: "User not found." });
      return;
    }
    res.status(200).json({ success: true, message: "User deleted successfully." });
  } catch (error: any) {
    res.status(500).json({ success: false, message: "Server error.", error: error.message });
  }
};

/**
 * Promotes a user to admin role.
 */
export const promoteUserToAdmin = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      res.status(404).json({ success: false, message: "User not found" });
      return;
    }
    user.role = "admin";
    await user.save();
    const { password, ...userData } = user.toObject();
    res.status(200).json({
      success: true,
      message: `User ${user.fullName} has been promoted to admin.`,
      data: userData,
    });
  } catch (error) {
    console.error("Promote user error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
