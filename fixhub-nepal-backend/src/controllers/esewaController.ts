import { Request, Response } from "express";
import crypto from "crypto";
// @ts-ignore -- node-fetch v2 has no bundled types
import fetch from "node-fetch";
import { v4 as uuidv4 } from "uuid";
import Booking from "../models/Booking";
import User from "../models/User";
import sendEmail from "../utils/sendEmail";
import { IBooking, IUser } from "../types";

const SUCCESS_ICON_URL =
  "https://cdn.vectorstock.com/i/500p/20/36/3d-green-check-icon-tick-mark-symbol-vector-56142036.jpg";

const ESEWA_URL = "https://rc-epay.esewa.com.np/api/epay/main/v2/form";
const ESEWA_SCD = "EPAYTEST";
const ESEWA_SECRET = "8gBm/:&EnhH.1/q";

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
 * Initiates an eSewa payment for a booking.
 */
export const initiateEsewaPayment = async (req: Request, res: Response): Promise<void> => {
  try {
    const { bookingId } = req.body;
    const booking = await Booking.findById(bookingId);

    if (!booking) {
      res.status(404).json({ message: "Booking not found" });
      return;
    }
    if (booking.finalAmount == null) {
      res.status(400).json({ message: "Booking does not have a final amount to pay." });
      return;
    }

    // Generate unique transaction UUID (bookingId-timestamp-random)
    const uniqueTransactionId = `${bookingId}-${Date.now()}-${uuidv4().slice(0, 8)}`;

    const amountToPay = booking.finalAmount.toString();
    const signedFieldNames = "total_amount,transaction_uuid,product_code";
    const signatureBaseString = `total_amount=${amountToPay},transaction_uuid=${uniqueTransactionId},product_code=${ESEWA_SCD}`;

    const hmac = crypto.createHmac("sha256", ESEWA_SECRET);
    hmac.update(signatureBaseString);
    const signature = hmac.digest("base64");

    const esewaData = {
      amount: amountToPay,
      success_url: `http://localhost:3000/payment/esewa/success`,
      failure_url: "http://localhost:3000/payment/esewa/failure",
      product_delivery_charge: "0",
      product_service_charge: "0",
      product_code: ESEWA_SCD,
      signature,
      signed_field_names: signedFieldNames,
      tax_amount: "0",
      total_amount: amountToPay,
      transaction_uuid: uniqueTransactionId,
    };

    res.json({ ...esewaData, ESEWA_URL });
  } catch (error) {
    console.error("Error in initiateEsewaPayment:", error);
    res.status(500).json({ message: "Server Error while initiating payment" });
  }
};

/**
 * Verifies an eSewa payment callback.
 */
export const verifyEsewaPayment = async (req: Request, res: Response): Promise<void> => {
  try {
    const { data } = req.query;
    if (!data) {
      res.status(400).json({ success: false, message: "No data provided for verification" });
      return;
    }

    const decodedData = JSON.parse(Buffer.from(data as string, "base64").toString("utf-8"));

    if (decodedData.status !== "COMPLETE") {
      res.status(400).json({ success: false, message: `Payment not complete. Status: ${decodedData.status}` });
      return;
    }

    const verificationUrl = `https://rc-epay.esewa.com.np/api/epay/transaction/status/?product_code=${decodedData.product_code}&total_amount=${decodedData.total_amount}&transaction_uuid=${decodedData.transaction_uuid}`;

    const response = await fetch(verificationUrl);
    const verificationResponse = (await response.json()) as any;

    if (verificationResponse.status === "COMPLETE") {
      // Extract booking ID from transaction UUID (format: bookingId-timestamp-random)
      const bookingId = decodedData.transaction_uuid.split('-')[0];
      
      const booking = (await Booking.findById(bookingId).populate(
        "customer",
        "fullName email"
      )) as (IBooking & { customer: IUser }) | null;

      if (!booking) {
        res.status(404).json({ success: false, message: "Booking not found after payment." });
        return;
      }
      if (booking.isPaid) {
        res.status(200).json({ success: true, message: "Payment was already verified." });
        return;
      }

      const points = await awardLoyaltyPoints((booking.customer as IUser)._id.toString());

      booking.paymentStatus = "Paid";
      booking.paymentMethod = "eSewa";
      booking.isPaid = true;
      booking.pointsAwarded = points;
      await booking.save();

      res.status(200).json({ success: true, message: `Payment successful! You earned ${points} loyalty points.` });

      // Send confirmation email (non-blocking)
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
                            <p>Your payment for booking <strong>#${booking._id}</strong> has been successfully processed via eSewa.</p>
                            <p>Your appointment for <strong>${booking.serviceType}</strong> on <strong>${new Date(booking.date).toLocaleDateString()}</strong> is confirmed.</p>
                            <p>You have earned <strong>${points} loyalty points</strong> for this booking!</p>
                            <p>Total Amount Paid: <strong>Rs. ${booking.finalAmount}</strong></p>
                            <p>Thank you for choosing MotoFix!</p>
                        </div>
                        <hr/>
                        <p style="font-size: 0.8em; color: #777; text-align: center;">This is an automated email. Please do not reply.</p>
                    </div>
                `;
        await sendEmail(customer.email, "Your MotoFix Booking is Confirmed!", emailHtml);
      } catch (emailError) {
        console.error("Error sending eSewa success email:", emailError);
      }
    } else {
      res.status(400).json({ success: false, message: "eSewa payment verification failed" });
    }
  } catch (error) {
    console.error("Error in verifyEsewaPayment:", error);
    if (!res.headersSent) {
      res.status(500).json({ success: false, message: "Server error during verification." });
    }
  }
};
