"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { Booking } from "@/types";
import { BadgeDollarSign } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function UserPayments() {
  const [payments, setPayments] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const { user, updateUser } = useAuth();
  const [discountLoading, setDiscountLoading] = useState<string | null>(null);
  // Handler for Apply Discount button
  const handleApplyDiscount = async (payment: Booking) => {
    setDiscountLoading(payment._id);
    try {
      const res = await api.put(`/user/bookings/${payment._id}/apply-discount`);
      // Update the payment in the list
      setPayments((prev) => prev.map((b) => b._id === payment._id ? { ...b, ...res.data.data.booking } : b));
      // Update user loyalty points
      if (user) updateUser({ ...user, loyaltyPoints: res.data.data.loyaltyPoints });
    } catch (err: any) {
      alert(err?.response?.data?.message || "Failed to apply discount");
    } finally {
      setDiscountLoading(null);
    }
  };

  useEffect(() => {
    const fetchPaymentsAndUser = async () => {
      try {
        const [paymentsRes, userRes] = await Promise.all([
          api.get("/user/bookings"),
          api.get("/user/profile"),
        ]);
        setPayments(paymentsRes.data.data || paymentsRes.data.bookings || []);
        if (userRes.data?.data) updateUser(userRes.data.data);
      } catch {
        setPayments([]);
      } finally {
        setLoading(false);
      }
    };
    fetchPaymentsAndUser();
  }, []);

  // Separate pending and paid payments
  const pendingPayments = payments.filter((p) => !p.isPaid);


  // Handler for Pay Now button (eSewa)
  const handlePayNow = async (payment: Booking) => {
    try {
      // Call backend to get eSewa payment data
      const res = await api.post("/payment/esewa/initiate", {
        bookingId: payment._id,
        frontendUrl: window.location.origin,
      });
      const data = res.data;
      // Create and submit a form to eSewa
      const form = document.createElement("form");
      form.method = "POST";
      form.action = data.ESEWA_URL;
      // Add all fields from backend response except ESEWA_URL
      Object.entries(data).forEach(([key, value]) => {
        if (key === "ESEWA_URL") return;
        const input = document.createElement("input");
        input.type = "hidden";
        input.name = key;
        input.value = value as string;
        form.appendChild(input);
      });
      document.body.appendChild(form);
      form.submit();
    } catch (err) {
      alert("Failed to initiate eSewa payment");
    }
  };
  const paidPayments = payments.filter((p) => p.isPaid);

  return (
    <div className="max-w-5xl mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">My Payments</h1>
      {loading ? (
        <div className="flex items-center justify-center h-40">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : payments.length === 0 ? (
        <div className="text-center text-gray-400 py-20">
          <BadgeDollarSign className="mx-auto mb-4 h-10 w-10" />
          <p>No payment history found.</p>
        </div>
      ) : (
        <>
          {/* Pending Payments Section */}
          <div className="mb-10">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Pending Payments</h2>
              <div className="flex items-center gap-2 text-purple-600 font-semibold">
                <span className="text-base">{user && typeof user.loyaltyPoints === 'number' ? user.loyaltyPoints : 0} Points</span>
                <svg width="20" height="20" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="#a78bfa"/><text x="12" y="16" textAnchor="middle" fontSize="12" fill="#fff" fontWeight="bold">🎁</text></svg>
              </div>
            </div>
            {pendingPayments.length === 0 ? (
              <div className="flex items-center justify-center h-24 text-gray-400">
                <BadgeDollarSign className="mx-auto mr-2 h-6 w-6" />
                <span>No Pending Payments</span>
              </div>
            ) : (
              <div className="space-y-4">
                {pendingPayments.map((payment) => (
                  <div key={payment._id} className="flex flex-col md:flex-row items-center justify-between bg-white rounded-xl shadow p-4 gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-lg text-slate-900">{payment.serviceType}</div>
                      <div className="text-xs text-gray-500 mb-1">Date: {new Date(payment.date).toLocaleDateString()}</div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-gray-400 line-through text-base">₹{payment.totalCost}</span>
                        <span className="text-green-600 font-bold text-xl">₹{payment.finalAmount}</span>
                      </div>
                      {payment.discountApplied && (
                        <div className="text-xs text-green-600 mt-1">Discount: -₹{payment.discountAmount?.toFixed(0)}</div>
                      )}
                    </div>
                    <div className="flex flex-col md:flex-row items-center gap-2">
                      <button
                        className="px-3 py-2 bg-[#4a148c] text-white rounded-lg font-semibold flex items-center gap-1 hover:bg-[#6d28d9] transition-colors"
                        onClick={() => handlePayNow(payment)}
                      >
                        <img src="https://cdn.esewa.com.np/ui/images/esewa-icon.png" alt="eSewa" className="h-5 w-5" />
                        Pay with eSewa
                      </button>
                      {/* Show discount button if user has enough points and discount not applied */}
                      {typeof user?.loyaltyPoints === 'number' && user.loyaltyPoints >= 100 && !payment.discountApplied && (
                        <button
                          className="px-3 py-2 bg-emerald-100 text-emerald-700 rounded-lg font-semibold hover:bg-emerald-200 transition-colors"
                          onClick={() => handleApplyDiscount(payment)}
                          disabled={discountLoading === payment._id}
                        >
                          {discountLoading === payment._id ? "Applying..." : `Apply 5% Discount (-₹${(payment.finalAmount * 0.05).toFixed(0)})`}
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          {/* Payment History Section */}
          <div className="bg-white rounded-2xl shadow-md overflow-x-auto">
            <h2 className="text-xl font-semibold mb-4 px-6 pt-6">Payment History</h2>
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bike Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Service</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {paidPayments.map((payment) => (
                  <tr key={payment._id}>
                    <td className="px-6 py-4 whitespace-nowrap font-semibold text-slate-800">{payment.bikeModel}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-slate-600">{payment.serviceType}</td>
                    <td className="px-6 py-4 whitespace-nowrap font-bold text-slate-900">Rs. {payment.finalAmount}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-block px-3 py-1 text-xs font-semibold bg-green-100 text-green-700 rounded-full">Paid</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
