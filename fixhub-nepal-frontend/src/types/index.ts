export interface User {
  _id: string;
  fullName: string;
  email: string;
  phone?: string;
  address?: string;
  role: "normal" | "admin";
  profileImage?: string;
  loyaltyPoints?: number;
  createdAt: string;
  updatedAt: string;
}

export interface Service {
  _id: string;
  name: string;
  description: string;
  price: number;
  duration: string;
  category: string;
  image?: string;
  isAvailable: boolean;
  createdAt: string;
}

export interface Booking {
  _id: string;
  customer: string | User;
  service: string | Service;
  bikeModel: string;
  customerName: string;
  serviceType: string;
  status: "Pending" | "In Progress" | "Completed" | "Cancelled";
  date: string;
  notes?: string;
  totalCost: number;
  discountApplied?: boolean;
  discountAmount?: number;
  finalAmount: number;
  paymentStatus: "Pending" | "Paid" | "Failed";
  paymentMethod?: "COD" | "Khalti" | "eSewa" | "Not Selected";
  isPaid: boolean;
  pointsAwarded?: number;
  reviewSubmitted?: boolean;
  archivedByAdmin?: boolean;
  requestedPickupDropoff?: boolean;
  pickupAddress?: string;
  dropoffAddress?: string;
  pickupCoordinates?: { lat: number; lng: number };
  dropoffCoordinates?: { lat: number; lng: number };
  pickupDropoffDistance?: number;
  pickupDropoffCost?: number;
  createdAt: string;
  updatedAt?: string;
}

export interface Message {
  _id: string;
  senderId: string;
  recipientId: string;
  message: string;
  createdAt: string;
}

export interface Review {
  _id: string;
  userId: string | User;
  workshopId?: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface DashboardData {
  upcomingBookings: number;
  completedServices: number;
  recentBookings: Booking[];
  loyaltyPoints: number;
}

export interface AdminDashboardData {
  totalUsers: number;
  totalBookings: number;
  totalRevenue: number;
  totalServices: number;
  recentBookings: Booking[];
  bookingsByStatus: Record<string, number>;
}

export interface AuthResponse {
  success: boolean;
  token: string;
  user: User;
  message?: string;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
}
