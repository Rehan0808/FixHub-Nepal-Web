import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Link from "next/link";
import { Wrench, Shield, Clock, Star, CheckCircle, ArrowRight, Phone, Play, Settings, Car } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-white selection:bg-primary selection:text-white">
      <Navbar />

      {/* HERO SECTION - Using a Mesh Gradient for Depth */}
      <section className="relative pt-44 pb-32 overflow-hidden">
        {/* Decorative Background Elements */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[800px] -z-10 opacity-40">
           <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary/20 rounded-full blur-[120px]"></div>
           <div className="absolute bottom-[10%] right-[-5%] w-[40%] h-[40%] bg-accent/20 rounded-full blur-[120px]"></div>
        </div>

        <div className="container-custom">
          <div className="flex flex-col items-center text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-dark text-white rounded-full px-5 py-2 mb-8 animate-fade-in shadow-xl">
              <span className="bg-primary w-2 h-2 rounded-full animate-pulse"></span>
              <span className="text-xs font-bold tracking-widest uppercase">Nepal's Most Trusted Network</span>
            </div>

            <h1 className="text-6xl lg:text-[100px] font-black text-dark leading-[0.9] tracking-tighter mb-8">
              Reliable Care. <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">Precision</span> Repair.
            </h1>

            <p className="text-xl text-gray-500 max-w-2xl leading-relaxed mb-10">
              Fixhub connects you with certified master mechanics across Nepal. 
              Real-time tracking, transparent pricing, and premium service delivery.
            </p>

            <div className="flex flex-col sm:flex-row gap-5">
              <Link href="/register" className="group bg-dark text-white px-10 py-5 rounded-2xl font-bold text-lg flex items-center gap-3 hover:bg-primary transition-all duration-300 shadow-2xl">
                Book Service
                <ArrowRight className="group-hover:translate-x-1 transition-transform" />
              </Link>
              <button className="group bg-white border border-gray-200 text-dark px-10 py-5 rounded-2xl font-bold text-lg flex items-center gap-3 hover:bg-gray-50 transition-all">
                <div className="bg-gray-100 p-1 rounded-full"><Play size={18} className="fill-current" /></div>
                How it works
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* TRUST BAR */}
      <div className="container-custom pb-24">
         <p className="text-center text-xs font-bold text-gray-400 uppercase tracking-[0.3em] mb-10">Supporting all major makes</p>
         <div className="flex flex-wrap justify-center gap-12 opacity-30 grayscale">
            <span className="text-2xl font-black">TOYOTA</span>
            <span className="text-2xl font-black">HYUNDAI</span>
            <span className="text-2xl font-black">SUZUKI</span>
            <span className="text-2xl font-black">MAHINDRA</span>
            <span className="text-2xl font-black">TATA</span>
         </div>
      </div>

      {/* FEATURES - Bento Grid Style */}
      <section className="py-32 bg-gray-50">
        <div className="container-custom">
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white p-12 rounded-[2.5rem] border border-gray-200 shadow-sm flex flex-col justify-between group hover:border-primary/50 transition-colors">
              <div>
                 <div className="bg-primary/10 w-16 h-16 rounded-2xl flex items-center justify-center mb-8">
                    <Settings className="text-primary h-8 w-8" />
                 </div>
                 <h2 className="text-4xl font-bold text-dark mb-4">Precision Diagnostics</h2>
                 <p className="text-gray-500 text-lg max-w-md">Our mechanics use industry-leading scanners and tools to pinpoint issues with 99.9% accuracy.</p>
              </div>
              <div className="mt-12 flex gap-4">
                 <div className="h-2 w-24 bg-primary rounded-full"></div>
                 <div className="h-2 w-12 bg-gray-200 rounded-full"></div>
                 <div className="h-2 w-12 bg-gray-200 rounded-full"></div>
              </div>
            </div>

            <div className="bg-dark p-12 rounded-[2.5rem] text-white flex flex-col justify-between">
               <Star className="text-accent h-12 w-12 fill-accent" />
               <div>
                  <h3 className="text-3xl font-bold mb-4">4.9/5 Rating</h3>
                  <p className="text-gray-400">Join over 5,000+ vehicle owners who have rated our service as exceptional.</p>
               </div>
            </div>

            <div className="bg-white border border-gray-200 p-10 rounded-[2.5rem] hover:shadow-xl transition-shadow">
               <Shield className="text-primary h-10 w-10 mb-6" />
               <h3 className="text-xl font-bold mb-2">Parts Warranty</h3>
               <p className="text-gray-500">Every single nut and bolt replaced comes with a 12-month guarantee.</p>
            </div>
            
            <div className="bg-white border border-gray-200 p-10 rounded-[2.5rem] hover:shadow-xl transition-shadow">
               <Clock className="text-primary h-10 w-10 mb-6" />
               <h3 className="text-xl font-bold mb-2">Doorstep Pickup</h3>
               <p className="text-gray-500">We pick up your car and drop it back once the job is finished.</p>
            </div>

            <div className="bg-white border border-gray-200 p-10 rounded-[2.5rem] hover:shadow-xl transition-shadow">
               <Car className="text-primary h-10 w-10 mb-6" />
               <h3 className="text-xl font-bold mb-2">Live Tracking</h3>
               <p className="text-gray-500">Watch the progress of your repair through our live dashboard.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA SECTION - Full Width "Impact" Style */}
      <section className="py-24">
        <div className="container-custom">
          <div className="relative bg-dark rounded-[3rem] p-12 lg:p-24 overflow-hidden">
            <div className="absolute top-0 right-0 w-1/2 h-full bg-primary/20 blur-[100px]"></div>
            <div className="relative z-10 grid lg:grid-cols-2 items-center gap-12">
               <div>
                  <h2 className="text-4xl lg:text-6xl font-bold text-white leading-tight mb-8">
                    Your car deserves <br /> a better doctor.
                  </h2>
                  <div className="flex gap-4">
                    <Link href="/register" className="bg-primary text-white px-8 py-4 rounded-xl font-bold hover:scale-105 transition-transform">
                      Get Started
                    </Link>
                    <Link href="/contact" className="border border-white/20 text-white px-8 py-4 rounded-xl font-bold hover:bg-white/10 transition-colors">
                      Talk to Expert
                    </Link>
                  </div>
               </div>
               <div className="hidden lg:block border-l border-white/10 pl-12">
                  <div className="space-y-8">
                     {[
                        { val: "100%", label: "Genuine Spares" },
                        { val: "24/7", label: "Roadside Assistance" },
                        { val: "Free", label: "First Consultation" }
                     ].map((stat, i) => (
                        <div key={i} className="flex items-baseline gap-4">
                           <span className="text-5xl font-black text-primary">{stat.val}</span>
                           <span className="text-gray-400 font-bold uppercase tracking-wider">{stat.label}</span>
                        </div>
                     ))}
                  </div>
               </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}