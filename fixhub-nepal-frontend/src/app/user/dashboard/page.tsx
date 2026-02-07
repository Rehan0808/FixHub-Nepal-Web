"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/api";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import { DashboardData, Booking } from "@/types";
import { 
  Calendar, CheckCircle, Clock, Star, 
  ChevronRight, Car, Plus, LayoutDashboard 
} from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";

export default function UserDashboard() {
  const { user } = useAuth();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await api.get("/user/dashboard-summary");
        setData(res.data.data);
      } catch {
        console.error("Failed to fetch dashboard");
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  const statusVariant = (status: string) => {
    const map: Record<string, "success" | "warning" | "danger" | "info" | "default"> = {
      Completed: "success",
      "In Progress": "warning",
      Pending: "warning",
      Cancelled: "danger",
    };
    return map[status] || "default";
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="text-gray-500 animate-pulse font-medium">Loading your garage...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-10 pb-10 animate-in fade-in duration-700">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-primary font-bold uppercase tracking-wider text-xs mb-2">
            <LayoutDashboard size={14} />
            Overview
          </div>
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">
            Welcome, <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-500">
              {user?.fullName?.split(" ")[0]}
            </span>
          </h1>
          <p className="text-slate-500 mt-2 text-lg">Your vehicle's health at a glance.</p>
        </div>
        <Link 
          href="/user/services" 
          className="flex items-center justify-center gap-2 bg-slate-900 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-slate-200 hover:bg-slate-800 transition-all hover:-translate-y-1 active:scale-95"
        >
          <Plus size={18} />
          Book New Service
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {[
          { label: "Upcoming", val: data?.upcomingBookings, icon: Calendar, color: "text-blue-600", bg: "bg-blue-50" },
          { label: "Completed", val: data?.completedServices, icon: CheckCircle, color: "text-emerald-600", bg: "bg-emerald-50" },
          { label: "Total Bookings", val: data?.recentBookings?.length, icon: Clock, color: "text-amber-600", bg: "bg-amber-50" },
          { label: "Loyalty Points", val: data?.loyaltyPoints, icon: Star, color: "text-purple-600", bg: "bg-purple-50" },
        ].map((stat, i) => (
          <div key={i} className="group relative p-6 bg-white border border-slate-100 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300">
            <div className={`absolute top-6 right-6 p-2 rounded-lg ${stat.bg} ${stat.color} group-hover:scale-110 transition-transform`}>
              <stat.icon size={24} />
            </div>
            <p className="text-sm font-semibold text-slate-500 uppercase tracking-wide">{stat.label}</p>
            <p className="text-3xl font-bold text-slate-900 mt-1">{stat.val || 0}</p>
          </div>
        ))}
      </div>

      {/* Recent Bookings Section */}
      <section className="space-y-4">
        <div className="flex items-center justify-between px-2">
          <h2 className="text-2xl font-bold text-slate-800">Recent Activity</h2>
          <Link href="/user/bookings" className="group flex items-center gap-1 text-primary font-semibold hover:underline">
            View history <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {data?.recentBookings && data.recentBookings.length > 0 ? (
          <div className="grid grid-cols-1 gap-4">
            {data.recentBookings.slice(0, 5).map((booking: Booking) => (
              <div 
                key={booking._id} 
                className="flex flex-col md:flex-row md:items-center justify-between p-5 bg-white border border-slate-100 rounded-2xl hover:border-primary/20 hover:bg-slate-50/50 transition-all shadow-sm"
              >
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-600">
                    <Car size={24} />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-lg">{booking.bikeModel}</h4>
                    <p className="text-sm text-slate-600">{booking.serviceType}</p>
                    <div className="flex items-center gap-3 text-sm text-slate-500 mt-1">
                      <span className="flex items-center gap-1">
                        <Calendar size={14} /> {format(new Date(booking.date), "MMM dd, yyyy 'at' HH:mm")}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="mt-4 md:mt-0 flex items-center justify-between md:justify-end gap-6">
                  <Badge variant={statusVariant(booking.status)}>
                    {booking.status}
                  </Badge>
                  <Link href={`/user/bookings/${booking._id}`} className="p-2 hover:bg-white rounded-full transition-colors border border-transparent hover:border-slate-200 shadow-sm md:shadow-none">
                    <ChevronRight className="text-slate-400" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
            <div className="p-4 bg-white rounded-2xl shadow-sm mb-4">
               <Calendar className="h-10 w-10 text-slate-300" />
            </div>
            <h3 className="text-xl font-bold text-slate-800">Your garage is empty</h3>
            <p className="text-slate-500 mt-2 max-w-xs text-center">
              You haven't booked any services yet. Schedule your first maintenance to get started!
            </p>
            <Link href="/user/services" className="mt-6 text-primary font-bold hover:underline">
              Browse services →
            </Link>
          </div>
        )}
      </section>
    </div>
  );
}