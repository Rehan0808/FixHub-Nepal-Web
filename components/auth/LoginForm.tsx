"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import Input from "../ui/Input";
import Button from "../ui/Button";
import Image from "next/image";
import Link from "next/link";

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export default function LoginForm() {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
  });

  function onSubmit(data: any) {
    console.log(data);
    router.push("/auth/dashboard");
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 text-black">
      <div className="bg-white shadow-lg rounded-lg flex w-[900px] overflow-hidden">
        
        {/* Left */}
        <div className="w-1/2 p-10 flex flex-col">
          {/* Logo + brand */}
          <div className="flex items-center justify-center mb-8">
            <Image
              src="/logo.png"
              alt="FixHub Nepal logo"
              width={32}
              height={32}
              className="mr-2"
            />
            <span className="text-xl font-semibold">FixHub Nepal</span>
          </div>

          {/* Headings */}
          <h1 className="text-3xl font-semibold mb-2">Welcome Back</h1>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 flex-1 mt-6">
            <div>
              <Input
                label="Email Address"
                register={register("email")}
                error={errors.email?.message as string}
              />
            </div>

            <div>
              <Input
                label="Password"
                type="password"
                register={register("password")}
                error={errors.password?.message as string}
              />
              <div className="mt-1 text-right text-sm text-red-500 cursor-pointer">
                Forgot password?
              </div>
            </div>

            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <input type="checkbox" id="remember" className="h-4 w-4" />
              <label htmlFor="remember">Remember me</label>
            </div>

            <div className="w-full mt-4 ">
              <Button text="Sign in" />
            </div>
          </form>

          {/* Footer link */}
          <p className="mt-6 text-center text-sm text-gray-600">
            Don&apos;t have an account?{' '}
            <Link
              href="/register"
              className="text-red-500 cursor-pointer font-medium"
            >
              Sign up here
            </Link>
          </p>
        </div>

        {/* Right (Image) */}
        <div className="w-1/2 relative hidden md:block">
          <Image
            src="/images/login.png"
            alt="Login illustration"
            fill
            className="object-cover"
            priority
          />
        </div>
        </div>
    </div>
  );
}
