import { Document, Types } from "mongoose";
import { Request } from "express";

// ==========================================
// Mongoose Document Interfaces
// ==========================================

export interface IUser extends Document {
  _id: Types.ObjectId;
  fullName: string;
  email: string;
  password: string;
  role: string;
  phone: string;
  address: string;
  profilePicture: string;
  loyaltyPoints: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface IReview {
  _id?: Types.ObjectId;
  user: Types.ObjectId;
  username: string;
  rating: number;
  comment?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IService extends Document {
  _id: Types.ObjectId;
  name: string;
  description: string;
  price: number;
  duration?: string;
  image: string;
  reviews: IReview[];
  rating: number;
  numReviews: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ICoordinates {
  lat?: number;
  lng?: number;
}

export interface IBooking extends Document {
  _id: Types.ObjectId;
  customer: Types.ObjectId | IUser;
  service: Types.ObjectId | IService;
  bikeModel: string;
  customerName: string;
  serviceType: string;
  status: "Pending" | "In Progress" | "Completed" | "Cancelled";
  date: Date;
  notes: string;
  totalCost: number;
  discountApplied: boolean;
  discountAmount: number;
  finalAmount: number;
  paymentStatus: "Pending" | "Paid" | "Failed";
  paymentMethod: "COD" | "Khalti" | "eSewa" | "Not Selected";
  isPaid: boolean;
  pointsAwarded: number;
  reviewSubmitted: boolean;
  archivedByAdmin: boolean;
  requestedPickupDropoff: boolean;
  pickupAddress: string;
  dropoffAddress: string;
  pickupCoordinates: ICoordinates;
  dropoffCoordinates: ICoordinates;
  pickupDropoffDistance: number;
  pickupDropoffCost: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface IMessage extends Document {
  _id: Types.ObjectId;
  room: string;
  author: string;
  authorId: string;
  message?: string;
  fileUrl?: string;
  fileName?: string;
  fileType?: string;
  isRead: boolean;
  clearedForUser: boolean;
  clearedForAdmin: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IWorkshop extends Document {
  _id: Types.ObjectId;
  user?: Types.ObjectId;
  ownerName: string;
  workshopName: string;
  email: string;
  phone?: string;
  address?: string;
  profilePicture?: string;
  offerPickupDropoff: boolean;
  pickupDropoffChargePerKm: number;
  createdAt: Date;
  updatedAt: Date;
}

// ==========================================
// Express Request Extensions
// ==========================================

/** Authenticated request — `req.user` is guaranteed after auth middleware */
export interface AuthRequest extends Request {
  user: IUser;
}

// ==========================================
// JWT Payload
// ==========================================

export interface JwtPayload {
  _id: string;
  email: string;
  fullName: string;
  role: string;
  iat?: number;
  exp?: number;
}

export interface ResetJwtPayload {
  id: string;
  iat?: number;
  exp?: number;
}

// ==========================================
// API Responses (common shapes)
// ==========================================

export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
  token?: string;
  totalPages?: number;
  currentPage?: number;
}
