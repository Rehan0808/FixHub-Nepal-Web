import { Router } from "express";
import { getAnalytics } from "../../controllers/admin/dashboardController";
import { authenticateUser, isAdmin } from "../../middlewares/authorizedUser";

const router = Router();

router.get("/dashboard-summary", authenticateUser as any, isAdmin as any, getAnalytics);

export default router;
