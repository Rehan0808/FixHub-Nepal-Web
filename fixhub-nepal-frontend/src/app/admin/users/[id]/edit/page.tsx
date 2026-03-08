"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import api from "@/lib/api";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { User } from "@/types";
import { ArrowLeft, Save, User as UserIcon, Mail, Phone, MapPin, Shield, Lock } from "lucide-react";
import toast from "react-hot-toast";

export default function EditUserPage() {
  const params = useParams();
  const router = useRouter();
  const userId = (params?.id as string) || "";

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    address: "",
    role: "normal" as "normal" | "admin",
    password: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await api.get(`/admin/users/${userId}`);
        const user: User = res.data.data;
        setFormData({
          fullName: user.fullName || "",
          email: user.email || "",
          phone: user.phone || "",
          address: user.address || "",
          role: user.role || "normal",
          password: "",
        });
      } catch {
        toast.error("Failed to load user details");
        router.push("/admin/users");
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [userId, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.fullName.trim()) {
      newErrors.fullName = "Full name is required";
    }
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid";
    }
    if (formData.password && formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setSaving(true);
    try {
      const updateData: Record<string, string> = {
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        role: formData.role,
      };
      if (formData.password) {
        updateData.password = formData.password;
      }
      await api.put(`/admin/users/${userId}`, updateData);
      toast.success("User updated successfully");
      router.push(`/admin/users/${userId}`);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error.response?.data?.message || "Failed to update user");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in-up">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => router.push(`/admin/users/${userId}`)}
          className="p-2 rounded-lg hover:bg-gray-light transition-colors"
        >
          <ArrowLeft className="h-5 w-5 text-gray" />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-dark">Edit User</h1>
          <p className="text-gray mt-1">Update user information and settings.</p>
        </div>
      </div>

      {/* Edit Form */}
      <Card className="max-w-2xl p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label="Full Name"
              name="fullName"
              placeholder="Enter full name"
              value={formData.fullName}
              onChange={handleChange}
              error={errors.fullName}
              icon={<UserIcon className="h-4 w-4 text-gray" />}
            />

            <Input
              label="Email Address"
              name="email"
              type="email"
              placeholder="Enter email"
              value={formData.email}
              onChange={handleChange}
              error={errors.email}
              icon={<Mail className="h-4 w-4 text-gray" />}
            />

            <Input
              label="Phone Number"
              name="phone"
              placeholder="Enter phone number"
              value={formData.phone}
              onChange={handleChange}
              icon={<Phone className="h-4 w-4 text-gray" />}
            />

            <div className="flex flex-col gap-2 w-full">
              <label className="text-sm font-semibold text-dark flex items-center gap-2">
                <Shield className="h-4 w-4 text-gray" />
                Role
              </label>
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="w-full px-4 py-3 border-2 rounded-xl text-sm transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-primary/20 border-gray-border focus:border-primary hover:border-gray-400 bg-white"
              >
                <option value="normal">Normal User</option>
                <option value="admin">Admin</option>
              </select>
            </div>
          </div>

          <div className="border-t border-gray-border pt-6">
            <h3 className="text-lg font-semibold text-dark mb-4 flex items-center gap-2">
              <Lock className="h-5 w-5 text-gray" />
              Change Password (Optional)
            </h3>
            <Input
              label="New Password"
              name="password"
              type="password"
              placeholder="Leave blank to keep current password"
              value={formData.password}
              onChange={handleChange}
              error={errors.password}
            />
            <p className="text-xs text-gray mt-2">
              Only fill this if you want to change the user&apos;s password.
            </p>
          </div>

          <div className="flex gap-4 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push(`/admin/users/${userId}`)}
            >
              Cancel
            </Button>
            <Button type="submit" loading={saving}>
              <Save className="h-4 w-4 mr-2" />
              Save Changes
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
