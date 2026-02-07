import { Request, Response } from "express";
import mongoose from "mongoose";
import multer from "multer";
import path from "path";
import fs from "fs";
import Message from "../../models/Message";
import { AuthRequest } from "../../types";

// Chat file upload directory
const uploadDir = "uploads/chat";
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } }).single("file");

/**
 * Uploads a file in a chat conversation.
 */
export const uploadChatFile = (req: Request, res: Response): void => {
  upload(req, res, async (err: any) => {
    if (err) {
      res.status(400).json({ message: `File upload error: ${err.message}` });
      return;
    }
    if (!req.file) {
      res.status(400).json({ message: "No file was uploaded." });
      return;
    }

    const { room, author, authorId, message } = req.body;
    if (!room || !author || !authorId) {
      res.status(400).json({ message: "Missing required chat information." });
      return;
    }

    const io = req.app.get("socketio");
    try {
      const fileUrl = `${req.protocol}://${req.get("host")}/${req.file.path.replace(/\\/g, "/")}`;
      const fileMessage = new Message({
        room,
        author,
        authorId,
        message,
        fileUrl,
        fileName: req.file.originalname,
        fileType: req.file.mimetype,
        isRead: false,
      });
      await fileMessage.save();

      io.to(room).emit("receive_message", fileMessage.toObject());
      io.to(room).emit("new_message_notification", {
        room,
        authorId,
        message: message || `Sent a ${req.file.mimetype.split("/")[0]}`,
      });
      res.status(201).json({ success: true, message: "File sent successfully." });
    } catch (error) {
      res.status(500).json({ message: "Server error while processing the file." });
    }
  });
};

/**
 * Gets all chat users with their latest messages (admin view).
 */
export const getChatUsers = async (_req: Request, res: Response): Promise<void> => {
  try {
    const pipeline: mongoose.PipelineStage[] = [
      {
        $match: {
          clearedForAdmin: { $ne: true },
          authorId: { $ne: "admin_user" },
        },
      },
      { $sort: { createdAt: -1 } },
      {
        $group: {
          _id: "$room",
          lastMessageDoc: { $first: "$$ROOT" },
          unreadCount: { $sum: { $cond: [{ $eq: ["$isRead", false] }, 1, 0] } },
        },
      },
      {
        $project: {
          _id: 0,
          room: "$_id",
          lastMessage: {
            $ifNull: [
              "$lastMessageDoc.message",
              { $concat: ["Sent a ", { $arrayElemAt: [{ $split: ["$lastMessageDoc.fileType", "/"] }, 0] }] },
            ],
          },
          lastMessageTimestamp: "$lastMessageDoc.createdAt",
          unreadCount: 1,
          userId: { $arrayElemAt: [{ $split: ["$_id", "-"] }, 1] },
        },
      },
      { $match: { userId: { $regex: /^[0-9a-fA-F]{24}$/ } } },
      { $addFields: { userIdObj: { $toObjectId: "$userId" } } },
      { $lookup: { from: "users", localField: "userIdObj", foreignField: "_id", as: "userDetails" } },
      { $match: { userDetails: { $ne: [] } } },
      { $unwind: "$userDetails" },
      {
        $project: {
          _id: "$userDetails._id",
          fullName: "$userDetails.fullName",
          email: "$userDetails.email",
          profilePicture: "$userDetails.profilePicture",
          lastMessage: { $ifNull: ["$lastMessage", "No messages yet."] },
          lastMessageTimestamp: 1,
          unreadCount: 1,
        },
      },
      { $sort: { lastMessageTimestamp: -1 } },
    ];

    const conversations = await Message.aggregate(pipeline);
    res.json({ success: true, data: conversations });
  } catch (error) {
    console.error("Error fetching chat users:", error);
    res.status(500).json({ success: false, message: "Server error while fetching chat users." });
  }
};

/**
 * Clears chat history for admin view.
 */
export const clearChatForAdmin = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.params.userId as string;
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      res.status(400).json({ success: false, message: "Invalid User ID." });
      return;
    }

    const roomName = `chat-${userId}`;
    await Message.updateMany({ room: roomName }, { $set: { clearedForAdmin: true } });
    res.status(200).json({ success: true, message: "Chat history has been cleared from your view." });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error while clearing chat history." });
  }
};
