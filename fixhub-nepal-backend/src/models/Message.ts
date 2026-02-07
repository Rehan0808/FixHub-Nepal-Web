import mongoose, { Schema, Model } from "mongoose";
import { IMessage } from "../types";

const messageSchema = new Schema<IMessage>(
  {
    room: { type: String, required: true, index: true },
    author: { type: String, required: true },
    authorId: { type: String, required: true },
    message: { type: String },
    fileUrl: { type: String },
    fileName: { type: String },
    fileType: { type: String },
    isRead: { type: Boolean, default: false },
    clearedForUser: { type: Boolean, default: false },
    clearedForAdmin: { type: Boolean, default: false },
  },
  { timestamps: true }
);

messageSchema.index({ room: 1, clearedForUser: 1 });
messageSchema.index({ room: 1, clearedForAdmin: 1 });

const Message: Model<IMessage> = mongoose.model<IMessage>("Message", messageSchema);

export default Message;
