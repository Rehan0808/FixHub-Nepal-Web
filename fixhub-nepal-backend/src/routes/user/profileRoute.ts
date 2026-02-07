import { Router } from "express";
import { getUserProfile, updateUserProfile } from "../../controllers/user/profileController";
import { authenticateUser } from "../../middlewares/authorizedUser";
import * as fileupload from "../../middlewares/fileupload";

const router = Router();

router
  .route("/profile")
  .get(authenticateUser as any, getUserProfile as any)
  .put(authenticateUser as any, fileupload.single("profilePicture"), updateUserProfile as any);

export default router;
