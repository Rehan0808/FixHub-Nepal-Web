import { Response } from "express";
import Booking from "../../models/Booking";
import User from "../../models/User";
import { AuthRequest } from "../../types";

/**
 * Gets dashboard summary for the authenticated user.
 */
const getDashboardSummary = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user.id;
    const [user, upcomingBookings, completedServices, recentBookings] = await Promise.all([
      User.findById(userId).select("loyaltyPoints"),
      Booking.countDocuments({ customer: userId, status: { $in: ["Pending", "In Progress"] } }),
      Booking.countDocuments({ customer: userId, status: "Completed" }),
      Booking.find({ customer: userId }).sort({ date: -1 }).limit(5),
    ]);

    if (!user) {
      res.status(404).json({ success: false, message: "User not found" });
      return;
    }

    res.json({
      success: true,
      data: {
        upcomingBookings,
        completedServices,
        recentBookings,
        loyaltyPoints: user.loyaltyPoints || 0,
      },
    });
  } catch (error) {
    console.error("Error fetching dashboard summary:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

export { getDashboardSummary };
