import { Request, Response } from "express";
import Booking from "../../models/Booking";
import User from "../../models/User";
import Service from "../../models/Service";

/**
 * Gets analytics data for the admin dashboard.
 */
export const getAnalytics = async (_req: Request, res: Response): Promise<void> => {
  try {
    // Total revenue from completed and paid bookings
    const totalRevenue = await Booking.aggregate([
      { $match: { status: "Completed", isPaid: true } },
      { $group: { _id: null, total: { $sum: "$finalAmount" } } },
    ]);

    // Total bookings (all, not just paid)
    const totalBookings = await Booking.countDocuments();

    // Total users (exclude admins)
    const totalUsers = await User.countDocuments({ role: { $ne: "admin" } });

    // Total services
    const totalServices = await Service.countDocuments();

    // Bookings by status
    const bookingsByStatusData = await Booking.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]);

    const bookingsByStatus: Record<string, number> = {};
    bookingsByStatusData.forEach((item) => {
      bookingsByStatus[item._id.toLowerCase()] = item.count;
    });

    // Recent bookings
    const recentBookings = await Booking.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate("customer", "fullName");

    res.status(200).json({
      success: true,
      data: {
        totalRevenue: totalRevenue.length > 0 ? totalRevenue[0].total : 0,
        totalBookings,
        totalUsers,
        totalServices,
        bookingsByStatus,
        recentBookings,
      },
    });
  } catch (error: any) {
    console.error("Admin getAnalytics Error:", error);
    res.status(500).json({ success: false, message: "Server error.", error: error.message });
  }
};
