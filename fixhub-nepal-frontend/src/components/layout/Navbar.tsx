"use client";

import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useState, useEffect } from "react";
import { Bell } from "lucide-react";
import api from "@/lib/api";
import { useSocket } from "@/lib/useSocket";
import { Menu, X, Wrench, User, LogOut, LayoutDashboard, ChevronDown } from "lucide-react";

export default function Navbar() {
  const { user, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const socket = useSocket(user?._id || user?.id || user?.email);
  useEffect(() => {
    if (!user) return;
    api.get("/notifications").then(res => {
      setNotifications(res.data.data || []);
      setUnreadCount((res.data.data || []).filter((n: any) => !n.read).length);
    });
  }, [user]);

  useEffect(() => {
    if (!socket) return;
    socket.on("notification", (notif: any) => {
      setNotifications(prev => [notif, ...prev]);
      setUnreadCount(prev => prev + 1);
    });
    return () => {
      socket.off("notification");
    };
  }, [socket]);

  const handleNotifOpen = async () => {
    setNotifOpen(!notifOpen);
    if (!notifOpen && unreadCount > 0) {
      await api.put("/notifications/read-all");
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
    }
  };

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/services", label: "Services" },
    { href: "/about", label: "About" },
    { href: "/contact", label: "Contact" },
  ];

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
      scrolled ? "py-3" : "py-6"
    }`}>
      <div className="container-custom">
        <div className={`relative flex items-center justify-between px-6 h-16 transition-all duration-500 rounded-2xl ${
          scrolled ? "glass shadow-lg border-white/20" : "bg-transparent"
        }`}>
          
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group shrink-0">
            <div className="bg-primary p-2 rounded-xl text-white shadow-lg group-hover:rotate-12 transition-transform duration-300">
              <Wrench className="h-5 w-5" />
            </div>
            <span className="text-xl font-bold tracking-tight text-dark">
              Fixhub<span className="text-primary">.</span>
            </span>
          </Link>

          {/* Desktop Links - Minimalistic approach */}
          <div className="hidden md:flex items-center bg-gray-100/50 p-1 rounded-xl border border-gray-200/50">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="px-5 py-2 text-sm font-semibold text-gray-600 hover:text-dark hover:bg-white rounded-lg transition-all duration-200"
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* User Actions */}
          <div className="flex items-center gap-4">
            {user ? (
              <div className="relative flex items-center gap-4">
                <div className="relative">
                  <button className="p-2 text-gray-400 hover:text-primary transition-colors" onClick={handleNotifOpen}>
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5">{unreadCount}</span>
                    )}
                  </button>
                  {notifOpen && (
                    <div className="absolute right-0 top-10 w-80 bg-white border border-gray-100 rounded-2xl shadow-2xl py-2 animate-fade-in z-50 max-h-96 overflow-y-auto">
                      <div className="px-4 py-2 font-semibold text-dark border-b">Notifications</div>
                      {notifications.length === 0 ? (
                        <div className="px-4 py-6 text-gray-400 text-center">No notifications</div>
                      ) : notifications.slice(0, 10).map((notif, i) => (
                        <div key={notif._id || i} className={`px-4 py-3 text-sm border-b last:border-0 ${notif.read ? "bg-white" : "bg-primary/10"}`}>
                          <div className="font-medium text-dark mb-1">{notif.message}</div>
                          <div className="text-xs text-gray-400">{new Date(notif.createdAt).toLocaleString()}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2 p-1 pr-3 bg-dark text-white rounded-full hover:bg-dark-light transition-all shadow-md"
                >
                  <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center font-bold text-xs">
                    {user.fullName?.charAt(0) || user.email?.charAt(0).toUpperCase() || "U"}
                  </div>
                  <ChevronDown className={`h-4 w-4 transition-transform ${dropdownOpen ? "rotate-180" : ""}`} />
                </button>
                {/* Dropdown simplified */}
                {dropdownOpen && (
                   <div className="absolute right-0 top-14 w-48 bg-white border border-gray-100 rounded-2xl shadow-2xl py-2 animate-fade-in">
                      <Link href="/user/dashboard" className="block px-4 py-2 text-sm hover:bg-gray-50">Dashboard</Link>
                      <button onClick={logout} className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50">Logout</button>
                   </div>
                )}
              </div>
            ) : (
              <div className="hidden md:flex items-center gap-2">
                <Link href="/login" className="px-5 py-2 text-sm font-bold text-dark hover:text-primary">Login</Link>
                <Link href="/register" className="px-5 py-2.5 text-sm font-bold bg-primary text-white rounded-xl shadow-lg shadow-primary/30 hover:bg-primary-dark transition-all">Get Started</Link>
              </div>
            )}
            
            <button className="md:hidden p-2 bg-gray-100 rounded-lg" onClick={() => setMobileOpen(!mobileOpen)}>
              {mobileOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}