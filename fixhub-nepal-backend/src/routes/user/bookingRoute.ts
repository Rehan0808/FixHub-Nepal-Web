import { Router } from "express";
import {
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
} from "../../controllers/user/bookingController";
import { authenticateUser } from "../../middlewares/authorizedUser";

const router = Router();

router
  .route("/bookings")
  .get(authenticateUser as any, getUserBookings as any)
  .post(authenticateUser as any, createBooking as any);

router.route("/bookings/pending").get(authenticateUser as any, getPendingBookings as any);
router.route("/bookings/history").get(authenticateUser as any, getBookingHistory as any);

router
  .route("/bookings/:id")
  .get(authenticateUser as any, getUserBookingById as any)
  .put(authenticateUser as any, updateUserBooking as any)
  .delete(authenticateUser as any, deleteUserBooking as any);

router.route("/bookings/:id/pay").put(authenticateUser as any, confirmPayment as any);

router.route("/bookings/:id/apply-discount").put(authenticateUser as any, applyLoyaltyDiscount as any);

router.route("/bookings/verify-khalti").post(authenticateUser as any, verifyKhaltiPayment as any);

export default router;
