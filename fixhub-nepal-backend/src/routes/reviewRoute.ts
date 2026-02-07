import { Router } from "express";
import { createServiceReview } from "../controllers/reviewController";
import { authenticateUser } from "../middlewares/authorizedUser";

const router = Router();

router.route("/:bookingId").post(authenticateUser as any, createServiceReview as any);

export default router;
