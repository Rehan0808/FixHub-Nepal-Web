import { Router, Request, Response, NextFunction } from "express";
import {
  getServiceInfo,
  getAdminDashboardInfo,
  getUserDashboardInfo,
  getProfileInfo,
} from "../controllers/chatbotController";
import { authenticateUser, isAdmin } from "../middlewares/authorizedUser";
import { AuthRequest } from "../types";

const router = Router();

router.get("/services", getServiceInfo as any);

router.get("/admin-dashboard", authenticateUser as any, isAdmin as any, getAdminDashboardInfo as any);

router.get(
  "/user-dashboard",
  authenticateUser as any,
  (req: Request, res: Response, next: NextFunction) => {
    if ((req as AuthRequest).user.role === "admin") {
      return res.status(403).json({ success: false, message: "Forbidden." });
    }
    next();
  },
  getUserDashboardInfo as any
);

router.get("/profile", authenticateUser as any, getProfileInfo as any);

export default router;
