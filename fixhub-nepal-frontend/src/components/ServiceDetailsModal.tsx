"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { Service } from "@/types";
import { Clock } from "lucide-react";

interface Props {
  serviceId: string;
  onClose: () => void;
}

export default function ServiceDetailsModal({ serviceId, onClose }: Props) {
  const [service, setService] = useState<Service | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchService = async () => {
      try {
        const res = await api.get(`/user/services/${serviceId}`);
        setService(res.data.data);
      } catch {
        setService(null);
      } finally {
        setLoading(false);
      }
    };
    fetchService();
  }, [serviceId]);

  if (loading) return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-white p-8 rounded-lg shadow-lg">Loading...</div>
    </div>
  );

  if (!service) return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-white p-8 rounded-lg shadow-lg">Service not found.</div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 animate-fade-in">
      <Card className="max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-scale-in">
        <div className="flex items-start justify-between mb-6">
          <h2 className="text-2xl font-bold text-dark">{service.name}</h2>
          <button onClick={onClose} className="text-gray hover:text-dark p-2 rounded-full hover:bg-gray-light transition-colors">✕</button>
        </div>
        {service.image && (
          <div className="w-full h-56 mb-4 rounded-lg overflow-hidden bg-gray-100">
            <img src={`${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '')}/${service.image}`} alt={service.name} className="w-full h-full object-cover" />
          </div>
        )}
        <div className="mb-4">
          <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-1 rounded-full mr-2">{service.category}</span>
          <span className="text-sm text-gray flex items-center gap-1.5">
            <Clock className="h-4 w-4" /> {service.duration}
          </span>
        </div>
        <p className="text-base text-gray mb-4">{service.description}</p>
        <div className="flex items-center justify-between mt-6">
          <span className="text-2xl font-bold text-primary">Rs. {service.price}</span>
          <Button onClick={onClose}>Close</Button>
        </div>
      </Card>
    </div>
  );
}
