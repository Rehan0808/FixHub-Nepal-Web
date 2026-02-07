import { Router } from "express";
import { getChatUsers, uploadChatFile, clearChatForAdmin } from "../../controllers/admin/chatController";
import { authenticateUser, isAdmin } from "../../middlewares/authorizedUser";

const router = Router();

router.get("/users", authenticateUser as any, isAdmin as any, getChatUsers);
router.post("/upload", authenticateUser as any, isAdmin as any, uploadChatFile);
router.put("/clear/:userId", authenticateUser as any, isAdmin as any, clearChatForAdmin);

export default router;
