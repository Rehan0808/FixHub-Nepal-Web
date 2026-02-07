import { Router } from "express";
import {
  createService,
  getServices,
  updateService,
  deleteService,
  getServiceWithReviews,
} from "../../controllers/admin/serviceController";
import uploadMiddleware from "../../middlewares/upload";
import { authenticateUser, isAdmin } from "../../middlewares/authorizedUser";

const router = Router();

router.post("/", authenticateUser as any, isAdmin as any, uploadMiddleware, createService);
router.get("/", authenticateUser as any, isAdmin as any, getServices);
router.put("/:id", authenticateUser as any, isAdmin as any, uploadMiddleware, updateService);
router.delete("/:id", authenticateUser as any, isAdmin as any, deleteService);
router.get("/:id/reviews", authenticateUser as any, isAdmin as any, getServiceWithReviews);

export default router;
