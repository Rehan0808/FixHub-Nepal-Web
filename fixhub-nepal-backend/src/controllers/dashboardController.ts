import { Request, Response, NextFunction } from 'express';
import { DashboardService } from '../services/dashboardService';
import { AppError } from '../middlewares/errorHandler';

const dashboardService = new DashboardService();

export class DashboardController {
    async getDashboard(req: Request, res: Response, next: NextFunction) {
        try {
            // Simulate the error from your requirement
            // Remove this after testing
            // return next(new Error("Dashboard error"));

            const userId = (req as any).user?.id; // From auth middleware
            
            const stats = await dashboardService.getDashboardStats(userId);

            res.status(200).json({
                success: true,
                data: stats
            });
        } catch (error) {
            next(new AppError((error as Error).message, 500));
        }
    }
}
