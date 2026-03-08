import Notification from "../models/Notification";
import { Server } from "socket.io";

interface NotificationParams {
  recipientId: string;
  type: "chat" | "booking" | "status" | "general";
  message: string;
  link?: string;
  socketRoom?: string;
}

export async function createAndEmitNotification(
  io: Server,
  {
    recipientId,
    type,
    message,
    link,
    socketRoom
  }: NotificationParams
) {
  // Debug logging
  console.log("[Notification] Creating notification:", {
    recipientId,
    type,
    message,
    link,
    socketRoom
  });
  // Save notification to DB
  const notification = await Notification.create({
    recipientId,
    type,
    message,
    link,
    read: false,
    createdAt: new Date(),
  });
  console.log("[Notification] Created notification:", notification);
  // Emit real-time notification (io may be undefined in test/non-socket environments)
  if (socketRoom) {
    io?.to(socketRoom).emit("notification", notification);
    console.log("[Notification] Emitted to room:", socketRoom);
  } else {
    io?.to(recipientId).emit("notification", notification);
    console.log("[Notification] Emitted to recipientId:", recipientId);
  }
  return notification;
}
