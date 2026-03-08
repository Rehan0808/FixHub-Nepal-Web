import { Router } from "express";
import { getUserProfile, updateUserProfile, updateUserProfilePicture } from "../../controllers/user/profileController";
import { authenticateUser } from "../../middlewares/authorizedUser";
import * as fileupload from "../../middlewares/fileupload";

const router = Router();

router
  .route("/profile")
  .get(authenticateUser as any, getUserProfile as any)
  .put(authenticateUser as any, fileupload.single("profilePicture"), updateUserProfile as any);

// POST for profile picture only (mobile app; POST + multipart is reliable; web keeps using PUT above)
router.post(
  "/profile/picture",
  authenticateUser as any,
  (req, res, next) => {
    fileupload.singleProfilePicture("profilePicture")(req, res, (err: any) => {
      if (err) {
        if (err.code === "LIMIT_FILE_SIZE") {
          return res.status(400).json({ success: false, message: "File too large. Maximum size is 5MB." });
        }
        return res.status(400).json({ success: false, message: err.message || "File upload failed." });
      }
      next();
    });
  },
  updateUserProfilePicture as any
);

export default router;
