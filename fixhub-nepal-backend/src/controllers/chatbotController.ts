import { Response } from "express";
import Service from "../models/Service";
import Booking from "../models/Booking";
import User from "../models/User";
import Workshop from "../models/Workshop";
import { AuthRequest } from "../types";

/**
 * Gets basic service info for the chatbot.
 */
export const getServiceInfo = async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const services = await Service.find().select("name description price duration");
    res.status(200).json({ success: true, data: services });
  } catch (error: any) {
    res.status(500).json({ success: false, message: "Server error while fetching services.", error: error.message });
  }
};

/**
 * Gets admin dashboard info for the chatbot.
 */
export const getAdminDashboardInfo = async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const [revenueResult, totalBookings, pendingBookings, inProgressBookings] = await Promise.all([
      Booking.aggregate([
        { $match: { status: "Completed" } },
        { $group: { _id: null, total: { $sum: "$totalCost" } } },
      ]),
      Booking.countDocuments(),
      Booking.countDocuments({ status: "Pending" }),
      Booking.countDocuments({ status: "In Progress" }),
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalRevenue: revenueResult.length > 0 ? revenueResult[0].total : 0,
        totalBookings,
        pendingBookings,
        inProgressBookings,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: "Server error while fetching admin data.", error: error.message });
  }
};

/**
 * Gets user dashboard info for the chatbot.
 */
export const getUserDashboardInfo = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user.id;
    const [user, totalBookings, pendingBookings, inProgressBookings, completedServices] = await Promise.all([
      User.findById(userId).select("loyaltyPoints"),
      Booking.countDocuments({ customer: userId }),
      Booking.countDocuments({ customer: userId, status: "Pending" }),
      Booking.countDocuments({ customer: userId, status: "In Progress" }),
      Booking.countDocuments({ customer: userId, status: "Completed" }),
    ]);

    if (!user) {
      res.status(404).json({ success: false, message: "User not found." });
      return;
    }

    res.status(200).json({
      success: true,
      data: {
        totalBookings,
        upcomingServices: pendingBookings + inProgressBookings,
        completedServices,
        loyaltyPoints: user.loyaltyPoints || 0,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: "Server error while fetching user data.", error: error.message });
  }
};

/**
 * Gets profile info for the chatbot (admin or user).
 */
export const getProfileInfo = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;

    if (userRole === "admin") {
      const adminUser = await User.findById(userId);
      if (!adminUser) {
        res.status(404).json({ success: false, message: "Admin user not found." });
        return;
      }

      let workshop = await Workshop.findOne({
        $or: [{ user: userId }, { email: adminUser.email }],
      }).select("workshopName ownerName email phone address");

      if (!workshop) {
        workshop = new Workshop({
          user: userId,
          workshopName: "My Workshop",
          ownerName: adminUser.fullName,
          email: adminUser.email,
          phone: adminUser.phone || "",
          address: adminUser.address || "",
        });
        await workshop.save();
      } else if (!workshop.user || workshop.user.toString() !== userId.toString()) {
        workshop.user = userId;
        await workshop.save();
      }

      res.status(200).json({ success: true, data: workshop });
    } else {
      const user = await User.findById(userId).select("fullName email phone address");
      if (!user) {
        res.status(404).json({ success: false, message: "User profile not found." });
        return;
      }
      res.status(200).json({ success: true, data: user });
    }
  } catch (error: any) {
    console.error("Chatbot Profile Fetch Error:", error);
    res.status(500).json({ success: false, message: "Server error while fetching profile info.", error: error.message });
  }
};
