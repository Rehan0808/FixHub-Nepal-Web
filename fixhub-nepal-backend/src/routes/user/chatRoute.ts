import { Router } from "express";
import { authenticateUser } from "../../middlewares/authorizedUser";
import { uploadChatFile } from "../../controllers/admin/chatController";
import { clearChatForUser, getUnreadCount } from "../../controllers/user/chatController";

const router = Router();

router.get("/unread-count", authenticateUser as any, getUnreadCount as any);
router.post("/upload", authenticateUser as any, uploadChatFile);
router.put("/clear", authenticateUser as any, clearChatForUser as any);

export default router;
