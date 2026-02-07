"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import { Booking } from "@/types";
import { Calendar, Eye, X, Check, Play, ShieldCheck, Search, User, Car, Hash, Clock, Info, CircleDollarSign } from "lucide-react";
import { format } from "date-fns";
import toast from "react-hot-toast";

export default function AdminBookings() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const res = await api.get("/admin/bookings");
      setBookings(res.data.data || res.data.bookings || []);
    } catch {
      toast.error("Failed to load bookings");
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id: string, status: string) => {
    try {
      await api.put(`/admin/bookings/${id}`, { status });
      toast.success(`Booking status updated to ${status}`);
      fetchBookings();
      if (selectedBooking) {
        setSelectedBooking({ ...selectedBooking, status: status as any });
      }
    } catch {
      toast.error("Failed to update booking status");
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

  const filtered = bookings
    .filter((b) => statusFilter === "all" || b.status.toLowerCase() === statusFilter.toLowerCase().replace("-", " "))
    .filter((b) => {
      const customer = typeof b.customer === "object" ? b.customer : null;
      const search = searchTerm.toLowerCase();
      return (
        (b.bikeModel && b.bikeModel.toLowerCase().includes(search)) ||
        (b.customerName && b.customerName.toLowerCase().includes(search)) ||
        (b.serviceType && b.serviceType.toLowerCase().includes(search)) ||
        (customer && customer.fullName && customer.fullName.toLowerCase().includes(search)) ||
        (customer && customer.email && customer.email.toLowerCase().includes(search))
      );
    });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in-up">
      <div>
        <h1 className="text-3xl font-bold text-dark">Manage Bookings</h1>
        <p className="text-gray mt-1 text-lg">Oversee and update all customer appointments.</p>
      </div>

      <Card>
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6">
          <div className="flex gap-2 flex-wrap">
            {["all", "pending", "in progress", "completed", "cancelled"].map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-4 py-2 text-sm font-medium rounded-full transition-all capitalize ${
                  statusFilter === s ? "bg-primary text-white shadow-md" : "bg-white text-gray border border-gray-border hover:bg-gray-light hover:border-primary"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
          <div className="relative w-full md:w-72">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray" />
            <input
              type="text"
              placeholder="Search bookings..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-2.5 border border-gray-border rounded-full text-base bg-white focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
            />
          </div>
        </div>

        {filtered.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-light">
                <tr>
                  <th className="p-4 font-semibold text-dark">Customer</th>
                  <th className="p-4 font-semibold text-dark">Vehicle</th>
                  <th className="p-4 font-semibold text-dark">Date & Time</th>
                  <th className="p-4 font-semibold text-dark">Status</th>
                  <th className="p-4 font-semibold text-dark text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((booking) => (
                  <tr key={booking._id} className="border-b border-gray-border last:border-0 hover:bg-gray-light/50 transition-colors">
                    <td className="p-4">
                      {typeof booking.customer === "object" ? (
                        <div>
                          <p className="font-medium text-dark">{booking.customer.fullName}</p>
                          <p className="text-xs text-gray">{booking.customer.email}</p>
                        </div>
                      ) : (
                        <span className="text-gray">{booking.customerName}</span>
                      )}
                    </td>
                    <td className="p-4">
                      <p className="font-medium text-dark">{booking.bikeModel}</p>
                      <p className="text-xs text-gray">{booking.serviceType}</p>
                    </td>
                    <td className="p-4 text-gray">
                      {format(new Date(booking.date), "MMM dd, yyyy 'at' HH:mm")}
                    </td>
                    <td className="p-4">
                      <Badge variant={statusVariant(booking.status)}>{booking.status}</Badge>
                    </td>
                    <td className="p-4 text-right">
                      <Button variant="outline" size="sm" onClick={() => setSelectedBooking(booking)}>
                        <Eye className="h-4 w-4 mr-2" />
                        View
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-20">
            <Calendar className="h-20 w-20 text-gray-border mx-auto mb-6" />
            <h3 className="text-xl font-semibold text-dark">No Bookings Found</h3>
            <p className="text-gray mt-2">There are no bookings matching your current filters.</p>
          </div>
        )}
      </Card>

      {/* Detail Modal */}
      {selectedBooking && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
          <Card className="max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-scale-in">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-dark">Booking Details</h2>
                <p className="text-gray">Manage booking and update its status.</p>
              </div>
              <button onClick={() => setSelectedBooking(null)} className="text-gray hover:text-dark p-2 rounded-full hover:bg-gray-light transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              {/* Left side */}
              <div className="space-y-3 text-base">
                <h4 className="font-bold text-dark mb-2">Appointment Info</h4>
                <div className="flex items-center justify-between py-3 border-b border-gray-border">
                  <span className="flex items-center gap-2 text-gray"><Car className="h-4 w-4" /> Vehicle</span>
                  <span className="font-medium text-dark">{selectedBooking.bikeModel}</span>
                </div>
                <div className="flex items-center justify-between py-3 border-b border-gray-border">
                  <span className="flex items-center gap-2 text-gray"><Hash className="h-4 w-4" /> Service</span>
                  <span className="font-medium text-dark">{selectedBooking.serviceType}</span>
                </div>
                <div className="flex items-center justify-between py-3 border-b border-gray-border">
                  <span className="flex items-center gap-2 text-gray"><Calendar className="h-4 w-4" /> Date & Time</span>
                  <span className="font-medium text-dark">{format(new Date(selectedBooking.date), "MMM dd, yyyy 'at' HH:mm")}</span>
                </div>
                <div className="flex items-center justify-between py-3 border-b border-gray-border">
                  <span className="flex items-center gap-2 text-gray"><CircleDollarSign className="h-4 w-4" /> Amount</span>
                  <span className="font-medium text-dark">Rs. {selectedBooking.finalAmount}</span>
                </div>
                <div className="flex items-center justify-between py-3 border-b border-gray-border">
                  <span className="flex items-center gap-2 text-gray"><Info className="h-4 w-4" /> Status</span>
                  <Badge variant={statusVariant(selectedBooking.status)}>{selectedBooking.status}</Badge>
                </div>
              </div>
              {/* Right side */}
              <div className="space-y-3 text-base">
                <h4 className="font-bold text-dark mb-2">Customer Info</h4>
                {typeof selectedBooking.customer === 'object' ? (
                  <>
                    <div className="flex items-center justify-between py-3 border-b border-gray-border">
                      <span className="flex items-center gap-2 text-gray"><User className="h-4 w-4" /> Name</span>
                      <span className="font-medium text-dark">{selectedBooking.customer.fullName}</span>
                    </div>
                    <div className="flex items-center justify-between py-3 border-b border-gray-border">
                      <span className="flex items-center gap-2 text-gray"><Info className="h-4 w-4" /> Email</span>
                      <span className="font-medium text-dark">{selectedBooking.customer.email}</span>
                    </div>
                  </>
                ) : (
                  <div className="flex items-center justify-between py-3 border-b border-gray-border">
                    <span className="flex items-center gap-2 text-gray"><User className="h-4 w-4" /> Name</span>
                    <span className="font-medium text-dark">{selectedBooking.customerName}</span>
                  </div>
                )}
                {selectedBooking.notes && (
                  <div className="py-3">
                    <span className="text-gray block mb-2 font-medium">Problem Description</span>
                    <p className="text-dark bg-gray-light p-3 rounded-lg">{selectedBooking.notes}</p>
                  </div>
                )}
                {selectedBooking.requestedPickupDropoff && (
                  <div className="py-3">
                    <span className="text-gray block mb-2 font-medium">Pick-up & Drop-off</span>
                    <p className="text-sm text-dark bg-primary/5 p-3 rounded-lg">
                      <strong>Pickup:</strong> {selectedBooking.pickupAddress}<br/>
                      <strong>Dropoff:</strong> {selectedBooking.dropoffAddress}
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="border-t border-gray-border pt-6">
              <h4 className="font-bold text-dark mb-4">Update Status</h4>
              <div className="flex flex-wrap gap-3">
                {selectedBooking.status === "Pending" && (
                  <Button size="sm" onClick={() => updateStatus(selectedBooking._id, "In Progress")}>
                    <Play className="h-4 w-4 mr-2" /> Start Work
                  </Button>
                )}
                {selectedBooking.status === "In Progress" && (
                  <Button size="sm" variant="success" onClick={() => updateStatus(selectedBooking._id, "Completed")}>
                    <ShieldCheck className="h-4 w-4 mr-2" /> Mark as Completed
                  </Button>
                )}
                {["Pending", "In Progress"].includes(selectedBooking.status) && (
                  <Button size="sm" variant="danger" onClick={() => updateStatus(selectedBooking._id, "Cancelled")}>
                    <X className="h-4 w-4 mr-2" /> Cancel Booking
                  </Button>
                )}
                {selectedBooking.status !== 'Pending' && selectedBooking.status !== 'Cancelled' && (
                   <Button size="sm" variant="secondary" onClick={() => updateStatus(selectedBooking._id, "Pending")}>
                     Reset to Pending
                   </Button>
                )}
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
