import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import User from "../models/User";
import { ResetJwtPayload } from "../types";

/**
 * Registers a new user with a 'normal' role.
 */
export const registerUser = async (req: Request, res: Response): Promise<void> => {
  const { email, fullName, password } = req.body;

  if (!email || !fullName || !password) {
    res.status(400).json({
      success: false,
      message: "Please fill all the fields",
    });
    return;
  }

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      res.status(409).json({
        success: false,
        message: "User with this email already exists",
      });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      email,
      fullName,
      password: hashedPassword,
    });

    await newUser.save();

    const userData = {
      id: newUser._id,
      email: newUser.email,
      fullName: newUser.fullName,
      role: newUser.role,
    };

    res.status(201).json({
      success: true,
      message: `User '${fullName}' registered successfully.`,
      data: userData,
    });
  } catch (e) {
    console.error("Registration Error:", e);
    res.status(500).json({
      success: false,
      message: "Server error during registration",
    });
  }
};

/**
 * Logs in a user and returns a JWT token.
 */
export const loginUser = async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400).json({ success: false, message: "Email and password are required" });
    return;
  }

  try {
    const user = await User.findOne({ email });
    if (!user) {
      res.status(404).json({ success: false, message: "User not found" });
      return;
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      res.status(401).json({ success: false, message: "Invalid credentials" });
      return;
    }

    const payload = {
      _id: user._id,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
    };

    const token = jwt.sign(payload, process.env.SECRET as string, { expiresIn: "100d" });

    const responseData = {
      _id: user._id,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
    };

    res.status(200).json({
      success: true,
      message: "Login successful",
      data: responseData,
      token,
    });
  } catch (err) {
    console.error("Login Error:", err);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// Email transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

/**
 * Sends a password reset link to the user's email.
 */
export const sendResetLink = async (req: Request, res: Response): Promise<void> => {
  const { email } = req.body;

  if (!email) {
    res.status(400).json({ success: false, message: "Email is required" });
    return;
  }

  try {
    const user = await User.findOne({ email });
    if (!user) {
      res.status(200).json({
        success: true,
        message: "If an account with that email exists, a reset link has been sent.",
      });
      return;
    }

    const token = jwt.sign({ id: user._id }, process.env.SECRET as string, { expiresIn: "15m" });

    const resetUrl = `${process.env.CLIENT_URL}/reset-password/${token}`;

    const mailOptions: nodemailer.SendMailOptions = {
      from: `'MotoFix' <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Reset Your MotoFix Password",
      html: `
                <p>Hello ${user.fullName},</p>
                <p>You requested a password reset. Please click the link below to create a new password:</p>
                <a href="${resetUrl}" style="background-color: #1a202c; color: white; padding: 10px 15px; text-decoration: none; border-radius: 5px;">Reset Password</a>
                <p>This link will expire in 15 minutes.</p>
                <p>If you did not request this, please ignore this email.</p>
            `,
    };

    transporter.sendMail(mailOptions, (err) => {
      if (err) {
        console.error("Error sending email:", err);
        res.status(500).json({
          success: false,
          message: "Failed to send reset email. Please try again later.",
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: "If an account with that email exists, a reset link has been sent.",
      });
    });
  } catch (err) {
    console.error("Forgot Password Error:", err);
    res.status(500).json({
      success: false,
      message: "Server error. Please try again.",
    });
  }
};

/**
 * Resets the user's password using a valid token.
 */
export const resetPassword = async (req: Request, res: Response): Promise<void> => {
  const { token } = req.params;
  const { password } = req.body;

  if (!password) {
    res.status(400).json({ success: false, message: "Password is required" });
    return;
  }

  try {
    const decoded = jwt.verify(token as string, process.env.SECRET as string) as unknown as ResetJwtPayload;
    const userId = decoded.id;
    const hashedPassword = await bcrypt.hash(password, 10);

    await User.findByIdAndUpdate(userId, { password: hashedPassword });

    res.status(200).json({
      success: true,
      message: "Password has been reset successfully.",
    });
  } catch (err: any) {
    if (err.name === "JsonWebTokenError") {
      res.status(401).json({ success: false, message: "Invalid token." });
      return;
    }
    if (err.name === "TokenExpiredError") {
      res.status(401).json({
        success: false,
        message: "Token has expired. Please request a new reset link.",
      });
      return;
    }

    console.error("Reset Password Error:", err);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};
