import mongoose, { Schema, Model } from "mongoose";
import { IWorkshop } from "../types";

const WorkshopSchema = new Schema<IWorkshop>(
  {
    ownerName: { type: String, required: true },
    workshopName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String },
    address: { type: String },
    profilePicture: { type: String },
    offerPickupDropoff: { type: Boolean, default: true },
    pickupDropoffChargePerKm: { type: Number, default: 50 },
  },
  { timestamps: true }
);

const Workshop: Model<IWorkshop> = mongoose.model<IWorkshop>("Workshop", WorkshopSchema);

export default Workshop;
