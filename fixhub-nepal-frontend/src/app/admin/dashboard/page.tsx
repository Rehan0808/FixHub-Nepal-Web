"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import Card from "@/components/ui/Card";
import { AdminDashboardData } from "@/types";
import { 
  Users, Calendar, DollarSign, Wrench, 
  TrendingUp, PieChart as PieIcon, BarChart2,
  ArrowUpRight, LayoutDashboard, Activity
} from "lucide-react";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, PieChart, Pie, 
  Cell, Legend, AreaChart, Area 
} from "recharts";

const COLORS = ["#2563eb", "#10b981", "#f59e0b", "#ef4444", "#6366f1"];

const StatCard = ({ icon: Icon, title, value, color, bg }: { icon: any, title: string, value: string | number, color: string, bg: string }) => (
  <div className="group relative p-6 bg-white border border-slate-100 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300">
    <div className={`absolute top-6 right-6 p-2 rounded-lg ${bg} ${color} group-hover:scale-110 transition-transform`}>
      <Icon size={24} />
    </div>
    <p className="text-sm font-semibold text-slate-500 uppercase tracking-wide">{title}</p>
    <p className="text-3xl font-bold text-slate-900 mt-1">{value}</p>
    <div className="mt-4 flex items-center text-xs font-medium text-emerald-600 bg-emerald-50 w-fit px-2 py-1 rounded-full">
      <ArrowUpRight size={12} className="mr-1" />
      <span>System Active</span>
    </div>
  </div>
);

export default function AdminDashboard() {
  const [data, setData] = useState<AdminDashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await api.get("/admin/dashboard-summary");
        setData(res.data.data || res.data);
      } catch {
        console.error("Failed to fetch dashboard");
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="text-slate-500 animate-pulse font-medium">Aggregating business data...</p>
      </div>
    );
  }

  const statusData = data?.bookingsByStatus
    ? Object.entries(data.bookingsByStatus).map(([name, value]) => ({ 
        name: name.charAt(0).toUpperCase() + name.slice(1), 
        value 
      }))
    : [];

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-900 text-white p-3 rounded-xl shadow-xl border border-slate-800 text-sm">
          <p className="font-bold mb-1">{label}</p>
          <p className="text-blue-400">{`Volume: ${payload[0].value}`}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="max-w-7xl mx-auto space-y-10 pb-10 animate-in fade-in duration-700">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-primary font-bold uppercase tracking-wider text-xs mb-2">
            <LayoutDashboard size={14} />
            Executive Overview
          </div>
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">
            System <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-500">Analytics</span>
          </h1>
          <p className="text-slate-500 mt-2 text-lg">Real-time performance metrics and booking distributions.</p>
        </div>
        <div className="flex items-center gap-3 bg-white p-2 rounded-2xl border border-slate-100 shadow-sm">
            <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-sm font-bold text-slate-700">Live Server Status</span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard icon={Users} title="Total Customers" value={data?.totalUsers || 0} color="text-blue-600" bg="bg-blue-50" />
        <StatCard icon={Calendar} title="Total Bookings" value={data?.totalBookings || 0} color="text-emerald-600" bg="bg-emerald-50" />
        <StatCard icon={DollarSign} title="Total Revenue" value={`Rs. ${data?.totalRevenue?.toLocaleString() || 0}`} color="text-amber-600" bg="bg-amber-50" />
        <StatCard icon={Wrench} title="Active Services" value={data?.totalServices || 0} color="text-indigo-600" bg="bg-indigo-50" />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
        {statusData.length > 0 ? (
          <>
            {/* Bar Chart */}
            <Card className="xl:col-span-3 p-6 border-slate-100 shadow-sm">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h3 className="font-bold text-xl text-slate-900">Booking Volume</h3>
                  <p className="text-sm text-slate-500">Distribution by current status</p>
                </div>
                <div className="p-2 bg-slate-50 rounded-lg">
                  <BarChart2 className="h-5 w-5 text-primary" />
                </div>
              </div>
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={statusData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#2563eb" stopOpacity={1} />
                      <stop offset="100%" stopColor="#6366f1" stopOpacity={0.8} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#64748b', fontSize: 12, fontWeight: 500 }} 
                    dy={10}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#64748b', fontSize: 12 }} 
                  />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f8fafc' }} />
                  <Bar 
                    dataKey="value" 
                    fill="url(#barGradient)" 
                    radius={[6, 6, 0, 0]} 
                    barSize={45} 
                  />
                </BarChart>
              </ResponsiveContainer>
            </Card>

            {/* Pie Chart */}
            <Card className="xl:col-span-2 p-6 border-slate-100 shadow-sm">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h3 className="font-bold text-xl text-slate-900">Status Mix</h3>
                  <p className="text-sm text-slate-500">Overall percentage share</p>
                </div>
                <div className="p-2 bg-slate-50 rounded-lg">
                  <PieIcon className="h-5 w-5 text-indigo-500" />
                </div>
              </div>
              <ResponsiveContainer width="100%" height={350}>
                <PieChart>
                  <Pie 
                    data={statusData} 
                    cx="50%" 
                    cy="45%" 
                    innerRadius={80} 
                    outerRadius={110} 
                    dataKey="value" 
                    paddingAngle={8}
                  >
                    {statusData.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={COLORS[index % COLORS.length]} 
                        strokeWidth={0}
                      />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend 
                    verticalAlign="bottom" 
                    height={36} 
                    iconType="circle"
                    formatter={(value: string) => <span className="text-slate-600 font-medium text-sm">{value}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>
            </Card>
          </>
        ) : (
          <Card className="xl:col-span-5 py-20 flex flex-col items-center justify-center border-dashed border-2">
             <Activity className="h-12 w-12 text-slate-200 mb-4" />
             <p className="text-slate-500 font-medium">No booking data available for visualization.</p>
          </Card>
        )}
      </div>
    </div>
  );
}