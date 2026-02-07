import { Request, Response } from "express";
import fs from "fs";
import Service from "../../models/Service";

/**
 * Gets all services with pagination.
 */
export const getServices = async (req: Request, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 6;
    const skip = (page - 1) * limit;
    const query = {};
    const totalItems = await Service.countDocuments(query);
    const services = await Service.find(query).sort({ createdAt: -1 }).limit(limit).skip(skip);

    res.status(200).json({
      success: true,
      data: services,
      totalPages: Math.ceil(totalItems / limit),
      currentPage: page,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: "Server error.", error: error.message });
  }
};

/**
 * Creates a new service.
 */
export const createService = async (req: Request, res: Response): Promise<void> => {
  const { name, description, price, duration } = req.body;

  if (!req.file) {
    res.status(400).json({ success: false, message: "Service image is required." });
    return;
  }
  if (!name || !price) {
    fs.unlinkSync(req.file.path);
    res.status(400).json({ success: false, message: "Name and price are required." });
    return;
  }

  try {
    const newService = new Service({
      name,
      description,
      price,
      duration,
      image: req.file.path,
    });
    await newService.save();
    res.status(201).json({ success: true, message: "Service created successfully.", data: newService });
  } catch (error: any) {
    if (req.file) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({ success: false, message: "Failed to create service", error: error.message });
  }
};

/**
 * Updates an existing service.
 */
export const updateService = async (req: Request, res: Response): Promise<void> => {
  try {
    const service = await Service.findById(req.params.id);
    if (!service) {
      if (req.file) fs.unlinkSync(req.file.path);
      res.status(404).json({ success: false, message: "Service not found." });
      return;
    }

    const { name, description, price, duration } = req.body;
    const updateData: any = { name, description, price, duration };

    if (req.file) {
      if (service.image && fs.existsSync(service.image)) {
        fs.unlinkSync(service.image);
      }
      updateData.image = req.file.path;
    }

    const updatedService = await Service.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    });
    res.status(200).json({ success: true, message: "Service updated successfully.", data: updatedService });
  } catch (error: any) {
    if (req.file) fs.unlinkSync(req.file.path);
    res.status(500).json({ success: false, message: "Server error.", error: error.message });
  }
};

/**
 * Deletes a service and its image.
 */
export const deleteService = async (req: Request, res: Response): Promise<void> => {
  try {
    const service = await Service.findById(req.params.id);
    if (!service) {
      res.status(404).json({ success: false, message: "Service not found." });
      return;
    }

    if (service.image && fs.existsSync(service.image)) {
      fs.unlinkSync(service.image);
    }

    await Service.findByIdAndDelete(req.params.id);

    res.status(200).json({ success: true, message: "Service deleted successfully." });
  } catch (error: any) {
    res.status(500).json({ success: false, message: "Server error.", error: error.message });
  }
};

/**
 * Gets a single service with populated reviews.
 */
export const getServiceWithReviews = async (req: Request, res: Response): Promise<void> => {
  try {
    const service = await Service.findById(req.params.id).populate({
      path: "reviews.user",
      select: "fullName profilePicture",
    });

    if (!service) {
      res.status(404).json({ success: false, message: "Service not found" });
      return;
    }

    res.status(200).json({ success: true, data: service });
  } catch (error) {
    console.error("Error fetching service with reviews for admin:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};
