"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import { User } from "@/types";
import { Users, Search, Mail, Shield, Calendar, Trash2, Eye, Edit, ChevronLeft, ChevronRight, AlertTriangle, X } from "lucide-react";
import { format } from "date-fns";
import toast from "react-hot-toast";

export default function AdminUsers() {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [deleteModal, setDeleteModal] = useState<{ open: boolean; user: User | null }>({ open: false, user: null });
  const [deleting, setDeleting] = useState(false);
  const limit = 5;

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get(`/admin/users?page=${currentPage}&limit=${limit}&search=${search}`);
      setUsers(res.data.data || res.data.users || []);
      setTotalPages(res.data.totalPages || 1);
    } catch {
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  }, [currentPage, search]);

  useEffect(() => {
    const debounce = setTimeout(() => {
      fetchUsers();
    }, 300);
    return () => clearTimeout(debounce);
  }, [fetchUsers]);

  const handleSearch = (value: string) => {
    setSearch(value);
    setCurrentPage(1);
  };

  const handleDelete = async () => {
    if (!deleteModal.user) return;
    setDeleting(true);
    try {
      await api.delete(`/admin/users/${deleteModal.user._id}`);
      toast.success(`User "${deleteModal.user.fullName}" deleted successfully`);
      setDeleteModal({ open: false, user: null });
      fetchUsers();
    } catch {
      toast.error("Failed to delete user");
    } finally {
      setDeleting(false);
    }
  };

  if (loading && users.length === 0) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in-up">
      {/* Delete Confirmation Modal */}
      {deleteModal.open && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 animate-fade-in-up">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                  <AlertTriangle className="h-6 w-6 text-danger" />
                </div>
                <h3 className="text-xl font-bold text-dark">Delete User</h3>
              </div>
              <button onClick={() => setDeleteModal({ open: false, user: null })} className="text-gray hover:text-dark">
                <X className="h-5 w-5" />
              </button>
            </div>
            <p className="text-gray mb-6">
              Are you sure you want to delete <strong className="text-dark">{deleteModal.user?.fullName}</strong>? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => setDeleteModal({ open: false, user: null })}>
                Cancel
              </Button>
              <Button variant="danger" className="flex-1" loading={deleting} onClick={handleDelete}>
                Delete User
              </Button>
            </div>
          </div>
        </div>
      )}

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
            onChange={(e) => handleSearch(e.target.value)}
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
                <th className="p-4 font-semibold text-dark text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
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
                  <td className="p-4">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => router.push(`/admin/users/${user._id}`)}
                        className="p-2 rounded-lg hover:bg-primary/10 text-primary transition-colors"
                        title="View Details"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => router.push(`/admin/users/${user._id}/edit`)}
                        className="p-2 rounded-lg hover:bg-blue-100 text-blue-600 transition-colors"
                        title="Edit User"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => setDeleteModal({ open: true, user })}
                        className="p-2 rounded-lg hover:bg-red-100 text-danger transition-colors"
                        title="Delete User"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {users.length === 0 && (
          <div className="text-center py-20">
            <Users className="h-20 w-20 text-gray-border mx-auto mb-6" />
            <h3 className="text-xl font-semibold text-dark">No Users Found</h3>
            <p className="text-gray mt-2">{search ? `Your search for "${search}" did not match any users.` : "No users registered yet."}</p>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between p-4 border-t border-gray-border">
            <p className="text-sm text-gray">
              Page {currentPage} of {totalPages}
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="p-2 rounded-lg border border-gray-border hover:bg-gray-light disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }
                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${currentPage === pageNum
                        ? "bg-primary text-white"
                        : "border border-gray-border hover:bg-gray-light"
                      }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
              <button
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="p-2 rounded-lg border border-gray-border hover:bg-gray-light disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
