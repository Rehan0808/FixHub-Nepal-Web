"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import api from "@/lib/api";
import { CheckCircle, Loader2, Gift, ArrowRight, X } from "lucide-react";
import Link from "next/link";

export default function EsewaSuccess() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [verifying, setVerifying] = useState(true);
  const [success, setSuccess] = useState(false);
  const [message, setMessage] = useState("");
  const [points, setPoints] = useState(0);

  useEffect(() => {
    const verifyPayment = async () => {
      const data = searchParams.get("data");
      
      if (!data) {
        setMessage("Invalid payment data");
        setVerifying(false);
        return;
      }

      try {
        const res = await api.get(`/payment/esewa/verify?data=${data}`);
        
        if (res.data.success) {
          setSuccess(true);
          setMessage(res.data.message);
          
          // Extract points from message like "Payment successful! You earned 15 loyalty points."
          const pointsMatch = res.data.message.match(/(\d+) loyalty points/);
          if (pointsMatch) {
            setPoints(parseInt(pointsMatch[1]));
          }
        } else {
          setMessage(res.data.message || "Payment verification failed");
        }
      } catch (error: any) {
        setMessage(error.response?.data?.message || "Failed to verify payment");
      } finally {
        setVerifying(false);
      }
    };

    verifyPayment();
  }, [searchParams]);

  if (verifying) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="text-center space-y-4">
          <Loader2 className="w-16 h-16 text-blue-600 animate-spin mx-auto" />
          <h2 className="text-2xl font-bold text-slate-800">Verifying Payment...</h2>
          <p className="text-slate-500">Please wait while we confirm your transaction</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 to-green-50 p-4">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl p-8 space-y-6 animate-in fade-in zoom-in-95 duration-700">
        
        {success ? (
          <>
            {/* Success Icon */}
            <div className="flex justify-center">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center animate-bounce">
                <CheckCircle className="w-12 h-12 text-green-600" />
              </div>
            </div>

            {/* Success Message */}
            <div className="text-center space-y-2">
              <h1 className="text-3xl font-extrabold text-slate-900">Payment Successful!</h1>
              <p className="text-slate-600">{message}</p>
            </div>

            {/* Loyalty Points Card */}
            {points > 0 && (
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-6 border-2 border-purple-200">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                    <Gift className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-xs text-purple-600 font-semibold uppercase tracking-wide">Loyalty Reward</p>
                    <p className="text-2xl font-bold text-purple-900">+{points} Points</p>
                  </div>
                </div>
              </div>
            )}

            {/* Info Box */}
            <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
              <p className="text-sm text-slate-700 leading-relaxed">
                Your booking is now <span className="font-bold text-blue-700">confirmed</span>. 
                A confirmation email has been sent to your registered email address.
              </p>
            </div>

            {/* Actions */}
            <div className="space-y-3">
              <Link 
                href="/user/bookings" 
                className="flex items-center justify-center gap-2 w-full bg-slate-900 text-white py-3 rounded-xl font-bold hover:bg-slate-800 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"
              >
                View My Bookings
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link 
                href="/user/dashboard" 
                className="block text-center text-slate-600 hover:text-slate-900 font-semibold transition-colors"
              >
                Go to Dashboard
              </Link>
            </div>
          </>
        ) : (
          <>
            {/* Error Icon */}
            <div className="flex justify-center">
              <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center">
                <X className="w-12 h-12 text-red-600" />
              </div>
            </div>

            {/* Error Message */}
            <div className="text-center space-y-2">
              <h1 className="text-3xl font-extrabold text-slate-900">Verification Failed</h1>
              <p className="text-slate-600">{message}</p>
            </div>

            {/* Actions */}
            <div className="space-y-3">
              <Link 
                href="/user/bookings" 
                className="block text-center w-full bg-slate-900 text-white py-3 rounded-xl font-bold hover:bg-slate-800 transition-all shadow-lg"
              >
                Back to Bookings
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
