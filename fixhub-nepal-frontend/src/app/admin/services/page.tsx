"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { Service } from "@/types";
import { Wrench, Plus, Edit2, Trash2, X, DollarSign, Clock, Tag, Info, Upload, Image as ImageIcon } from "lucide-react";
import toast from "react-hot-toast";

export default function AdminServices() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Service | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    duration: "",
    category: "",
  });

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      const res = await api.get("/admin/services");
      setServices(res.data.data || res.data.services || []);
    } catch {
      toast.error("Failed to load services");
    } finally {
      setLoading(false);
    }
  };

  const openCreate = () => {
    setEditing(null);
    setForm({ name: "", description: "", price: "", duration: "", category: "" });
    setImageFile(null);
    setImagePreview(null);
    setShowModal(true);
  };

  const openEdit = (service: Service) => {
    setEditing(service);
    setForm({
      name: service.name,
      description: service.description,
      price: service.price.toString(),
      duration: service.duration || "",
      category: service.category || "",
    });
    setImageFile(null);
    setImagePreview(service.image ? `${process.env.NEXT_PUBLIC_API_URL}/${service.image}` : null);
    setShowModal(true);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.description || !form.price) {
      toast.error("Please fill all required fields.");
      return;
    }
    if (!editing && !imageFile) {
      toast.error("Please upload a service image.");
      return;
    }
    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("name", form.name);
      formData.append("description", form.description);
      formData.append("price", form.price);
      if (form.duration) formData.append("duration", form.duration);
      if (form.category) formData.append("category", form.category);
      if (imageFile) formData.append("image", imageFile);

      if (editing) {
        await api.put(`/admin/services/${editing._id}`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        toast.success("Service updated successfully!");
      } else {
        await api.post("/admin/services", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        toast.success("Service created successfully!");
      }
      setShowModal(false);
      fetchServices();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "The operation failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const deleteService = async (id: string) => {
    if (!window.confirm("Are you sure you want to permanently delete this service? This action cannot be undone.")) return;
    try {
      await api.delete(`/admin/services/${id}`);
      toast.success("Service deleted successfully.");
      fetchServices();
    } catch {
      toast.error("Failed to delete the service.");
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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-dark">Manage Services</h1>
          <p className="text-gray mt-1 text-lg">Add, edit, or remove vehicle services.</p>
        </div>
        <Button onClick={openCreate} size="md">
          <Plus className="h-5 w-5 mr-2" /> Add New Service
        </Button>
      </div>

      {services.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {services.map((service) => (
            <Card key={service._id} hover className="flex flex-col">
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
                <div className="flex items-start justify-between mb-4">
                  {service.category && (
                    <span className="text-xs font-medium text-primary bg-primary/10 px-2.5 py-1 rounded-full">{service.category}</span>
                  )}
                </div>
                <h3 className="font-bold text-lg text-dark mb-2">{service.name}</h3>
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
                <div className="flex items-center gap-2 pt-4 border-t border-gray-border">
                  <Button variant="outline" size="sm" onClick={() => openEdit(service)} className="w-full">
                    <Edit2 className="h-4 w-4 mr-2" /> Edit
                  </Button>
                  <Button variant="danger" size="sm" onClick={() => deleteService(service._id)} className="w-full">
                    <Trash2 className="h-4 w-4 mr-2" /> Delete
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <div className="text-center py-20">
            <Wrench className="h-20 w-20 text-gray-border mx-auto mb-6" />
            <h3 className="text-xl font-semibold text-dark">No Services Yet</h3>
            <p className="text-gray mt-2 mb-6">Click "Add New Service" to get started.</p>
            <Button onClick={openCreate}>
              <Plus className="h-4 w-4 mr-2" /> Add New Service
            </Button>
          </div>
        </Card>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
          <Card className="max-w-lg w-full max-h-[90vh] overflow-y-auto animate-scale-in">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-dark">{editing ? "Edit Service" : "Create a New Service"}</h2>
                <p className="text-gray">Fill in the details below.</p>
              </div>
              <button onClick={() => setShowModal(false)} className="text-gray hover:text-dark p-2 rounded-full hover:bg-gray-light transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Image Upload */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-dark flex items-center gap-2">
                  <ImageIcon className="h-4 w-4 text-gray" /> Service Image *
                </label>
                <div className="flex items-center gap-4">
                  {imagePreview && (
                    <div className="relative w-24 h-24 rounded-lg overflow-hidden border-2 border-gray-border">
                      <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                    </div>
                  )}
                  <label className="flex-1 cursor-pointer">
                    <div className="border-2 border-dashed border-gray-border rounded-lg p-4 hover:border-primary transition-colors text-center">
                      <Upload className="h-8 w-8 text-gray mx-auto mb-2" />
                      <p className="text-sm text-gray">{imageFile ? imageFile.name : editing ? "Change image (optional)" : "Click to upload image"}</p>
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>
              <Input label="Service Name *" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g., Full Engine Overhaul" icon={<Wrench className="h-4 w-4 text-gray" />} />
              <div className="space-y-2">
                <label className="block text-sm font-medium text-dark flex items-center gap-2">
                  <Info className="h-4 w-4 text-gray" /> Description *
                </label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-border rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-vertical transition-all"
                  rows={4}
                  placeholder="Provide a detailed description of the service..."
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input label="Price (Rs.) *" type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} icon={<DollarSign className="h-4 w-4 text-gray" />} />
                <Input label="Estimated Duration" value={form.duration} onChange={(e) => setForm({ ...form, duration: e.target.value })} placeholder="e.g., 2-3 hours" icon={<Clock className="h-4 w-4 text-gray" />} />
              </div>
              <Input label="Category" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} placeholder="e.g., Engine, Electrical, Body" icon={<Tag className="h-4 w-4 text-gray" />} />
              <div className="flex flex-col-reverse sm:flex-row gap-3 pt-4">
                <Button type="button" variant="secondary" onClick={() => setShowModal(false)} className="w-full">Cancel</Button>
                <Button type="submit" loading={submitting} className="w-full">{editing ? "Update Service" : "Create Service"}</Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}
