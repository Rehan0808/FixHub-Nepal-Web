"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Wrench, Eye, EyeOff, ArrowRight, ShieldCheck, Check, Star, Zap } from "lucide-react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import toast from "react-hot-toast";

export default function RegisterPage() {
  const { register } = useAuth();
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !email || !password || !confirmPassword) {
      toast.error("Please fill all fields");
      return;
    }
    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    setLoading(true);
    try {
      await register(fullName, email, password);
      toast.success("Account created successfully!");
      router.push("/user/dashboard");
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden bg-slate-950">
      {/* --- Animated Background Elements (Matches Login) --- */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
        <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-primary/20 blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-600/20 blur-[120px] animate-pulse delay-700" />
        <div className="absolute inset-0 opacity-[0.15] bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />
      </div>

      <div className="container relative z-10 flex flex-col lg:flex-row items-center justify-center gap-12 px-6 py-10">
        
        {/* --- LEFT SIDE: Brand Value Prop --- */}
        <div className="hidden lg:flex flex-col max-w-lg text-white space-y-8 animate-in slide-in-from-left-8 duration-1000">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="bg-primary p-3 rounded-2xl shadow-[0_0_20px_rgba(239,68,68,0.4)] group-hover:scale-110 transition-transform">
              <Wrench className="h-8 w-8 text-white" />
            </div>
            <span className="text-3xl font-black tracking-tighter">
              Fixhub<span className="text-primary">Nepal</span>
            </span>
          </Link>

          <h2 className="text-6xl font-bold leading-tight">
            Join the <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-orange-400 italic">Future of Repair.</span>
          </h2>

          <div className="space-y-4">
            {[
              { icon: ShieldCheck, title: "Verified Experts", desc: "Access to Nepal's top certified mechanics.", color: "bg-emerald-500/20", text: "text-emerald-400" },
              { icon: Zap, title: "Express Service", desc: "Skip the queue with digital booking.", color: "bg-blue-500/20", text: "text-blue-400" }
            ].map((feature, idx) => (
              <div key={idx} className="flex items-start gap-4 p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
                <div className={`mt-1 ${feature.color} p-2 rounded-lg`}><feature.icon className={`${feature.text} h-5 w-5`} /></div>
                <div>
                  <h4 className="font-bold text-white">{feature.title}</h4>
                  <p className="text-slate-400 text-sm">{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-4 px-2">
            <div className="flex -space-x-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="w-10 h-10 rounded-full border-2 border-slate-800 bg-slate-700" />
              ))}
            </div>
            <p className="text-sm font-medium text-slate-400 italic">Join 5,000+ vehicle owners in Nepal</p>
          </div>
        </div>

        {/* --- RIGHT SIDE: The Glass Registration Card --- */}
        <div className="w-full max-w-[520px] animate-in zoom-in-95 duration-700">
          <div className="bg-white rounded-[2.5rem] p-8 lg:p-10 shadow-2xl relative overflow-hidden">
            
            <div className="mb-8 text-center lg:text-left">
              <h1 className="text-4xl font-black text-slate-900 tracking-tight">Create Account</h1>
              <p className="text-slate-500 mt-2 font-medium">Join us and start tracking your repairs.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Full Name"
                type="text"
                placeholder="John Doe"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                disabled={loading}
                className="rounded-xl border-slate-200 focus:ring-primary/20"
              />
              
              <Input
                label="Email Address"
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                className="rounded-xl border-slate-200 focus:ring-primary/20"
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="relative">
                  <Input
                    label="Password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={loading}
                    className="rounded-xl border-slate-200 focus:ring-primary/20"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 bottom-3 text-slate-400 hover:text-primary h-10 flex items-center"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                <Input
                  label="Confirm"
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={loading}
                  className="rounded-xl border-slate-200 focus:ring-primary/20"
                />
              </div>

              <div className="flex items-start gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <input type="checkbox" required className="mt-1 w-4 h-4 rounded text-primary border-slate-300 focus:ring-primary transition-all" />
                <span className="text-[11px] text-slate-500 leading-tight">
                  By signing up, I agree to the <Link href="/terms" className="text-primary font-bold hover:underline">Terms</Link> and <Link href="/privacy" className="text-primary font-bold hover:underline">Privacy Policy</Link>.
                </span>
              </div>

              <Button 
                type="submit" 
                loading={loading}
                className="w-full h-14 bg-primary hover:bg-red-600 text-white rounded-2xl font-bold text-lg shadow-lg shadow-red-500/30 transition-all hover:translate-y-[-1px]" 
              >
                {!loading && (
                  <div className="flex items-center justify-center gap-2">
                    <span>Create Account</span>
                    <ArrowRight className="h-5 w-5" />
                  </div>
                )}
              </Button>
            </form>

            <div className="mt-8 pt-6 border-t border-slate-100 text-center">
              <p className="text-slate-500 font-medium text-sm">
                Already part of the hub?{" "}
                <Link href="/login" className="text-primary font-bold hover:underline">
                  Log in here
                </Link>
              </p>
            </div>
          </div>
          
          <div className="mt-6 flex justify-center">
             <div className="flex items-center gap-1 text-[10px] uppercase tracking-widest font-bold text-slate-500">
               <Star className="h-3 w-3 text-amber-400 fill-amber-400" />
               Trusted by 500+ Local Businesses
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}