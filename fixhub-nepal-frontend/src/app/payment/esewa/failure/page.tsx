"use client";

import { XCircle, ArrowLeft, CreditCard } from "lucide-react";
import Link from "next/link";

export default function EsewaFailure() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-orange-50 p-4">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl p-8 space-y-6 animate-in fade-in zoom-in-95 duration-700">
        
        {/* Error Icon */}
        <div className="flex justify-center">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center animate-pulse">
            <XCircle className="w-12 h-12 text-red-600" />
          </div>
        </div>

        {/* Error Message */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-extrabold text-slate-900">Payment Failed</h1>
          <p className="text-slate-600">
            Your payment was not completed. This could be due to:
          </p>
        </div>

        {/* Reasons List */}
        <div className="bg-red-50 rounded-xl p-5 border border-red-200 space-y-2">
          <ul className="text-sm text-slate-700 space-y-2">
            <li className="flex items-start gap-2">
              <span className="text-red-500 font-bold">•</span>
              <span>Insufficient balance in your eSewa account</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-red-500 font-bold">•</span>
              <span>Payment was cancelled by you</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-red-500 font-bold">•</span>
              <span>Network or technical issues</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-red-500 font-bold">•</span>
              <span>Session timeout</span>
            </li>
          </ul>
        </div>

        {/* Info Box */}
        <div className="bg-amber-50 rounded-xl p-4 border border-amber-200">
          <p className="text-sm text-slate-700 leading-relaxed">
            <span className="font-semibold text-amber-800">Don't worry!</span> Your booking is still saved. 
            You can try paying again from your bookings page.
          </p>
        </div>

        {/* Actions */}
        <div className="space-y-3">
          <Link 
            href="/user/bookings" 
            className="flex items-center justify-center gap-2 w-full bg-slate-900 text-white py-3 rounded-xl font-bold hover:bg-slate-800 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"
          >
            <CreditCard className="w-4 h-4" />
            Try Again
          </Link>
          <Link 
            href="/user/dashboard" 
            className="flex items-center justify-center gap-2 text-slate-600 hover:text-slate-900 font-semibold transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>
        </div>

        {/* Support Link */}
        <div className="text-center pt-4 border-t border-slate-100">
          <p className="text-xs text-slate-500">
            Need help? <Link href="/contact" className="text-blue-600 hover:underline font-semibold">Contact Support</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
