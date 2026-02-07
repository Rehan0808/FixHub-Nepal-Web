import { Response } from "express";
import Message from "../../models/Message";
import { AuthRequest } from "../../types";

/**
 * Gets the count of unread messages for the authenticated user.
 */
const getUnreadCount = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user.id;
    const roomName = `chat-${userId}`;

    const count = await Message.countDocuments({
      room: roomName,
      isRead: false,
      authorId: { $ne: userId },
    });

    res.json({ success: true, count });
  } catch (error) {
    console.error("Error fetching unread message count:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

/**
 * Clears chat history from the user's view.
 */
const clearChatForUser = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user.id;
    const roomName = `chat-${userId}`;

    await Message.updateMany({ room: roomName }, { $set: { clearedForUser: true } });

    res.status(200).json({ success: true, message: "Your chat history has been cleared." });
  } catch (error) {
    console.error("Error clearing chat for user:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export { getUnreadCount, clearChatForUser };
