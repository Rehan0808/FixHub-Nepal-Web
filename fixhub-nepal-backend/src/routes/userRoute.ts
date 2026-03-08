import { Router } from "express";
import {
  registerUser,
  loginUser,
  sendResetLink,
  resetPassword,
  changePassword,
  sendResetOtp,
  resetPasswordWithOtp,
} from "../controllers/userController";
import { authenticateUser } from "../middlewares/authorizedUser";

const router = Router();

router.post("/register", registerUser);
router.post("/login", loginUser);

// Web: link-based reset
router.post("/forgot-password", sendResetLink);
router.post("/reset-password/:token", resetPassword);

// Mobile: OTP-based reset
router.post("/forgot-password-otp", sendResetOtp);
router.post("/reset-password-otp", resetPasswordWithOtp);

router.post("/change-password", authenticateUser as any, changePassword as any);

export default router;
