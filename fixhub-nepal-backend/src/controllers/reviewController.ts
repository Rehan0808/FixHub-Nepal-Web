import { Response } from "express";
import Booking from "../models/Booking";
import Service from "../models/Service";
import { AuthRequest, IBooking, IService, IUser } from "../types";

/**
 * Creates a review for a service based on a completed booking.
 */
const createServiceReview = async (req: AuthRequest, res: Response): Promise<void> => {
  const { rating, comment } = req.body;
  const { bookingId } = req.params;

  try {
    const booking = (await Booking.findById(bookingId)
      .populate("customer")
      .populate("service")) as IBooking & { customer: IUser; service: IService } | null;

    if (!booking) {
      res.status(404).json({ message: "Booking not found." });
      return;
    }

    if (!booking.service) {
      res.status(404).json({ message: "The service for this booking was not found and cannot be reviewed." });
      return;
    }

    if ((booking.customer as IUser)?._id.toString() !== req.user.id) {
      res.status(403).json({ message: "You are not authorized to review this booking." });
      return;
    }

    if (booking.status !== "Completed") {
      res.status(400).json({ message: "You can only review completed services." });
      return;
    }

    if (booking.reviewSubmitted) {
      res.status(400).json({ message: "You have already submitted a review for this service." });
      return;
    }

    const service = booking.service as IService;

    const review = {
      user: req.user._id,
      username: (booking.customer as IUser)?.fullName || "Anonymous",
      rating: Number(rating),
      comment,
    };

    service.reviews.push(review as any);
    service.numReviews = service.reviews.length;
    service.rating = service.reviews.reduce((acc, item) => item.rating + acc, 0) / service.reviews.length;

    booking.reviewSubmitted = true;

    await (service as any).save();
    await (booking as any).save();

    res.status(201).json({ message: "Review added successfully!" });
  } catch (error: any) {
    console.error("Error creating service review:", error.message, error.stack);
    res.status(500).json({ message: "Server Error" });
  }
};

export { createServiceReview };
