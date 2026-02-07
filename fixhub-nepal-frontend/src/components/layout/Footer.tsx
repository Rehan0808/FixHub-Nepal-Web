import Link from "next/link";
import { Wrench, Mail, Phone, MapPin } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-dark text-white relative overflow-hidden">


      <div className="relative max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-16 lg:py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-16 mb-12">
          {/* Brand */}
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-primary to-primary-dark p-3 rounded-xl shadow-glow">
                <Wrench className="h-6 w-6 text-white" />
              </div>
              <span className="text-2xl font-bold">
                Fix<span className="text-primary">hub</span> Nepal
              </span>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed">
              Your trusted vehicle repair and maintenance platform in Nepal.
              Book services, track repairs, and keep your ride running smoothly.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-lg mb-6 text-white">Quick Links</h3>
            <div className="space-y-3">
              <Link href="/services" className="block text-gray-400 text-sm hover:text-primary transition-colors duration-300 hover:translate-x-1 transform">
                Services
              </Link>
              <Link href="/about" className="block text-gray-400 text-sm hover:text-primary transition-colors duration-300 hover:translate-x-1 transform">
                About Us
              </Link>
              <Link href="/contact" className="block text-gray-400 text-sm hover:text-primary transition-colors duration-300 hover:translate-x-1 transform">
                Contact
              </Link>
              <Link href="/register" className="block text-gray-400 text-sm hover:text-primary transition-colors duration-300 hover:translate-x-1 transform">
                Get Started
              </Link>
            </div>
          </div>

          {/* Services */}
          <div>
            <h3 className="font-semibold text-lg mb-6 text-white">Our Services</h3>
            <div className="space-y-3 text-gray-400 text-sm">
              <p className="hover:text-white transition-colors cursor-default">Engine Repair</p>
              <p className="hover:text-white transition-colors cursor-default">Oil Change</p>
              <p className="hover:text-white transition-colors cursor-default">Brake Service</p>
              <p className="hover:text-white transition-colors cursor-default">General Maintenance</p>
            </div>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-semibold text-lg mb-6 text-white">Contact Us</h3>
            <div className="space-y-4">
              <div className="flex items-start gap-3 text-gray-400 text-sm hover:text-white transition-colors group">
                <MapPin className="h-5 w-5 text-primary flex-shrink-0 mt-0.5 group-hover:scale-110 transition-transform" />
                <span>Kathmandu, Nepal</span>
              </div>
              <div className="flex items-center gap-3 text-gray-400 text-sm hover:text-white transition-colors group">
                <Phone className="h-5 w-5 text-primary flex-shrink-0 group-hover:scale-110 transition-transform" />
                <span>+977-9800000000</span>
              </div>
              <div className="flex items-center gap-3 text-gray-400 text-sm hover:text-white transition-colors group">
                <Mail className="h-5 w-5 text-primary flex-shrink-0 group-hover:scale-110 transition-transform" />
                <span>info@fixhubnepal.com</span>
              </div>
            </div>
          </div>
        </div>

        <hr className="border-dark-lighter my-8" />

        <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-gray-400 text-sm">
          <p>&copy; {new Date().getFullYear()} Fixhub Nepal. All rights reserved.</p>
          <div className="flex gap-8">
            <Link href="#" className="hover:text-primary transition-colors duration-300">
              Privacy Policy
            </Link>
            <Link href="#" className="hover:text-primary transition-colors duration-300">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
