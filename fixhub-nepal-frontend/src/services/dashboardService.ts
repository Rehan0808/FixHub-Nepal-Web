import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export interface DashboardStats {
    totalBookings: number;
    totalRevenue: number;
    activeServices: number;
    totalUsers: number;
    recentBookings: any[];
    bookingStatusBreakdown: {
        pending: number;
        confirmed: number;
        completed: number;
        cancelled: number;
    };
    monthlyRevenue: {
        month: string;
        revenue: number;
    }[];
}

export const dashboardService = {
    getDashboardStats: async (): Promise<DashboardStats> => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_URL}/dashboard`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            return response.data.data;
        } catch (error: any) {
            throw new Error(error.response?.data?.error?.message || 'Failed to fetch dashboard data');
        }
    }
};
