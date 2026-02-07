import { Router } from "express";
import { initiateEsewaPayment, verifyEsewaPayment } from "../controllers/esewaController";

const router = Router();

router.post("/initiate", initiateEsewaPayment);
router.get("/verify", verifyEsewaPayment);

export default router;
