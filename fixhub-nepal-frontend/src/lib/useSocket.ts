import { useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

export function useSocket(userId?: string) {
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!userId) return;
    if (!socket) {
      socket = io(process.env.NEXT_PUBLIC_API_URL || "http://localhost:5050", {
        transports: ["websocket"],
        withCredentials: true,
      });
    }
    socketRef.current = socket;
    socket.emit("join_room", { roomName: `chat-${userId}`, userId });
    if (userId === "admin_user") {
      socket.emit("join_room", { roomName: "admin_notifications", userId });
    }
    return () => {};
  }, [userId]);

  return socketRef.current;
}
