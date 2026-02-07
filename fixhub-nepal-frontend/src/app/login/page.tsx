"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import toast from "react-hot-toast";
import { Wrench, Eye, EyeOff, ArrowRight, ShieldCheck, Zap, Star } from "lucide-react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const router = useRouter();
  const { login } = useAuth();

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Please enter both email and password.");
      return;
    }
    setIsLoading(true);
    try {
      const user = await login(email, password);
      toast.success("Welcome back! Redirecting...");
      router.push(user.role === 'admin' ? "/admin/dashboard" : "/user/dashboard");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Login failed.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden bg-slate-950">
      {/* --- Animated Background Elements --- */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-primary/20 blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-blue-600/20 blur-[120px] animate-pulse delay-700" />
        <div className="absolute inset-0 opacity-[0.15] bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />
      </div>

      <div className="container relative z-10 flex flex-col lg:flex-row items-center justify-center gap-12 px-6">
        
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
            Elevate your <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-orange-400 italic">Auto Experience.</span>
          </h2>

          <div className="grid grid-cols-1 gap-6">
            <div className="flex items-start gap-4 p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
              <div className="mt-1 bg-emerald-500/20 p-2 rounded-lg"><ShieldCheck className="text-emerald-400 h-5 w-5" /></div>
              <div>
                <h4 className="font-bold text-white">Secure Access</h4>
                <p className="text-slate-400 text-sm">Industry standard encryption for all your data.</p>
              </div>
            </div>
            <div className="flex items-start gap-4 p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
              <div className="mt-1 bg-blue-500/20 p-2 rounded-lg"><Zap className="text-blue-400 h-5 w-5" /></div>
              <div>
                <h4 className="font-bold text-white">Instant Booking</h4>
                <p className="text-slate-400 text-sm">Get your vehicle serviced in a few clicks.</p>
              </div>
            </div>
          </div>
        </div>

        {/* --- RIGHT SIDE: The Glass Login Card --- */}
        <div className="w-full max-w-[480px] animate-in zoom-in-95 duration-700">
          <div className="bg-white rounded-[2.5rem] p-8 lg:p-12 shadow-2xl relative overflow-hidden">
            {/* Mobile Logo Only */}
            <div className="lg:hidden flex justify-center mb-8">
               <div className="flex items-center gap-2">
                 <Wrench className="h-6 w-6 text-primary" />
                 <span className="text-xl font-bold">FixhubNepal</span>
               </div>
            </div>

            <div className="mb-10 text-center lg:text-left">
              <h1 className="text-4xl font-black text-slate-900 tracking-tight">Welcome Back</h1>
              <p className="text-slate-500 mt-2 font-medium">Please enter your details to sign in.</p>
            </div>

            <form className="space-y-6" onSubmit={handleLogin}>
              <div className="space-y-2">
                <Input 
                  label="Email Address" 
                  type="email" 
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                  className="rounded-xl border-slate-200 focus:ring-primary/20"
                />
              </div>
              
              <div className="relative space-y-2">
                <Input
                  label="Password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                  className="rounded-xl border-slate-200 focus:ring-primary/20"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 bottom-3 text-slate-400 hover:text-primary transition-colors h-10 flex items-center"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer group">
                  <input type="checkbox" className="w-4 h-4 rounded border-slate-300 text-primary focus:ring-primary transition-all" />
                  <span className="text-sm text-slate-600 group-hover:text-slate-900">Remember me</span>
                </label>
                <Link href="/forgot-password" className="text-sm font-bold text-primary hover:text-red-700 transition-colors">
                  Forgot password?
                </Link>
              </div>

              <Button 
                type="submit" 
                className="w-full h-14 bg-primary hover:bg-red-600 text-white rounded-2xl font-bold text-lg shadow-lg shadow-red-500/30 transition-all hover:translate-y-[-2px] active:translate-y-0" 
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Processing...</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-2">
                    <span>Sign In</span>
                    <ArrowRight className="h-5 w-5" />
                  </div>
                )}
              </Button>
            </form>

            <div className="mt-8 pt-8 border-t border-slate-100 text-center">
              <p className="text-slate-500 font-medium">
                Don't have an account?{" "}
                <Link href="/register" className="text-primary font-bold hover:underline">
                  Join Fixhub Today
                </Link>
              </p>
            </div>
          </div>
          
          {/* Decorative small element */}
          <div className="mt-6 flex justify-center gap-4 text-slate-500">
             <div className="flex items-center gap-1 text-[10px] uppercase tracking-widest font-bold">
               <Star className="h-3 w-3 text-amber-400 fill-amber-400" />
               Rated 4.9/5 by Users
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}