import { Router } from "express";
import {
  getAllBookings,
  getBookingById,
  deleteBooking,
  updateBooking,
  generateBookingInvoice,
} from "../../controllers/admin/bookingController";
import { authenticateUser } from "../../middlewares/authorizedUser";

const router = Router();

router.use(authenticateUser as any);

router.route("/").get(getAllBookings);

router.route("/:id/invoice").get(generateBookingInvoice);

router.route("/:id").get(getBookingById).put(updateBooking).delete(deleteBooking);

export default router;
