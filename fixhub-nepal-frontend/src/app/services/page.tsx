"use client";

import { useEffect, useState } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import api from "@/lib/api";
import { Service } from "@/types";
import { Wrench, Search, Clock } from "lucide-react";
import Link from "next/link";

export default function PublicServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const res = await api.get("/user/services");
        setServices(res.data.data || res.data.services || []);
      } catch {
        // Services might not load without auth
      } finally {
        setLoading(false);
      }
    };
    fetchServices();
  }, []);

  const filtered = services.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.category?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen">
      <Navbar />

      <section className="bg-dark text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl font-bold mb-4">Our Services</h1>
          <p className="text-gray max-w-2xl mx-auto">
            Professional vehicle repair and maintenance services at competitive prices.
          </p>
          <div className="max-w-md mx-auto mt-8 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray" />
            <input
              type="text"
              placeholder="Search services..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-dark-lighter border border-dark-lighter text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/40 placeholder:text-gray"
            />
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : filtered.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((service) => (
                <div
                  key={service._id}
                  className="bg-white rounded-xl border border-gray-border hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group overflow-hidden"
                >
                  {/* Service Image */}
                  {service.image ? (
                    <div className="w-full h-48 bg-gray-100">
                      <img 
                        src={`${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '')}/${service.image}`} 
                        alt={service.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-full h-48 bg-primary/10 flex items-center justify-center">
                      <Wrench className="h-16 w-16 text-primary/40" />
                    </div>
                  )}
                  
                  <div className="p-6">
                    <div className="mb-4">
                      <h3 className="font-semibold text-dark text-lg">{service.name}</h3>
                      {service.category && (
                        <span className="text-xs text-gray bg-gray-light px-2 py-0.5 rounded-full inline-block mt-1">{service.category}</span>
                      )}
                    </div>
                    <p className="text-sm text-gray mb-4 line-clamp-2">{service.description}</p>
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-lg font-bold text-primary">Rs. {service.price}</span>
                        {service.duration && (
                          <span className="text-xs text-gray flex items-center gap-1 mt-1">
                            <Clock className="h-3 w-3" /> {service.duration}
                          </span>
                        )}
                      </div>
                      <Link
                        href="/register"
                        className="bg-primary text-white px-4 py-2 rounded-lg text-sm hover:bg-primary-dark transition-colors"
                      >
                        Book Now
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <Wrench className="h-12 w-12 text-gray-border mx-auto mb-4" />
              <p className="text-gray text-lg">No services available at the moment</p>
              <p className="text-sm text-gray mt-2">Check back later or contact us for custom services</p>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}
