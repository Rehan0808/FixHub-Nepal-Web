import express, { Request, Response, NextFunction } from "express";
import Message from "../models/Message";
import { authenticateUser } from "../middlewares/authorizedUser";
import { AuthRequest } from "../types";

const router = express.Router();

// @desc    Get all messages for current user (their room with admin)
// @route   GET /api/messages
// @access  Private
router.get("/", authenticateUser , async (req: Request, res: Response): Promise<any> => {
  try {
    const userId = (req as AuthRequest).user._id || (req as AuthRequest).user.id;
    const room = `user_${userId}`;

    console.log("📱 Mobile: Fetching messages for room:", room);

    const messages = await Message.find({
      room: room,
      clearedForUser: false,
    })
      .sort({ createdAt: 1 })
      .lean();

    console.log("📱 Mobile: Found messages:", messages.length);

    const transformedMessages = messages.map((msg: any) => ({
      _id: msg._id,
      id: msg._id,
      message: msg.message || "",
      senderId: msg.authorId,
      senderName: msg.author,
      isAdmin: msg.author === "Admin Support" || msg.author.toLowerCase().includes("admin"),
      timestamp: msg.createdAt,
      createdAt: msg.createdAt,
      updatedAt: msg.updatedAt,
    }));

    return res.status(200).json({
      success: true,
      data: transformedMessages,
    });
  } catch (error: any) {
    console.error("📱 Mobile: Error fetching messages:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch messages",
      error: error.message,
    });
  }
});

// @desc    Send a message from mobile
// @route   POST /api/messages
// @access  Private
router.post("/", authenticateUser, async (req: Request, res: Response): Promise<any> => {
  try {
    const { message } = req.body;
    const userId = (req as AuthRequest).user._id || (req as AuthRequest).user.id;
    const userName = (req as AuthRequest).user.fullName || "User";
    const room = `user_${userId}`;

    console.log("📱 Mobile: Sending message from user:", userId);
    console.log("📱 Mobile: Message content:", message);

    if (!message || message.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "Message content is required",
      });
    }

    const newMessage = await Message.create({
      room: room,
      author: userName,
      authorId: userId.toString(),
      message: message.trim(),
      isRead: false,
      clearedForUser: false,
      clearedForAdmin: false,
    });

    console.log("📱 Mobile: Message created:", newMessage._id);

    // Emit socket event for real-time update (if admin is online)
    const io = (req as any).app.get("socketio");
    if (io) {
      io.to(room).emit("receive_message", newMessage);
      io.to(room).emit("new_message_notification", {
        room: room,
        authorId: userId.toString(),
        message: message.trim(),
      });
    }

    const transformedMessage = {
      _id: newMessage._id,
      id: newMessage._id,
      message: newMessage.message || "",
      senderId: newMessage.authorId,
      senderName: newMessage.author,
      isAdmin: false,
      timestamp: newMessage.createdAt,
      createdAt: newMessage.createdAt,
      updatedAt: newMessage.updatedAt,
    };

    return res.status(201).json({
      success: true,
      data: transformedMessage,
    });
  } catch (error: any) {
    console.error("📱 Mobile: Error sending message:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to send message",
      error: error.message,
    });
  }
});

export default router;
