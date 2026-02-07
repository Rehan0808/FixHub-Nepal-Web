"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { Service } from "@/types";
import { Wrench, Search, Clock, X, Calendar, Car, Hash, Info, MapPin, Loader2 } from "lucide-react";
import toast from "react-hot-toast";

export default function UserServices() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [bookingService, setBookingService] = useState<Service | null>(null);
  const [bookingForm, setBookingForm] = useState({
    vehicleName: "",
    vehicleNumber: "",
    date: "",
    time: "",
    description: "",
    requestPickup: false,
    pickupAddress: "",
    dropoffAddress: "",
    pickupCoordinates: { lat: 0, lng: 0 },
    dropoffCoordinates: { lat: 0, lng: 0 },
  });
  const [submitting, setSubmitting] = useState(false);
  const [fetchingLocation, setFetchingLocation] = useState<'pickup' | 'dropoff' | null>(null);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const res = await api.get("/user/services");
        setServices(res.data.data || res.data.services || []);
      } catch {
        toast.error("Failed to load services");
      } finally {
        setLoading(false);
      }
    };
    fetchServices();
  }, []);

  const fetchUserLocation = async (field: 'pickup' | 'dropoff') => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser");
      return;
    }

    setFetchingLocation(field);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          // Using reverse geocoding API
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
          );
          const data = await response.json();
          const address = data.display_name || `${latitude}, ${longitude}`;
          
          if (field === 'pickup') {
            setBookingForm({ 
              ...bookingForm, 
              pickupAddress: address,
              pickupCoordinates: { lat: latitude, lng: longitude }
            });
          } else {
            setBookingForm({ 
              ...bookingForm, 
              dropoffAddress: address,
              dropoffCoordinates: { lat: latitude, lng: longitude }
            });
          }
          toast.success("Location fetched successfully!");
        } catch (error) {
          toast.error("Failed to fetch address");
        } finally {
          setFetchingLocation(null);
        }
      },
      (error) => {
        toast.error("Unable to retrieve your location");
        setFetchingLocation(null);
      }
    );
  };

  // Geocode address to get coordinates
  const geocodeAddress = async (address: string): Promise<{ lat: number; lng: number } | null> => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1`
      );
      const data = await response.json();
      if (data && data.length > 0) {
        return {
          lat: parseFloat(data[0].lat),
          lng: parseFloat(data[0].lon),
        };
      }
      return null;
    } catch (error) {
      return null;
    }
  };

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookingForm.vehicleName || !bookingForm.vehicleNumber || !bookingForm.date || !bookingForm.time) {
      toast.error("Please fill all required fields");
      return;
    }
    if (bookingForm.requestPickup && (!bookingForm.pickupAddress || !bookingForm.dropoffAddress)) {
      toast.error("Please provide both pickup and dropoff addresses");
      return;
    }
    setSubmitting(true);
    try {
      const payload: any = {
        serviceId: bookingService?._id,
        bikeModel: `${bookingForm.vehicleName} (${bookingForm.vehicleNumber})`,
        date: `${bookingForm.date}T${bookingForm.time}`,
        notes: bookingForm.description,
      };

      // Add pickup/dropoff details if requested
      if (bookingForm.requestPickup) {
        // Geocode addresses if coordinates are not set
        let pickupCoords = bookingForm.pickupCoordinates;
        let dropoffCoords = bookingForm.dropoffCoordinates;

        if (pickupCoords.lat === 0 && pickupCoords.lng === 0) {
          const coords = await geocodeAddress(bookingForm.pickupAddress);
          if (coords) pickupCoords = coords;
        }

        if (dropoffCoords.lat === 0 && dropoffCoords.lng === 0) {
          const coords = await geocodeAddress(bookingForm.dropoffAddress);
          if (coords) dropoffCoords = coords;
        }

        payload.requestedPickupDropoff = true;
        payload.pickupAddress = bookingForm.pickupAddress;
        payload.dropoffAddress = bookingForm.dropoffAddress;
        payload.pickupCoordinates = pickupCoords;
        payload.dropoffCoordinates = dropoffCoords;
      }

      await api.post("/user/bookings", payload);
      toast.success("Booking created successfully! You can track it in 'My Bookings'.");
      setBookingService(null);
      setBookingForm({ 
        vehicleName: "", 
        vehicleNumber: "", 
        date: "", 
        time: "", 
        description: "", 
        requestPickup: false, 
        pickupAddress: "", 
        dropoffAddress: "",
        pickupCoordinates: { lat: 0, lng: 0 },
        dropoffCoordinates: { lat: 0, lng: 0 },
      });
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error.response?.data?.message || "Failed to create booking");
    } finally {
      setSubmitting(false);
    }
  };

  const filtered = services.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.category?.toLowerCase().includes(search.toLowerCase())
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
          <h1 className="text-3xl font-bold text-dark">Our Services</h1>
          <p className="text-gray mt-1 text-lg">Find and book the best care for your vehicle.</p>
        </div>
        <div className="relative w-full md:w-80">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray" />
          <input
            type="text"
            placeholder="Search for a service..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-12 pr-4 py-3 border border-gray-border rounded-full text-base bg-white focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
          />
        </div>
      </div>

      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filtered.map((service) => (
            <Card key={service._id} hover>
              <div className="flex flex-col h-full">
                {/* Service Image */}
                {service.image ? (
                  <div className="w-full h-48 mb-4 rounded-lg overflow-hidden bg-gray-100">
                    <img 
                      src={`${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '')}/${service.image}`} 
                      alt={service.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-full h-48 mb-4 rounded-lg overflow-hidden bg-primary/10 flex items-center justify-center">
                    <Wrench className="h-16 w-16 text-primary/40" />
                  </div>
                )}
                
                <div className="flex-grow">
                  <div className="mb-4">
                    <h3 className="font-bold text-lg text-dark">{service.name}</h3>
                    {service.category && (
                      <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-1 rounded-full mt-1 inline-block">
                        {service.category}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray mb-4 line-clamp-3 flex-grow">{service.description}</p>
                </div>
                <div className="mt-auto">
                  <div className="flex items-baseline justify-between mb-4">
                    <span className="text-2xl font-bold text-primary">Rs. {service.price}</span>
                    {service.duration && (
                      <span className="text-sm text-gray flex items-center gap-1.5">
                        <Clock className="h-4 w-4" /> {service.duration}
                      </span>
                    )}
                  </div>
                  <Button size="md" onClick={() => setBookingService(service)} className="w-full">
                    Book Now
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <div className="text-center py-20">
            <Search className="h-20 w-20 text-gray-border mx-auto mb-6" />
            <h3 className="text-xl font-semibold text-dark">No Services Found</h3>
            <p className="text-gray mt-2 max-w-sm mx-auto">
              Your search for &quot;{search}&quot; did not match any of our services. Try a different search term.
            </p>
          </div>
        </Card>
      )}

      {/* Booking Modal */}
      {bookingService && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
          <Card className="max-w-lg w-full max-h-[90vh] overflow-y-auto animate-scale-in">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-dark">Book Service</h2>
                <p className="text-gray">{bookingService.name} - <span className="font-bold text-primary">Rs. {bookingService.price}</span></p>
              </div>
              <button onClick={() => setBookingService(null)} className="text-gray hover:text-dark p-2 rounded-full hover:bg-gray-light transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleBooking} className="space-y-4">
              <Input
                label="Vehicle Name *"
                placeholder="e.g. Yamaha FZ 250"
                value={bookingForm.vehicleName}
                onChange={(e) => setBookingForm({ ...bookingForm, vehicleName: e.target.value })}
                icon={<Car className="h-4 w-4 text-gray" />}
              />
              <Input
                label="Vehicle Number *"
                placeholder="e.g. BA 2 PA 5555"
                value={bookingForm.vehicleNumber}
                onChange={(e) => setBookingForm({ ...bookingForm, vehicleNumber: e.target.value })}
                icon={<Hash className="h-4 w-4 text-gray" />}
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Appointment Date *"
                  type="date"
                  value={bookingForm.date}
                  onChange={(e) => setBookingForm({ ...bookingForm, date: e.target.value })}
                  icon={<Calendar className="h-4 w-4 text-gray" />}
                />
                <Input
                  label="Appointment Time *"
                  type="time"
                  value={bookingForm.time}
                  onChange={(e) => setBookingForm({ ...bookingForm, time: e.target.value })}
                  icon={<Clock className="h-4 w-4 text-gray" />}
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-dark flex items-center gap-2">
                  <Info className="h-4 w-4 text-gray" />
                  Problem Description <span className="text-gray text-xs">(Optional)</span>
                </label>
                <textarea
                  placeholder="Briefly describe the issue with your vehicle..."
                  value={bookingForm.description}
                  onChange={(e) => setBookingForm({ ...bookingForm, description: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-border rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-vertical transition-all"
                  rows={4}
                />
              </div>

              {/* Pick-up & Drop-off Service */}
              <div className="border-t border-gray-border pt-4 space-y-4">
                <label className="flex items-start gap-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={bookingForm.requestPickup}
                    onChange={(e) => setBookingForm({ ...bookingForm, requestPickup: e.target.checked })}
                    className="mt-1 w-5 h-5 text-primary border-gray-border rounded focus:ring-2 focus:ring-primary/20 cursor-pointer"
                  />
                  <div className="flex-1">
                    <span className="text-sm font-medium text-dark group-hover:text-primary transition-colors">
                      Pick-up & Drop-off Service
                    </span>
                    <p className="text-xs text-gray mt-0.5">
                      Request Pick-up and Drop-off (Rs. 50 per km)
                    </p>
                  </div>
                </label>

                {bookingForm.requestPickup && (
                  <div className="space-y-4 pl-8 animate-fade-in">
                    {/* Pickup Address */}
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-dark">
                        Pickup Address *
                      </label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray" />
                        <input
                          type="text"
                          placeholder="Enter pickup address"
                          value={bookingForm.pickupAddress}
                          onChange={(e) => setBookingForm({ ...bookingForm, pickupAddress: e.target.value })}
                          className="w-full pl-10 pr-12 py-2.5 border border-gray-border rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                        />
                        <button
                          type="button"
                          onClick={() => fetchUserLocation('pickup')}
                          disabled={fetchingLocation === 'pickup'}
                          className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-primary hover:bg-primary/10 rounded-lg transition-colors disabled:opacity-50"
                          title="Use current location"
                        >
                          {fetchingLocation === 'pickup' ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <MapPin className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Dropoff Address */}
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-dark">
                        Dropoff Address *
                      </label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray" />
                        <input
                          type="text"
                          placeholder="Enter dropoff address"
                          value={bookingForm.dropoffAddress}
                          onChange={(e) => setBookingForm({ ...bookingForm, dropoffAddress: e.target.value })}
                          className="w-full pl-10 pr-12 py-2.5 border border-gray-border rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                        />
                        <button
                          type="button"
                          onClick={() => fetchUserLocation('dropoff')}
                          disabled={fetchingLocation === 'dropoff'}
                          className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-primary hover:bg-primary/10 rounded-lg transition-colors disabled:opacity-50"
                          title="Use current location"
                        >
                          {fetchingLocation === 'dropoff' ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <MapPin className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                      <p className="text-xs text-gray">
                        You can manually enter or change the dropoff location
                      </p>
                    </div>

                    {/* Total Amount Display */}
                    <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-dark">Service Price:</span>
                        <span className="text-sm text-dark">Rs. {bookingService.price}</span>
                      </div>
                      <div className="flex items-center justify-between mt-2 pt-2 border-t border-primary/10">
                        <span className="text-base font-bold text-dark">Total Amount:</span>
                        <span className="text-lg font-bold text-primary">Rs. {bookingService.price}</span>
                      </div>
                      <p className="text-xs text-gray mt-2">
                        * Pick-up/Drop-off charges will be calculated based on actual distance
                      </p>
                    </div>
                  </div>
                )}
              </div>
              <div className="flex flex-col-reverse sm:flex-row gap-3 pt-4">
                <Button type="button" variant="secondary" onClick={() => setBookingService(null)} className="w-full">
                  Cancel
                </Button>
                <Button type="submit" loading={submitting} className="w-full">
                  Confirm Booking
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}
