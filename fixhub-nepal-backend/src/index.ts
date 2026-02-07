import "dotenv/config";
import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import path from "path";
import http from "http";
import { Server, Socket } from "socket.io";
import connectDB from "./config/db";
import Message from "./models/Message";

// Route imports
import userRoute from "./routes/userRoute";
import adminUserRoute from "./routes/admin/adminUserRoute";
import adminBookingRoute from "./routes/admin/bookingRoute";
import adminServiceRoute from "./routes/admin/serviceRoute";
import adminProfileRoute from "./routes/admin/profileRoute";
import adminDashboardRoute from "./routes/admin/dashboardRoute";
import adminChatRoute from "./routes/admin/chatRoute";
import userDashboardRoute from "./routes/user/dashboardRoute";
import userBookingRoute from "./routes/user/bookingRoute";
import userServiceRoute from "./routes/user/serviceRoute";
import userProfileRoute from "./routes/user/profileRoute";
import userChatRoute from "./routes/user/chatRoute";
import esewaRoute from "./routes/esewaRoute";
import geminiRoute from "./routes/gemini";
import reviewRoute from "./routes/reviewRoute";

const app = express();
const server = http.createServer(app);
connectDB();

const io = new Server(server, {
  cors: {
    origin: ["http://localhost:3000", "http://localhost:5173"],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  },
});

app.set("socketio", io);
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use("/uploads", express.static(path.join(__dirname, "..", "uploads")));

// --- Routes ---
app.use("/api/auth", userRoute);
app.use("/api/admin/users", adminUserRoute);
app.use("/api/admin/bookings", adminBookingRoute);
app.use("/api/admin/services", adminServiceRoute);
app.use("/api/admin/profile", adminProfileRoute);
app.use("/api/admin", adminDashboardRoute);
app.use("/api/admin/chat", adminChatRoute);
app.use("/api/user", userDashboardRoute);
app.use("/api/user", userBookingRoute);
app.use("/api/user", userServiceRoute);
app.use("/api/user", userProfileRoute);
app.use("/api/user/chat", userChatRoute);
app.use("/api/payment/esewa", esewaRoute);
app.use("/api/gemini", geminiRoute);
app.use("/api/reviews", reviewRoute);

// --- Socket.IO ---
io.on("connection", (socket: Socket) => {
  socket.on("join_room", async (data: { roomName: string; userId: string }) => {
    const { roomName, userId } = data;
    socket.join(roomName);
    console.log(`User ${userId} joined room: ${roomName}`);
    try {
      await Message.updateMany(
        { room: roomName, authorId: { $ne: userId }, isRead: false },
        { $set: { isRead: true } }
      );
      const eventName = userId === "admin_user" ? "messages_read_by_admin" : "messages_read_by_user";
      socket.emit(eventName, { room: roomName });

      const historyQuery: any = { room: roomName };
      if (userId === "admin_user") {
        historyQuery.clearedForAdmin = { $ne: true };
      } else {
        historyQuery.clearedForUser = { $ne: true };
      }
      const history = await Message.find(historyQuery).sort({ createdAt: 1 }).limit(100);
      socket.emit("chat_history", history);
    } catch (error) {
      console.error(`Error in join_room for room ${roomName}:`, error);
    }
  });

  socket.on(
    "send_message",
    async (data: { message: string; room: string; author: string; authorId: string }) => {
      if (!data.message || data.message.trim() === "") return;
      console.log(`Message from ${data.author} (${data.authorId}) to room ${data.room}: ${data.message}`);
      try {
        const message = new Message({
          room: data.room,
          author: data.author,
          authorId: data.authorId,
          message: data.message,
          isRead: false,
        });
        await message.save();
        console.log(`Broadcasting message to room ${data.room}, message ID: ${message._id}`);
        io.to(data.room).emit("receive_message", message);
        io.to(data.room).emit("new_message_notification", {
          room: data.room,
          authorId: data.authorId,
          message: data.message,
        });
      } catch (error) {
        console.error("Error saving message:", error);
      }
    }
  );

  socket.on("disconnect", () => {});
});

// --- Error Handling ---
app.use((req: Request, res: Response, next: NextFunction) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  res.status(404);
  next(error);
});

app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode).json({
    message: err.message,
    stack: process.env.NODE_ENV === "production" ? "🥞" : err.stack,
  });
});

// --- Start Server ---
const PORT = process.env.PORT || 5050;
const listenServer = server.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});

export { app, listenServer as server, io };
