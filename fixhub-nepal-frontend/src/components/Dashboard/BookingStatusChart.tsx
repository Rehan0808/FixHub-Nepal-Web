import React from 'react';

interface BookingStatusChartProps {
    statusBreakdown: {
        pending: number;
        confirmed: number;
        completed: number;
        cancelled: number;
    };
}

const BookingStatusChart: React.FC<BookingStatusChartProps> = ({ statusBreakdown }) => {
    const total = Object.values(statusBreakdown).reduce((sum, val) => sum + val, 0);

    const statuses = [
        { name: 'Pending', count: statusBreakdown.pending, color: '#F59E0B' },
        { name: 'Confirmed', count: statusBreakdown.confirmed, color: '#3B82F6' },
        { name: 'Completed', count: statusBreakdown.completed, color: '#10B981' },
        { name: 'Cancelled', count: statusBreakdown.cancelled, color: '#EF4444' }
    ];

    return (
        <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-semibold mb-4">Booking Status Breakdown</h3>
            <div className="space-y-4">
                {statuses.map((status) => {
                    const percentage = total > 0 ? (status.count / total) * 100 : 0;
                    return (
                        <div key={status.name}>
                            <div className="flex justify-between mb-1">
                                <span className="text-sm font-medium text-gray-700">{status.name}</span>
                                <span className="text-sm font-medium text-gray-700">
                                    {status.count} ({percentage.toFixed(1)}%)
                                </span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2.5">
                                <div
                                    className="h-2.5 rounded-full"
                                    style={{
                                        width: `${percentage}%`,
                                        backgroundColor: status.color
                                    }}
                                ></div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default BookingStatusChart;
