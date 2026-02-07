"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import { Booking } from "@/types";
import { 
  Calendar, Eye, X, Wrench, Car, Hash, Clock, 
  Info, CircleDollarSign, CalendarDays, MoreVertical 
} from "lucide-react";
import { format } from "date-fns";
import toast from "react-hot-toast";
import Link from "next/link";

export default function UserBookings() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const res = await api.get("/user/bookings");
      setBookings(res.data.data || res.data.bookings || []);
    } catch {
      toast.error("Failed to load bookings");
    } finally {
      setLoading(false);
    }
  };

  const cancelBooking = async (id: string) => {
    if (!window.confirm("Are you sure you want to cancel this booking?")) return;
    
    try {
      await api.put(`/user/bookings/${id}`, { status: "Cancelled" });
      toast.success("Booking cancelled");
      fetchBookings();
      if (selectedBooking?._id === id) setSelectedBooking(null);
    } catch {
      toast.error("Failed to cancel booking");
    }
  };

  const handlePayNow = async (bookingId: string) => {
    try {
      const res = await api.post("/payment/esewa/initiate", { bookingId });
      const { ESEWA_URL, ...paymentData } = res.data;

      // Create a form and submit to eSewa
      const form = document.createElement("form");
      form.method = "POST";
      form.action = ESEWA_URL;

      Object.entries(paymentData).forEach(([key, value]) => {
        const input = document.createElement("input");
        input.type = "hidden";
        input.name = key;
        input.value = String(value);
        form.appendChild(input);
      });

      document.body.appendChild(form);
      form.submit();
    } catch (error) {
      toast.error("Failed to initiate payment");
      console.error(error);
    }
  };

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
      <div className="flex flex-col items-center justify-center h-[60vh] gap-3">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="text-slate-400 font-medium animate-pulse">Loading appointments...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-12">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Service History</h1>
          <p className="text-slate-500 mt-1">Track upcoming appointments and past services.</p>
        </div>
        <Link href="/user/services">
           <Button className="bg-slate-900 text-white hover:bg-slate-800 shadow-lg shadow-slate-200">
             + Book New Service
           </Button>
        </Link>
      </div>

      {bookings.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {bookings.map((booking) => (
            <div 
              key={booking._id} 
              className="group flex flex-col bg-white border border-slate-200 rounded-2xl overflow-hidden hover:shadow-xl hover:border-primary/30 transition-all duration-300"
            >
              {/* Card Header */}
              <div className="bg-slate-50/50 p-5 border-b border-slate-100 flex justify-between items-start">
                <div className="flex items-start gap-3">
                  <div className="bg-white p-2.5 rounded-xl border border-slate-100 shadow-sm text-primary">
                    <Car size={20} />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 leading-tight">{booking.bikeModel}</h3>
                    <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-1">
                      <Wrench size={12} /> {booking.serviceType}
                    </div>
                  </div>
                </div>
                <Badge variant={statusVariant(booking.status)}>
                  {booking.status}
                </Badge>
              </div>

              {/* Card Body */}
              <div className="p-5 flex-grow space-y-4">
                <div className="flex items-center gap-3 text-slate-600">
                  <CalendarDays className="h-5 w-5 text-slate-400" />
                  <div>
                    <p className="text-xs text-slate-400 uppercase font-bold tracking-wider">Date & Time</p>
                    <p className="font-medium">{format(new Date(booking.date), "EEEE, MMM dd, yyyy 'at' HH:mm")}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 text-slate-600">
                  <CircleDollarSign className="h-5 w-5 text-slate-400" />
                  <div>
                    <p className="text-xs text-slate-400 uppercase font-bold tracking-wider">Amount</p>
                    <p className="font-medium">Rs. {booking.finalAmount}</p>
                  </div>
                </div>
              </div>

              {/* Card Footer / Actions */}
              <div className="p-4 bg-slate-50 border-t border-slate-100 flex gap-3">
                <Button 
                  variant="outline" 
                  onClick={() => setSelectedBooking(booking)} 
                  className="flex-1 border-slate-200 hover:bg-white hover:text-primary"
                >
                  View Details
                </Button>
                
                {booking.status === "Pending" && (
                  <button 
                    onClick={() => cancelBooking(booking._id)}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    title="Cancel Booking"
                  >
                    <X size={20} />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-24 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200 text-center">
          <div className="bg-white p-4 rounded-full shadow-sm mb-4">
            <Wrench className="h-10 w-10 text-slate-300" />
          </div>
          <h3 className="text-xl font-bold text-slate-800">No Service History</h3>
          <p className="text-slate-500 mt-2 mb-6 max-w-sm">
            You haven&apos;t booked any services yet. Keep your vehicle in top shape by scheduling a checkup.
          </p>
          <Link href="/user/services">
            <Button size="lg" className="bg-primary hover:bg-blue-700 text-white shadow-lg shadow-blue-200">
              Book Your First Service
            </Button>
          </Link>
        </div>
      )}

      {/* Modern Modal / Service Ticket Detail */}
      {selectedBooking && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div 
            className="bg-white max-w-lg w-full rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 flex flex-col max-h-[90vh]"
            role="dialog"
          >
            {/* Modal Header */}
            <div className="bg-slate-50 p-6 border-b border-slate-100 flex items-start justify-between">
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Service Order</p>
                <h2 className="text-2xl font-bold text-slate-900">{selectedBooking.bikeModel}</h2>
                <p className="text-slate-500 text-sm mt-1">{selectedBooking.serviceType}</p>
              </div>
              <button 
                onClick={() => setSelectedBooking(null)} 
                className="text-slate-400 hover:text-slate-700 hover:bg-slate-200 p-2 rounded-full transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Content - Scrollable */}
            <div className="p-6 overflow-y-auto space-y-6">
              
              {/* Status Section */}
              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-sm font-medium text-slate-600 flex items-center gap-2">
                  <Info className="h-4 w-4" /> Current Status
                </span>
                <Badge variant={statusVariant(selectedBooking.status)}>
                  {selectedBooking.status}
                </Badge>
              </div>

              {/* Details Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-xs text-slate-400 uppercase font-semibold">Service Date & Time</p>
                  <div className="flex items-center gap-2 font-medium text-slate-800">
                    <Calendar className="h-4 w-4 text-primary" />
                    {format(new Date(selectedBooking.date), "MMM dd, yyyy 'at' HH:mm")}
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-slate-400 uppercase font-semibold">Payment Status</p>
                  <div className="flex items-center gap-2 font-medium text-slate-800">
                    <Badge variant={selectedBooking.isPaid ? "success" : "warning"}>
                      {selectedBooking.paymentStatus}
                    </Badge>
                    {!selectedBooking.isPaid && selectedBooking.status !== "Cancelled" && (
                      <button
                        onClick={() => handlePayNow(selectedBooking._id)}
                        className="px-3 py-1 bg-blue-600 text-white text-xs font-semibold rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
                      >
                        Pay Now
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Description Box */}
              {selectedBooking.notes && (
                <div className="space-y-2">
                   <p className="text-xs text-slate-400 uppercase font-semibold">Reported Issue</p>
                   <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 text-sm text-slate-600 leading-relaxed">
                     {selectedBooking.notes}
                   </div>
                </div>
              )}

              {/* Pricing Section (Bottom) */}
              <div className="pt-6 border-t border-dashed border-slate-200">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-medium">Total Cost</span>
                  <span className="text-2xl font-bold text-slate-900 flex items-center">
                     <CircleDollarSign className="h-5 w-5 mr-1 text-emerald-500" />
                     Rs. {selectedBooking.finalAmount.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
              {selectedBooking.status === "Pending" && (
                <Button 
                   variant="danger" 
                   onClick={() => cancelBooking(selectedBooking._id)}
                   className="bg-white border border-red-200 text-red-600 hover:bg-red-50 shadow-sm"
                >
                  Cancel Booking
                </Button>
              )}
              <Button onClick={() => setSelectedBooking(null)}>
                Close Details
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}