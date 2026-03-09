import prisma from '../lib/prisma';

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

export class DashboardService {
    async getDashboardStats(userId?: string): Promise<DashboardStats> {
        try {
            const totalBookings = await prisma.booking.count();

            const revenueData = await prisma.booking.aggregate({
                where: { status: 'COMPLETED' },
                _sum: { totalPrice: true }
            });

            const activeServices = await prisma.service.count({
                where: { isActive: true }
            });

            const totalUsers = await prisma.user.count();

            const recentBookings = await prisma.booking.findMany({
                take: 10,
                orderBy: { createdAt: 'desc' },
                include: {
                    user: { select: { name: true, email: true } },
                    service: { select: { name: true } }
                }
            });

            const bookingsByStatus = await prisma.booking.groupBy({
                by: ['status'],
                _count: true
            });

            const bookingStatusBreakdown = {
                pending: 0,
                confirmed: 0,
                completed: 0,
                cancelled: 0
            };
            bookingsByStatus.forEach((item: { status: string; _count: number }) => {
                const statusKey = item.status.toLowerCase() as keyof typeof bookingStatusBreakdown;
                if (statusKey in bookingStatusBreakdown) {
                    bookingStatusBreakdown[statusKey] = item._count;
                }
            });

            // Monthly revenue (last 6 months)
            const sixMonthsAgo = new Date();
            sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

            const monthlyBookings = await prisma.booking.findMany({
                where: {
                    status: 'COMPLETED',
                    createdAt: { gte: sixMonthsAgo }
                },
                select: { totalPrice: true, createdAt: true }
            });

            const monthlyRevenueMap = new Map<string, number>();
            monthlyBookings.forEach((booking: { totalPrice: number | null; createdAt: Date }) => {
                const month = booking.createdAt.toISOString().slice(0, 7);
                const current = monthlyRevenueMap.get(month) || 0;
                monthlyRevenueMap.set(month, current + (booking.totalPrice || 0));
            });

            const monthlyRevenue = Array.from(monthlyRevenueMap.entries()).map(([month, revenue]) => ({
                month,
                revenue
            }));

            return {
                totalBookings,
                totalRevenue: revenueData._sum.totalPrice || 0,
                activeServices,
                totalUsers,
                recentBookings,
                bookingStatusBreakdown,
                monthlyRevenue
            };
        } catch (error) {
            console.error('Error fetching dashboard stats:', error);
            throw new Error('Failed to fetch dashboard statistics');
        }
    }
}