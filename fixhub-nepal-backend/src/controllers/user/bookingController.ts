import { Response } from "express";
import Booking from "../../models/Booking";
import Service from "../../models/Service";
import User from "../../models/User";
import Workshop from "../../models/Workshop";
import axios from "axios";
import sendEmail from "../../utils/sendEmail";
import { AuthRequest, IBooking, IUser, ICoordinates } from "../../types";

const SUCCESS_ICON_URL =
  "https://cdn.vectorstock.com/i/500p/20/36/3d-green-check-icon-tick-mark-symbol-vector-56142036.jpg";

/**
 * Awards random loyalty points (10-20) to a user.
 */
const awardLoyaltyPoints = async (userId: string): Promise<number> => {
  const user = await User.findById(userId);
  if (user) {
    const pointsToAdd = Math.floor(Math.random() * 11) + 10;
    user.loyaltyPoints = (user.loyaltyPoints || 0) + pointsToAdd;
    await user.save();
    return pointsToAdd;
  }
  return 0;
};

/**
 * Calculates a simulated distance between two coordinates.
 */
const calculateDistance = (_coord1: ICoordinates, _coord2: ICoordinates): number => {
  return parseFloat((Math.random() * (20 - 1) + 1).toFixed(2));
};

/**
 * Gets all bookings for the authenticated user with pagination.
 */
