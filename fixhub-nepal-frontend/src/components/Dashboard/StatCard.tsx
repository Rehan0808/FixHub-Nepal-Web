import React from 'react';

interface StatCardProps {
    title: string;
    value: number | string;
    icon: React.ReactNode;
    color: string;
    subtitle?: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, color, subtitle }) => {
    return (
        <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
                <div className="flex-1">
                    <p className="text-gray-600 text-sm font-medium">{title}</p>
                    <h3 className="text-3xl font-bold mt-2" style={{ color }}>
                        {value}
                    </h3>
                    {subtitle && <p className="text-gray-500 text-xs mt-1">{subtitle}</p>}
                </div>
                <div className={`p-4 rounded-full bg-opacity-10`} style={{ backgroundColor: color }}>
                    <div style={{ color }}>{icon}</div>
                </div>
            </div>
        </div>
    );
};

export default StatCard;
