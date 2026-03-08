import mongoose, { Schema, Document, Model } from "mongoose";

export interface INotification extends Document {
  recipientId: string; // user or admin id
  type: "chat" | "booking" | "status" | "general";
  message: string;
  link?: string;
  read: boolean;
  createdAt: Date;
}

const notificationSchema = new Schema<INotification>({
  recipientId: { type: String, required: true, index: true },
  type: { type: String, enum: ["chat", "booking", "status", "general"], required: true },
  message: { type: String, required: true },
  link: { type: String },
  read: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

const Notification: Model<INotification> = mongoose.model<INotification>("Notification", notificationSchema);

export default Notification;
