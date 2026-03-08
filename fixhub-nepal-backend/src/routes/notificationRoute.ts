import { Router } from "express";
import Notification from "../models/Notification";
import { authenticateUser } from "../middlewares/authorizedUser";

const router = Router();

// Get notifications for logged-in user
router.get("/", authenticateUser as any, async (req: any, res) => {
  try {
    const notifications = await Notification.find({ recipientId: req.user._id }).sort({ createdAt: -1 }).limit(50);
    res.json({ success: true, data: notifications });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to fetch notifications" });
  }
});

// Mark notification as read
router.put("/:id/read", authenticateUser as any, async (req: any, res) => {
  try {
    await Notification.findByIdAndUpdate(req.params.id, { read: true });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to mark as read" });
  }
});

// Mark all as read
router.put("/read-all", authenticateUser as any, async (req: any, res) => {
  try {
    await Notification.updateMany({ recipientId: req.user._id, read: false }, { read: true });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to mark all as read" });
  }
});

export default router;
