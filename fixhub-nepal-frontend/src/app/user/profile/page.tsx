"use client";

import { useEffect, useState, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/api";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { 
  User as UserIcon, Mail, Phone, MapPin, 
  Camera, X, Edit3, Save, ShieldCheck, 
  Loader2, ImageIcon 
} from "lucide-react";
import toast from "react-hot-toast";
import { User } from "@/types";

export default function UserProfile() {
  const { user, updateUser } = useAuth();
  const [profile, setProfile] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  
  const [form, setForm] = useState({
    fullName: "",
    phone: "",
    address: "",
  });

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- Fetch Data ---
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get("/user/profile");
        const data = res.data.data || res.data.user || res.data;
        setProfile(data);
        setForm({
          fullName: data.fullName || "",
          phone: data.phone || "",
          address: data.address || "",
        });
      } catch {
        toast.error("Failed to load profile");
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  // --- Handlers ---
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleImageUpload = async () => {
    if (!imageFile) return;
    setSaving(true);
    const formData = new FormData();
    formData.append("profilePicture", imageFile);

    try {
      const res = await api.put("/user/profile", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      const updated = res.data.data || res.data.user || res.data;
      setProfile(updated);
      updateUser(updated);
      toast.success("Profile picture updated!");
      setImageFile(null);
      setImagePreview(null);
    } catch {
      toast.error("Failed to upload image.");
    } finally {
      setSaving(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await api.put("/user/profile", form);
      const updated = res.data.data || res.data.user || res.data;
      setProfile(updated);
      updateUser(updated);
      setEditing(false);
      toast.success("Profile updated!");
    } catch {
      toast.error("Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const InfoItem = ({ icon: Icon, label, value }: { icon: any, label: string, value: string | undefined }) => (
    <div className="group flex items-center p-4 bg-slate-50 rounded-xl border border-slate-100 hover:border-slate-200 transition-colors">
      <div className="h-10 w-10 rounded-full bg-white flex items-center justify-center text-slate-500 shadow-sm mr-4 group-hover:text-primary transition-colors">
        <Icon size={18} />
      </div>
      <div>
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{label}</p>
        <p className="text-slate-800 font-medium">{value || <span className="text-slate-300 italic">Not provided</span>}</p>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-3">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
        <p className="text-slate-400 font-medium animate-pulse">Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto pb-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* --- Profile Header Card --- */}
      <div className="relative mb-8">
        {/* Banner */}
        <div className="h-48 w-full bg-gradient-to-r from-slate-900 via-blue-900 to-slate-900 rounded-t-3xl overflow-hidden shadow-lg">
          <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
        </div>

        {/* Floating Info Section */}
        <div className="bg-white rounded-b-3xl shadow-sm border-x border-b border-slate-200 px-6 pb-6 pt-0 relative flex flex-col md:flex-row md:items-end gap-6">
          
          {/* Avatar - Negative Margin to pull it up */}
          <div className="-mt-16 flex-shrink-0 relative group">
            <div className="w-32 h-32 rounded-full border-4 border-white shadow-xl overflow-hidden bg-slate-100 relative">
               {profile && (profile as any).profilePicture ? (
                  <img
                    src={`${process.env.NEXT_PUBLIC_API_URL?.replace("/api", "")}/${(profile as any).profilePicture}`}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-slate-100 text-slate-300">
                    <UserIcon size={48} />
                  </div>
                )}
                
                {/* Hover Overlay for upload */}
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer backdrop-blur-sm"
                >
                  <Camera className="text-white h-8 w-8" />
                </div>
            </div>
            
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="absolute bottom-1 right-1 bg-primary text-white p-2 rounded-full shadow-lg hover:bg-blue-700 transition-transform hover:scale-105 md:hidden"
            >
              <Camera size={14} />
            </button>
            <input type="file" ref={fileInputRef} onChange={handleImageChange} accept="image/*" className="hidden" />
          </div>

          {/* Identity Info */}
          <div className="flex-1 pb-2 text-center md:text-left">
            <h1 className="text-3xl font-bold text-slate-900">{profile?.fullName}</h1>
            <p className="text-slate-500 font-medium flex items-center justify-center md:justify-start gap-2 mt-1">
              <Mail size={14} /> {profile?.email}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="pb-4 flex justify-center md:justify-end">
             {/* Role Badge */}
             <div className="px-4 py-2 bg-slate-100 text-slate-600 rounded-lg flex items-center gap-2 font-semibold text-sm border border-slate-200">
                <ShieldCheck size={16} className="text-emerald-500" />
                <span className="capitalize">{profile?.role} Account</span>
              </div>
          </div>
        </div>
      </div>

      {/* --- Main Content Grid --- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Col: Account Summary / Stats (Optional expansion) */}
        <div className="lg:col-span-1 space-y-6">
           <Card className="p-6 bg-slate-900 text-white border-none shadow-xl">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <ShieldCheck size={18} className="text-emerald-400"/> Account Status
              </h3>
              <p className="text-slate-300 text-sm mb-6">
                Your account is fully active. You have full access to booking vehicle services.
              </p>
              <div className="w-full h-px bg-slate-700 mb-6"></div>
              <div className="text-xs text-slate-400 uppercase tracking-widest font-semibold">Member ID</div>
              <div className="text-sm font-mono text-slate-200 mt-1 truncate">
                {profile?._id || "Loading..."}
              </div>
           </Card>
        </div>

        {/* Right Col: Details & Edit Form */}
        <div className="lg:col-span-2">
          <Card className="overflow-hidden border-slate-200 shadow-sm">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-white">
              <h3 className="text-lg font-bold text-slate-800">Personal Information</h3>
              {!editing && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setEditing(true)}
                  className="text-primary hover:text-blue-700 hover:bg-blue-50"
                >
                  <Edit3 className="h-4 w-4 mr-2" />
                  Edit Details
                </Button>
              )}
            </div>

            <div className="p-6 bg-white">
              {editing ? (
                <div className="space-y-5 animate-in fade-in duration-300">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <Input
                      label="Full Name"
                      value={form.fullName}
                      onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                      icon={<UserIcon className="h-4 w-4 text-slate-400" />}
                    />
                    <Input
                      label="Phone Number"
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      placeholder="+977-9800000000"
                      icon={<Phone className="h-4 w-4 text-slate-400" />}
                    />
                  </div>
                  <Input
                    label="Address"
                    value={form.address}
                    onChange={(e) => setForm({ ...form, address: e.target.value })}
                    placeholder="e.g. Kathmandu, Nepal"
                    icon={<MapPin className="h-4 w-4 text-slate-400" />}
                  />
                  
                  <div className="flex gap-3 justify-end pt-4 border-t border-slate-50 mt-4">
                    <Button variant="ghost" onClick={() => setEditing(false)}>Cancel</Button>
                    <Button loading={saving} onClick={handleSave} className="bg-primary hover:bg-blue-700 min-w-[120px]">
                      <Save className="h-4 w-4 mr-2" />
                      Save Changes
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <InfoItem icon={UserIcon} label="Full Name" value={profile?.fullName} />
                  <InfoItem icon={Mail} label="Email Address" value={profile?.email} />
                  <InfoItem icon={Phone} label="Phone Number" value={profile?.phone} />
                  <InfoItem icon={MapPin} label="Address" value={profile?.address} />
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>

      {/* --- Image Preview Modal (Glassmorphism) --- */}
      {imagePreview && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <Card className="max-w-sm w-full shadow-2xl border-none">
            <div className="p-6 text-center">
              <div className="w-16 h-16 bg-blue-50 text-primary rounded-full flex items-center justify-center mx-auto mb-4">
                <ImageIcon size={32} />
              </div>
              <h2 className="text-xl font-bold text-slate-900">Update Profile Photo</h2>
              <p className="text-slate-500 text-sm mt-2 mb-6">
                Are you sure you want to update your profile picture?
              </p>
              
              <div className="flex justify-center mb-6 relative">
                 <div className="p-1 border-2 border-dashed border-primary rounded-full">
                    <img src={imagePreview} alt="Preview" className="rounded-full w-32 h-32 object-cover" />
                 </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Button 
                    variant="outline" 
                    onClick={() => { setImagePreview(null); setImageFile(null); }}
                    className="w-full border-slate-200 text-slate-600"
                >
                  Cancel
                </Button>
                <Button 
                    loading={saving} 
                    onClick={handleImageUpload} 
                    className="w-full bg-primary hover:bg-blue-700"
                >
                  Confirm
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}