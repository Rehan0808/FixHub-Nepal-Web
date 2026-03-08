"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import api from "@/lib/api";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import { User } from "@/types";
import { ArrowLeft, Mail, Phone, MapPin, Shield, Calendar, Edit, Award, User as UserIcon } from "lucide-react";
import { format } from "date-fns";
import toast from "react-hot-toast";

export default function UserDetailPage() {
  const params = useParams();
  const router = useRouter();
  const userId = (params?.id as string) || "";

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await api.get(`/admin/users/${userId}`);
        setUser(res.data.data);
      } catch {
        toast.error("Failed to load user details");
        router.push("/admin/users");
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [userId, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center py-20">
        <UserIcon className="h-20 w-20 text-gray-border mx-auto mb-6" />
        <h3 className="text-xl font-semibold text-dark">User Not Found</h3>
        <p className="text-gray mt-2">The requested user could not be found.</p>
        <Button variant="outline" className="mt-6" onClick={() => router.push("/admin/users")}>
          Back to Users
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in-up">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push("/admin/users")}
            className="p-2 rounded-lg hover:bg-gray-light transition-colors"
          >
            <ArrowLeft className="h-5 w-5 text-gray" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-dark">User Details</h1>
            <p className="text-gray mt-1">View detailed information about this user.</p>
          </div>
        </div>
        <Button onClick={() => router.push(`/admin/users/${userId}/edit`)}>
          <Edit className="h-4 w-4 mr-2" />
          Edit User
        </Button>
      </div>

      {/* User Profile Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Overview */}
        <Card className="lg:col-span-1 p-6">
          <div className="text-center">
            <div className="w-24 h-24 mx-auto bg-primary/10 rounded-full flex items-center justify-center mb-4">
              {user.profileImage ? (
                <img
                  src={`${process.env.NEXT_PUBLIC_API_URL?.replace("/api", "")}/${user.profileImage}`}
                  alt={user.fullName}
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                <span className="text-primary font-bold text-4xl">
                  {user.fullName?.charAt(0).toUpperCase()}
                </span>
              )}
            </div>
            <h2 className="text-xl font-bold text-dark">{user.fullName}</h2>
            <p className="text-gray text-sm mt-1">{user.email}</p>
            <Badge
              variant={user.role === "admin" ? "danger" : "default"}
              className="mt-3 capitalize"
            >
              <span className="flex items-center gap-1.5">
                <Shield className="h-3.5 w-3.5" />
                {user.role}
              </span>
            </Badge>
          </div>

          {/* Loyalty Points */}
          {user.loyaltyPoints !== undefined && (
            <div className="mt-6 p-4 bg-gradient-to-r from-primary/10 to-accent/10 rounded-xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Award className="h-5 w-5 text-primary" />
                  <span className="text-sm font-medium text-dark">Loyalty Points</span>
                </div>
                <span className="text-2xl font-bold text-primary">{user.loyaltyPoints}</span>
              </div>
            </div>
          )}
        </Card>

        {/* Contact & Details */}
        <Card className="lg:col-span-2 p-6">
          <h3 className="text-lg font-bold text-dark mb-6">Contact Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center shrink-0">
                <Mail className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-gray">Email Address</p>
                <p className="text-dark font-medium">{user.email}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center shrink-0">
                <Phone className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-gray">Phone Number</p>
                <p className="text-dark font-medium">{user.phone || "Not provided"}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center shrink-0">
                <MapPin className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-gray">Address</p>
                <p className="text-dark font-medium">{user.address || "Not provided"}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center shrink-0">
                <Calendar className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-gray">Member Since</p>
                <p className="text-dark font-medium">
                  {user.createdAt ? format(new Date(user.createdAt), "MMMM dd, yyyy") : "N/A"}
                </p>
              </div>
            </div>
          </div>

          {/* Account Details */}
          <h3 className="text-lg font-bold text-dark mt-8 mb-6">Account Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-4 bg-gray-light rounded-xl">
              <p className="text-sm text-gray">User ID</p>
              <p className="text-dark font-mono text-sm mt-1">{user._id}</p>
            </div>
            <div className="p-4 bg-gray-light rounded-xl">
              <p className="text-sm text-gray">Last Updated</p>
              <p className="text-dark font-medium mt-1">
                {user.updatedAt ? format(new Date(user.updatedAt), "MMM dd, yyyy 'at' hh:mm a") : "N/A"}
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
