import express from 'express';
import cors from 'cors';
import dashboardRoutes from './routes/dashboardRoutes';
import { errorHandler } from './middlewares/errorHandler';

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api', dashboardRoutes);

// Error handling middleware (must be last)
app.use(errorHandler);

export default app;