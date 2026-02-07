"use client";

import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useState, useEffect } from "react";
import { Menu, X, Wrench, User, LogOut, LayoutDashboard, ChevronDown, Bell } from "lucide-react";

export default function Navbar() {
  const { user, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

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
                <button className="p-2 text-gray-400 hover:text-primary transition-colors">
                   <Bell className="h-5 w-5" />
                </button>
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