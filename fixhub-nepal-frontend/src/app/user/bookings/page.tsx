"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { Booking } from "@/types";
import {
  Calendar,
  Eye,
  X,
  Wrench,
  Car,
  Hash,
  Clock,
  Info,
  CircleDollarSign,
  CalendarDays,
  MapPin,
} from "lucide-react";
import { format } from "date-fns";
import toast from "react-hot-toast";
import Link from "next/link";

export default function UserBookings() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [editingBooking, setEditingBooking] = useState<Booking | null>(null);
  const [editForm, setEditForm] = useState<any>(null);
  const [editSubmitting, setEditSubmitting] = useState(false);

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

  useEffect(() => {
    fetchBookings();
  }, []);

  useEffect(() => {
    if (editingBooking) {
      const [vehicleName, vehicleNumber] =
        editingBooking.bikeModel?.split(" (") || ["", ""];
      setEditForm({
        vehicleName,
        vehicleNumber: vehicleNumber?.replace(")", "") || "",
        date: editingBooking.date
          ? editingBooking.date.slice(0, 10)
          : "",
        time: editingBooking.date
          ? editingBooking.date.slice(11, 16)
          : "",
        description: editingBooking.notes || "",
        requestPickup: editingBooking.requestedPickupDropoff || false,
        pickupAddress: editingBooking.pickupAddress || "",
        dropoffAddress: editingBooking.dropoffAddress || "",
      });
    } else {
      setEditForm(null);
    }
  }, [editingBooking]);

  const handleEditBooking = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !editForm.vehicleName ||
      !editForm.vehicleNumber ||
      !editForm.date ||
      !editForm.time
    ) {
      toast.error("Please fill all required fields");
      return;
    }

    setEditSubmitting(true);
    try {
      const payload = {
        bikeModel: `${editForm.vehicleName} (${editForm.vehicleNumber})`,
        date: `${editForm.date}T${editForm.time}`,
        notes: editForm.description,
        requestedPickupDropoff: editForm.requestPickup,
        pickupAddress: editForm.pickupAddress,
        dropoffAddress: editForm.dropoffAddress,
      };

      await api.put(`/user/bookings/${editingBooking?._id}`, payload);
      toast.success("Booking updated successfully!");
      setEditingBooking(null);
      fetchBookings();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Update failed");
    } finally {
      setEditSubmitting(false);
    }
  };

  const cancelBooking = async (id: string) => {
    if (!window.confirm("Cancel this booking?")) return;
    try {
      await api.put(`/user/bookings/${id}`, { status: "Cancelled" });
      toast.success("Booking cancelled");
      fetchBookings();
    } catch {
      toast.error("Failed to cancel booking");
    }
  };

  const deleteBooking = async (id: string) => {
    if (!window.confirm("Delete this booking permanently?")) return;
    try {
      await api.delete(`/user/bookings/${id}`);
      setBookings((prev) => prev.filter((b) => b._id !== id));
      toast.success("Booking deleted");
    } catch {
      toast.error("Failed to delete booking");
    }
  };

  const statusVariant = (status: string) => {
    const map: any = {
      Completed: "success",
      "In Progress": "warning",
      Pending: "warning",
      Cancelled: "danger",
    };
    return map[status] || "default";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <p>Loading bookings...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-12">

      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Service History</h1>
        <Link href="/user/services">
          <Button>+ Book Service</Button>
        </Link>
      </div>

      {/* Bookings */}
      {bookings.length > 0 ? (
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
          {bookings.map((booking) => (
            <div
              key={booking._id}
              className="border rounded-xl p-5 bg-white space-y-4"
            >
              <div className="flex justify-between">
                <div>
                  <h3 className="font-bold">{booking.bikeModel}</h3>
                  <p className="text-sm text-gray-500">
                    {booking.serviceType}
                  </p>
                </div>
                <Badge variant={statusVariant(booking.status)}>
                  {booking.status}
                </Badge>
              </div>

              <p className="text-sm">
                {format(
                  new Date(booking.date),
                  "EEE, MMM dd yyyy HH:mm"
                )}
              </p>

              <p className="font-semibold">
                Rs. {booking.finalAmount}
              </p>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setSelectedBooking(booking)}
                >
                  View
                </Button>

                <Button
                  variant="secondary"
                  onClick={() => setEditingBooking(booking)}
                >
                  Edit
                </Button>

                <Button
                  variant="danger"
                  onClick={() => deleteBooking(booking._id)}
                >
                  Delete
                </Button>

                {booking.status === "Pending" && (
                  <Button
                    variant="danger"
                    onClick={() => cancelBooking(booking._id)}
                  >
                    Cancel
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p>No bookings found.</p>
      )}

      {/* Edit Modal */}
      {editingBooking && editForm && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center">
          <div className="bg-white p-6 rounded-xl w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Edit Booking</h2>
            <form onSubmit={handleEditBooking} className="space-y-3">
              <Input
                label="Vehicle Name"
                value={editForm.vehicleName}
                onChange={(e) =>
                  setEditForm({
                    ...editForm,
                    vehicleName: e.target.value,
                  })
                }
              />
              <Input
                label="Vehicle Number"
                value={editForm.vehicleNumber}
                onChange={(e) =>
                  setEditForm({
                    ...editForm,
                    vehicleNumber: e.target.value,
                  })
                }
              />
              <Input
                type="date"
                value={editForm.date}
                onChange={(e) =>
                  setEditForm({ ...editForm, date: e.target.value })
                }
              />
              <Input
                type="time"
                value={editForm.time}
                onChange={(e) =>
                  setEditForm({ ...editForm, time: e.target.value })
                }
              />

              <div className="flex gap-3 pt-3">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setEditingBooking(null)}
                >
                  Cancel
                </Button>
                <Button type="submit" loading={editSubmitting}>
                  Save
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Booking Modal */}
      {selectedBooking && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center">
          <div className="bg-white p-6 rounded-xl w-full max-w-md space-y-4">
            <div className="flex justify-between">
              <h2 className="text-xl font-bold">Booking Details</h2>
              <button onClick={() => setSelectedBooking(null)}>
                <X />
              </button>
            </div>

            <p><strong>Vehicle:</strong> {selectedBooking.bikeModel}</p>
            <p><strong>Service:</strong> {selectedBooking.serviceType}</p>
            <p>
              <strong>Date:</strong>{" "}
              {format(new Date(selectedBooking.date), "PPPp")}
            </p>
            <p>
              <strong>Status:</strong>{" "}
              {selectedBooking.status}
            </p>
            <p>
              <strong>Amount:</strong> Rs.{" "}
              {selectedBooking.finalAmount}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