const getUserBookings = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 11;
    const skip = (page - 1) * limit;

    const query = { customer: req.user.id };

    const totalItems = await Booking.countDocuments(query);
    const bookings = await Booking.find(query).sort({ createdAt: -1 }).limit(limit).skip(skip);

    res.json({
      success: true,
      data: bookings,
      totalPages: Math.ceil(totalItems / limit),
      currentPage: page,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

/**
 * Gets a single booking by ID for the authenticated user.
 */
const getUserBookingById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const booking = await Booking.findOne({ _id: req.params.id, customer: req.user.id });
    if (!booking) {
      res.status(404).json({ success: false, message: "Booking not found or you are not authorized." });
      return;
    }
    res.json({ success: true, data: booking });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

/**
 * Gets all pending (unpaid) bookings for the user.
 */
const getPendingBookings = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const bookings = await Booking.find({
      customer: req.user.id,
      paymentStatus: "Pending",
      status: { $ne: "Cancelled" },
    }).sort({ createdAt: -1 });
    res.json({ success: true, data: bookings });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

/**
 * Gets booking history (paid bookings) for the user.
 */
const getBookingHistory = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const query = { customer: req.user.id, paymentStatus: "Paid" };
    const bookings = await Booking.find(query).sort({ createdAt: -1 });
    res.json({ success: true, data: bookings });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

/**
 * Creates a new booking for the authenticated user.
 */
const createBooking = async (req: AuthRequest, res: Response): Promise<void> => {
  const {
    serviceId,
    bikeModel,
    date,
    notes,
    requestedPickupDropoff,
    pickupAddress,
    dropoffAddress,
    pickupCoordinates,
    dropoffCoordinates,
  } = req.body;

  if (!serviceId || !bikeModel || !date) {
    res.status(400).json({
      success: false,
      message: "Please provide all required fields (Service, Bike Model, Date).",
    });
    return;
  }

  try {
    const user = await User.findById(req.user.id);
    const service = await Service.findById(serviceId);
    let workshop = await Workshop.findOne();

    // Create default workshop if doesn't exist
    if (!workshop) {
      workshop = await Workshop.create({
        ownerName: "Admin",
        workshopName: "FixHub Nepal",
        email: "admin@fixhub.com",
        offerPickupDropoff: true,
        pickupDropoffChargePerKm: 50,
      });
    }

    if (!user) { res.status(404).json({ success: false, message: "User not found." }); return; }
    if (!service) { res.status(404).json({ success: false, message: "Service not found." }); return; }

    let pickupDropoffDistance = 0;
    let pickupDropoffCost = 0;
    let finalAmount = service.price;

    if (requestedPickupDropoff) {
      if (!pickupAddress || !dropoffAddress || !pickupCoordinates || !dropoffCoordinates) {
        res.status(400).json({ success: false, message: "Pickup/Dropoff details are incomplete." });
        return;
      }
      pickupDropoffDistance = calculateDistance(pickupCoordinates, dropoffCoordinates);
      pickupDropoffCost = pickupDropoffDistance * (workshop.pickupDropoffChargePerKm || 50);
      finalAmount += pickupDropoffCost;
    }

    const booking = new Booking({
      customer: user._id,
      customerName: user.fullName,
      serviceType: service.name,
      service: serviceId,
      bikeModel,
      date,
      notes,
      totalCost: service.price,
      finalAmount,
      status: "Pending",
      paymentStatus: "Pending",
      isPaid: false,
      requestedPickupDropoff: requestedPickupDropoff || false,
      pickupAddress: requestedPickupDropoff ? pickupAddress : "",
      dropoffAddress: requestedPickupDropoff ? dropoffAddress : "",
      pickupCoordinates: requestedPickupDropoff ? pickupCoordinates : undefined,
      dropoffCoordinates: requestedPickupDropoff ? dropoffCoordinates : undefined,
      pickupDropoffDistance: requestedPickupDropoff ? pickupDropoffDistance : 0,
      pickupDropoffCost: requestedPickupDropoff ? pickupDropoffCost : 0,
    });

    await booking.save();
    res.status(201).json({ success: true, data: booking, message: "Booking created. Please complete payment." });
  } catch (error) {
    console.error("Error creating booking:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

/**
 * Updates an existing booking for the user.
 */
const updateUserBooking = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const {
      serviceId,
      bikeModel,
      date,
      notes,
      requestedPickupDropoff,
      pickupAddress,
      dropoffAddress,
      pickupCoordinates,
      dropoffCoordinates,
      status,
      paymentMethod,
      paymentStatus,
    } = req.body;

    const booking = await Booking.findById(req.params.id);
    let workshop = await Workshop.findOne();

    // Create default workshop if doesn't exist
    if (!workshop) {
      workshop = await Workshop.create({
        ownerName: "Admin",
        workshopName: "FixHub Nepal",
        email: "admin@fixhub.com",
        offerPickupDropoff: true,
        pickupDropoffChargePerKm: 50,
      });
    }

    if (!booking) { res.status(404).json({ success: false, message: "Booking not found" }); return; }
    if (booking.customer.toString() !== req.user.id) { res.status(401).json({ success: false, message: "User not authorized" }); return; }
    
    // Allow status/payment updates even for paid bookings
    if (status) {
      booking.status = status;
    }
    if (paymentMethod) {
      booking.paymentMethod = paymentMethod;
    }
    if (paymentStatus) {
      booking.paymentStatus = paymentStatus;
    }

    // Only allow other updates if booking is still pending and unpaid
    if (booking.status !== "Pending" && !status || booking.isPaid || booking.discountApplied) {
      if (!status && !paymentMethod && !paymentStatus) {
        res.status(400).json({ success: false, message: "Cannot edit a booking that is already in progress, paid, or has a discount." });
        return;
      }
      // If only updating status/payment fields, save and return
      await booking.save();
      res.json({ success: true, data: booking, message: "Booking updated successfully" });
      return;
    }

    let newTotalCost = booking.totalCost;
    let newPickupDropoffCost = 0;
    let newPickupDropoffDistance = 0;

    if (serviceId && booking.service.toString() !== serviceId) {
      const service = await Service.findById(serviceId);
      if (!service) { res.status(404).json({ success: false, message: "New service not found." }); return; }
      booking.serviceType = service.name;
      newTotalCost = service.price;
      booking.service = serviceId;
    }

    if (requestedPickupDropoff !== undefined) {
      booking.requestedPickupDropoff = requestedPickupDropoff;
      if (requestedPickupDropoff) {
        if (!pickupAddress || !dropoffAddress || !pickupCoordinates || !dropoffCoordinates) {
          res.status(400).json({ success: false, message: "Pickup/Dropoff details are incomplete for requested service." });
          return;
        }
        newPickupDropoffDistance = calculateDistance(pickupCoordinates, dropoffCoordinates);
        newPickupDropoffCost = newPickupDropoffDistance * (workshop.pickupDropoffChargePerKm || 50);

        booking.pickupAddress = pickupAddress;
        booking.dropoffAddress = dropoffAddress;
        booking.pickupCoordinates = pickupCoordinates;
        booking.dropoffCoordinates = dropoffCoordinates;
        booking.pickupDropoffDistance = newPickupDropoffDistance;
      } else {
        booking.pickupAddress = "";
        booking.dropoffAddress = "";
        booking.pickupDropoffDistance = 0;
        newPickupDropoffCost = 0;
      }
      booking.pickupDropoffCost = newPickupDropoffCost;
    } else {
      if (booking.requestedPickupDropoff) {
        let recalculate = false;
        if (pickupAddress && booking.pickupAddress !== pickupAddress) { booking.pickupAddress = pickupAddress; recalculate = true; }
        if (dropoffAddress && booking.dropoffAddress !== dropoffAddress) { booking.dropoffAddress = dropoffAddress; recalculate = true; }
        if (pickupCoordinates && (booking.pickupCoordinates.lat !== pickupCoordinates.lat || booking.pickupCoordinates.lng !== pickupCoordinates.lng)) { booking.pickupCoordinates = pickupCoordinates; recalculate = true; }
        if (dropoffCoordinates && (booking.dropoffCoordinates.lat !== dropoffCoordinates.lat || booking.dropoffCoordinates.lng !== dropoffCoordinates.lng)) { booking.dropoffCoordinates = dropoffCoordinates; recalculate = true; }

        if (recalculate) {
          newPickupDropoffDistance = calculateDistance(booking.pickupCoordinates, booking.dropoffCoordinates);
          newPickupDropoffCost = newPickupDropoffDistance * (workshop.pickupDropoffChargePerKm || 50);
          booking.pickupDropoffDistance = newPickupDropoffDistance;
          booking.pickupDropoffCost = newPickupDropoffCost;
        }
      }
    }

    booking.totalCost = newTotalCost;

    const calculatedFinalAmount = newTotalCost + booking.pickupDropoffCost;
    if (booking.discountApplied) {
      booking.finalAmount = calculatedFinalAmount - calculatedFinalAmount * 0.2;
    } else {
      booking.finalAmount = calculatedFinalAmount;
    }

    booking.bikeModel = bikeModel || booking.bikeModel;
    booking.date = date || booking.date;
    booking.notes = notes !== undefined ? notes : booking.notes;

    await booking.save();
    res.json({ success: true, data: booking, message: "Booking updated successfully" });
  } catch (error) {
    console.error("Error updating booking:", error);
    res.status(500).json({ success: false, message: "Server error while updating booking." });
  }
};

/**
 * Deletes (cancels) an unpaid booking.
 */
const deleteUserBooking = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) { res.status(404).json({ success: false, message: "Booking not found" }); return; }
    if (booking.customer.toString() !== req.user.id) { res.status(401).json({ success: false, message: "User not authorized" }); return; }
    if (booking.isPaid) { res.status(400).json({ success: false, message: "Cannot cancel a booking that has been paid for." }); return; }

    if (booking.discountApplied) {
      const user = await User.findById(req.user.id);
      if (user) {
        user.loyaltyPoints += 100;
        await user.save();
      }
    }

    await booking.deleteOne();
    res.json({ success: true, message: "Booking cancelled successfully. Any used loyalty points have been refunded." });
  } catch (error) {
    console.error("Error deleting booking:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

/**
 * Confirms COD payment for a booking.
 */
const confirmPayment = async (req: AuthRequest, res: Response): Promise<void> => {
  const { paymentMethod } = req.body;
  if (paymentMethod !== "COD") {
    res.status(400).json({ success: false, message: "This route is only for COD payments." });
    return;
  }

  try {
    const booking = (await Booking.findById(req.params.id).populate("customer", "fullName email")) as
      | (IBooking & { customer: IUser })
      | null;

    if (!booking) { res.status(404).json({ success: false, message: "Booking not found." }); return; }
    if ((booking.customer as IUser)._id.toString() !== req.user.id) { res.status(403).json({ success: false, message: "Not authorized." }); return; }
    if (booking.isPaid) { res.status(400).json({ success: false, message: "Booking is already paid." }); return; }

    const points = await awardLoyaltyPoints(req.user.id);

    booking.paymentMethod = "COD";
    booking.paymentStatus = "Paid";
    booking.isPaid = true;
    booking.pointsAwarded = points;
    await booking.save();

    res.status(200).json({ success: true, data: booking, message: `Payment confirmed! You've earned ${points} loyalty points.` });

    // Send confirmation email (non-blocking)
    try {
      const customer = booking.customer as IUser;
      const emailHtml = `
                <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                    <div style="text-align: center; padding: 20px; background-color: #f8f8f8;">
                        <img src="${SUCCESS_ICON_URL}" alt="Success Icon" style="width: 80px;"/>
                        <h2 style="color: #2c3e50;">Booking Confirmed!</h2>
                    </div>
                    <div style="padding: 20px;">
                        <p>Dear ${customer.fullName},</p>
                        <p>Your booking <strong>#${booking._id}</strong> for <strong>${booking.serviceType}</strong> on <strong>${new Date(booking.date).toLocaleDateString()}</strong> has been confirmed.</p>
                        <p>You have earned <strong>${points} loyalty points</strong> for this booking!</p>
                        <p>Please pay <strong>Rs. ${booking.finalAmount}</strong> upon service completion.</p>
                        <p>Payment Method: <strong>Cash on Delivery (COD)</strong></p>
                        <p>Thank you for choosing MotoFix!</p>
                    </div>
                    <hr/>
                    <p style="font-size: 0.8em; color: #777; text-align: center;">This is an automated email. Please do not reply.</p>
                </div>
            `;
      await sendEmail(customer.email, "Your MotoFix Booking is Confirmed!", emailHtml);
    } catch (emailError) {
      console.error("Error sending COD confirmation email:", emailError);
    }
  } catch (error) {
    console.error(error);
    if (!res.headersSent) {
      res.status(500).json({ success: false, message: "Server Error" });
    }
  }
};

/**
 * Verifies a Khalti payment.
 */
const verifyKhaltiPayment = async (req: AuthRequest, res: Response): Promise<void> => {
  const { token, amount, booking_id } = req.body;
  if (!token || !amount || !booking_id) {
    res.status(400).json({ success: false, message: "Missing payment verification details." });
    return;
  }

  try {
    const khaltiResponse = await axios.post(
      "https://khalti.com/api/v2/payment/verify/",
      { token, amount },
      { headers: { Authorization: `Key ${process.env.KHALTI_SECRET_KEY}` } }
    );

    if (khaltiResponse.data && khaltiResponse.data.idx) {
      const booking = (await Booking.findById(booking_id).populate("customer", "fullName email")) as
        | (IBooking & { customer: IUser })
        | null;

      if (!booking) { res.status(404).json({ success: false, message: "Booking not found after payment." }); return; }
      if (booking.isPaid) { res.status(400).json({ success: false, message: "Booking is already paid." }); return; }

      const points = await awardLoyaltyPoints(req.user.id);

      booking.paymentMethod = "Khalti";
      booking.paymentStatus = "Paid";
      booking.isPaid = true;
      booking.pointsAwarded = points;
      await booking.save();

      res.status(200).json({ success: true, message: `Payment successful! You've earned ${points} loyalty points.` });

      // Send email (non-blocking)
      try {
        const customer = booking.customer as IUser;
        const emailHtml = `
                    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                        <div style="text-align: center; padding: 20px; background-color: #f8f8f8;">
                            <img src="${SUCCESS_ICON_URL}" alt="Success Icon" style="width: 80px;"/>
                            <h2 style="color: #2c3e50;">Payment Successful!</h2>
                        </div>
                        <div style="padding: 20px;">
                            <p>Dear ${customer.fullName},</p>
                            <p>Your payment for booking <strong>#${booking._id}</strong> has been successfully processed via Khalti.</p>
                            <p>You have earned <strong>${points} loyalty points</strong> for this booking!</p>
                            <p>Your appointment for <strong>${booking.serviceType}</strong> on <strong>${new Date(booking.date).toLocaleDateString()}</strong> is confirmed.</p>
                            <p>Total Amount Paid: <strong>Rs. ${booking.finalAmount}</strong></p>
                            <p>Thank you for choosing MotoFix!</p>
                        </div>
                        <hr/>
                        <p style="font-size: 0.8em; color: #777; text-align: center;">This is an automated email. Please do not reply.</p>
                    </div>
                `;
        await sendEmail(customer.email, "Your MotoFix Booking is Confirmed!", emailHtml);
      } catch (emailError) {
        console.error("Error sending Khalti success email:", emailError);
      }
    } else {
      res.status(400).json({ success: false, message: "Khalti payment verification failed." });
    }
  } catch (error: any) {
    console.error("Khalti verification error:", error.response ? error.response.data : error.message);
    if (!res.headersSent) {
      res.status(500).json({ success: false, message: "Server error during Khalti verification." });
    }
  }
};

/**
 * Applies a 20% loyalty discount to a booking.
 */
const applyLoyaltyDiscount = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const booking = await Booking.findById(req.params.id);
    const user = await User.findById(req.user.id);

    if (!booking) { res.status(404).json({ success: false, message: "Booking not found." }); return; }
    if (booking.customer.toString() !== req.user.id) { res.status(403).json({ success: false, message: "Not authorized." }); return; }
    if (booking.isPaid) { res.status(400).json({ success: false, message: "Cannot apply discount to a paid booking." }); return; }
    if (booking.discountApplied) { res.status(400).json({ success: false, message: "Discount has already been applied." }); return; }

    if (!user || user.loyaltyPoints < 100) {
      res.status(400).json({ success: false, message: "Not enough loyalty points. You need at least 100." });
      return;
    }

    const discountValue = (booking.totalCost + booking.pickupDropoffCost) * 0.2;
    booking.finalAmount = booking.totalCost + booking.pickupDropoffCost - discountValue;
    booking.discountApplied = true;
    booking.discountAmount = discountValue;

    user.loyaltyPoints -= 100;

    await booking.save();
    await user.save();

    res.status(200).json({
      success: true,
      message: `20% discount applied! Your new total is ${booking.finalAmount}.`,
      data: { booking, loyaltyPoints: user.loyaltyPoints },
    });
  } catch (error) {
    console.error("Error applying discount:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

export {
  getUserBookings,
  createBooking,
  updateUserBooking,
  deleteUserBooking,
  confirmPayment,
  verifyKhaltiPayment,
  applyLoyaltyDiscount,
  getUserBookingById,
  getPendingBookings,
  getBookingHistory,
};
