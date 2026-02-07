import { Router } from "express";
import { getDashboardSummary } from "../../controllers/user/dashboardController";
import { authenticateUser } from "../../middlewares/authorizedUser";
import { getUnreadCount } from "../../controllers/user/chatController";

const router = Router();

router.get("/dashboard-summary", authenticateUser as any, getDashboardSummary as any);
router.get("/chat/unread-count", authenticateUser as any, getUnreadCount as any);

export default router;
