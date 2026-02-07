import { Request, Response } from "express";
import Service from "../../models/Service";

/**
 * Gets all available services.
 */
const getAvailableServices = async (_req: Request, res: Response): Promise<void> => {
  try {
    const services = await Service.find({}).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: services,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: "Server error.", error: error.message });
  }
};

/**
 * Gets a single service by ID with populated reviews.
 */
const getServiceById = async (req: Request, res: Response): Promise<void> => {
  try {
    const service = await Service.findById(req.params.id).populate({
      path: "reviews.user",
      select: "profilePicture",
    });

    if (!service) {
      res.status(404).json({ success: false, message: "Service not found." });
      return;
    }

    res.status(200).json({
      success: true,
      data: service,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: "Server error.", error: error.message });
  }
};

export { getAvailableServices, getServiceById };
