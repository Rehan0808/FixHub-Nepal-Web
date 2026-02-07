"use client";

import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { MapPin, Phone, Mail, Clock } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";

export default function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Message sent! We'll get back to you soon.");
    setForm({ name: "", email: "", subject: "", message: "" });
  };

  return (
    <div className="min-h-screen">
      <Navbar />

      <section className="bg-dark text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl font-bold mb-4">Contact Us</h1>
          <p className="text-gray max-w-2xl mx-auto">
            Have a question or need help? We&apos;d love to hear from you.
          </p>
        </div>
      </section>

      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            {/* Contact Info */}
            <div>
              <h2 className="text-2xl font-bold text-dark mb-8">Get in Touch</h2>
              <div className="space-y-6">
                {[
                  { icon: MapPin, title: "Address", info: "Kathmandu, Nepal" },
                  { icon: Phone, title: "Phone", info: "+977-9800000000" },
                  { icon: Mail, title: "Email", info: "info@fixhubnepal.com" },
                  { icon: Clock, title: "Hours", info: "Sun-Fri: 8AM - 6PM" },
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-4">
                    <div className="bg-primary/10 p-3 rounded-xl">
                      <item.icon className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-dark">{item.title}</h3>
                      <p className="text-gray text-sm">{item.info}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Form */}
            <div className="bg-white border border-gray-border rounded-2xl p-8">
              <h2 className="text-xl font-bold text-dark mb-6">Send a Message</h2>
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <Input label="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Your name" />
                  <Input label="Email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="you@email.com" />
                </div>
                <Input label="Subject" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} placeholder="How can we help?" />
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-dark">Message</label>
                  <textarea
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
                    rows={5}
                    placeholder="Tell us more..."
                  />
                </div>
                <Button type="submit" size="lg" className="w-full">Send Message</Button>
              </form>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
