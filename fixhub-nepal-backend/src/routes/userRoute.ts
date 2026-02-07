import { Router } from "express";
import { registerUser, loginUser, sendResetLink, resetPassword } from "../controllers/userController";

const router = Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/forgot-password", sendResetLink);
router.post("/reset-password/:token", resetPassword);

export default router;
