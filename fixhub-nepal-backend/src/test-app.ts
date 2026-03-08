import "dotenv/config";
import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import path from "path";
import connectDB from "./config/db";

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
import messageRoutes from "./routes/messageRoutes";

const app = express();

// Only connect to DB once for all tests
let isConnected = false;
export const ensureDbConnection = async () => {
  if (!isConnected) {
    await connectDB();
    isConnected = true;
  }
};

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use("/uploads", express.static(path.join(__dirname, "..", "uploads")));

// --- Routes ---
app.use("/api/user", userRoute);
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
app.use("/api/messages", messageRoutes);

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

export default app;