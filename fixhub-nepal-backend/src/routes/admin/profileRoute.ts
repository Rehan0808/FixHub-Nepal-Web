import { Router } from "express";
import { getProfile, updateProfile, uploadProfilePicture } from "../../controllers/admin/profileController";
import { authenticateUser, isAdmin } from "../../middlewares/authorizedUser";

const router = Router();

router.get("/", authenticateUser as any, isAdmin as any, getProfile as any);
router.put("/", authenticateUser as any, isAdmin as any, uploadProfilePicture, updateProfile as any);

export default router;
