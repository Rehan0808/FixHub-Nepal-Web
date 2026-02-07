import { Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import User from "../models/User";
import { AuthRequest, JwtPayload } from "../types";

/**
 * Middleware: Verifies JWT token and attaches user to request.
 */
export const authenticateUser = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({
      success: false,
      message: "Authentication failed: No token provided.",
    });
    return;
  }

  try {
    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.SECRET as string) as JwtPayload;

    const user = await User.findById(decoded._id).select("-password");
    if (!user) {
      res.status(401).json({
        success: false,
        message: "Authentication failed: User associated with this token no longer exists.",
      });
      return;
    }

    req.user = user;
    next();
  } catch (err: any) {
    console.error("Authentication Error:", err.message);
    res.status(401).json({
      success: false,
      message: `Authentication failed: ${err.message}. Please try logging in again.`,
    });
  }
};

/**
 * Middleware: Checks if the authenticated user is an admin.
 */
export const isAdmin = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  if (req.user && req.user.role === "admin") {
    next();
  } else {
    res.status(403).json({
      success: false,
      message: "Access denied: Admin privileges are required.",
    });
  }
};
