import mongoose, { Schema, Model } from "mongoose";
import { IUser } from "../types";

const UserSchema = new Schema<IUser>(
  {
    fullName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, default: "normal" },
    phone: { type: String, default: "" },
    address: { type: String, default: "" },
    profilePicture: { type: String, default: "" },
    loyaltyPoints: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const User: Model<IUser> = mongoose.model<IUser>("User", UserSchema);

export default User;
