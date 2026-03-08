import { Router } from "express";
import { createServiceReview, getAllReviews } from "../controllers/reviewController";
import { authenticateUser } from "../middlewares/authorizedUser";

const router = Router();

router.get("/", authenticateUser as any, getAllReviews);
router.route("/:bookingId").post(authenticateUser as any, createServiceReview as any);

export default router;
