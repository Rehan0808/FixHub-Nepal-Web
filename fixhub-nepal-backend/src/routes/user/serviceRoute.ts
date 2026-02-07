import { Router } from "express";
import { getAvailableServices, getServiceById } from "../../controllers/user/serviceController";
import { authenticateUser } from "../../middlewares/authorizedUser";

const router = Router();

router.get("/services", authenticateUser as any, getAvailableServices);
router.get("/services/:id", authenticateUser as any, getServiceById);

export default router;
