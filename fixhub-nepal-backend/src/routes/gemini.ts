import { Router } from "express";
import { generateChatResponse } from "../controllers/geminiController";

const router = Router();

router.post("/chat", generateChatResponse);

export default router;
