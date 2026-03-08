import express from 'express';
import { DashboardController } from '../controllers/dashboardController';
import { authenticateUser } from '../middlewares/authorizedUser';
const router = express.Router();
const dashboardController = new DashboardController();

// Protect dashboard route with authentication
router.get('/dashboard', authenticateUser, dashboardController.getDashboard);

export default router;
