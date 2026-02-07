"use client";

import { useState } from "react";
import Link from "next/link";
import { Wrench } from "lucide-react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import api from "@/lib/api";
import toast from "react-hot-toast";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error("Please enter your email");
      return;
    }
    setLoading(true);
    try {
      await api.post("/auth/forgot-password", { email });
      setSent(true);
      toast.success("Reset link sent to your email!");
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error.response?.data?.message || "Failed to send reset email");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gray-light">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8">
        <Link href="/" className="flex items-center gap-2 mb-8 justify-center">
          <div className="bg-primary p-2 rounded-lg">
            <Wrench className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-bold text-dark">
            Fix<span className="text-primary">hub</span> Nepal
          </span>
        </Link>

        {sent ? (
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">✉️</span>
            </div>
            <h2 className="text-xl font-bold text-dark mb-2">Check your email</h2>
            <p className="text-gray text-sm mb-6">
              We&apos;ve sent a password reset link to <strong>{email}</strong>
            </p>
            <Link href="/login" className="text-primary font-medium text-sm hover:text-primary-dark">
              Back to login
            </Link>
          </div>
        ) : (
          <>
            <h1 className="text-2xl font-bold text-dark mb-2 text-center">Forgot Password?</h1>
            <p className="text-gray text-sm text-center mb-8">
              Enter your email and we&apos;ll send you a reset link
            </p>
            <form onSubmit={handleSubmit} className="space-y-5">
              <Input
                label="Email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <Button type="submit" loading={loading} className="w-full" size="lg">
                Send Reset Link
              </Button>
            </form>
            <p className="text-center text-sm text-gray mt-6">
              Remember your password?{" "}
              <Link href="/login" className="text-primary font-medium hover:text-primary-dark">
                Sign in
              </Link>
            </p>
          </>
        )}
      </div>
    </div>
  );
}
