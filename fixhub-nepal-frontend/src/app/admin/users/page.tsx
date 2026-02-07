"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import { User } from "@/types";
import { Users, Search, Mail, Shield, Calendar, UserPlus } from "lucide-react";
import { format } from "date-fns";
import toast from "react-hot-toast";

export default function AdminUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await api.get("/admin/users");
        setUsers(res.data.data || res.data.users || []);
      } catch {
        toast.error("Failed to load users");
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  const filtered = users.filter(
    (u) =>
      u.fullName?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in-up">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-dark">User Management</h1>
          <p className="text-gray mt-1 text-lg">View and manage all registered users.</p>
        </div>
        <div className="relative w-full md:w-72">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray" />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-12 pr-4 py-2.5 border border-gray-border rounded-full text-base bg-white focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
          />
        </div>
      </div>

      <Card className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-light">
              <tr>
                <th className="p-4 font-semibold text-dark">User</th>
                <th className="p-4 font-semibold text-dark">Contact</th>
                <th className="p-4 font-semibold text-dark">Role</th>
                <th className="p-4 font-semibold text-dark">Joined On</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((user) => (
                <tr key={user._id} className="border-b border-gray-border last:border-0 hover:bg-gray-light/50 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                        {user.profileImage ? (
                          <img src={`${process.env.NEXT_PUBLIC_API_URL?.replace("/api", "")}/${user.profileImage}`} alt={user.fullName} className="w-full h-full rounded-full object-cover" />
                        ) : (
                          <span className="text-primary font-bold text-base">{user.fullName?.charAt(0).toUpperCase()}</span>
                        )}
                      </div>
                      <span className="font-medium text-dark">{user.fullName}</span>
                    </div>
                  </td>
                  <td className="p-4 text-gray">
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4" /> {user.email}
                    </div>
                  </td>
                  <td className="p-4">
                    <Badge variant={user.role === "admin" ? "danger" : "default"} className="capitalize">
                      <span className="flex items-center gap-1.5">
                        <Shield className="h-3.5 w-3.5" />
                        {user.role}
                      </span>
                    </Badge>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2 text-gray">
                      <Calendar className="h-4 w-4" />
                      {user.createdAt ? format(new Date(user.createdAt), "MMM dd, yyyy") : "N/A"}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <div className="text-center py-20">
            <Users className="h-20 w-20 text-gray-border mx-auto mb-6" />
            <h3 className="text-xl font-semibold text-dark">No Users Found</h3>
            <p className="text-gray mt-2">Your search for "{search}" did not match any users.</p>
          </div>
        )}
      </Card>
    </div>
  );
}
