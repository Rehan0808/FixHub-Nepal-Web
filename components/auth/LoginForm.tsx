"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { loginUser } from "@/lib/auth";
import Input from "../ui/Input";
import Button from "../ui/Button";
import Image from "next/image";
import Link from "next/link";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
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

  const onSubmit = async (data: any) => {
    try {
      await loginUser(data); // backend sets httpOnly cookie

      // ✅ SET UI LOGIN STATE
      localStorage.setItem("isLoggedIn", "true");

      router.push("/"); // redirect to home
    } catch (error: any) {
      alert(error.response?.data?.message || "Login failed");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 text-black">
      <div className="bg-white shadow-lg rounded-lg flex w-[900px] overflow-hidden">
        <div className="w-1/2 p-10">
          <div className="flex justify-center mb-8">
            <Image src="/logo.png" alt="FixHub" width={32} height={32} />
            <span className="ml-2 text-xl font-semibold">FixHub Nepal</span>
          </div>

          <h1 className="text-3xl font-semibold mb-6">Welcome Back</h1>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
              label="Email"
              register={register("email")}
              error={errors.email?.message as string}
            />
            <Input
              label="Password"
              type="password"
              register={register("password")}
              error={errors.password?.message as string}
            />
            <Button text="Sign In" />
          </form>

          <p className="mt-6 text-center text-sm">
            Don't have an account?{" "}
            <Link href="/register" className="text-red-500 font-medium">
              Sign up
            </Link>
          </p>
        </div>

        <div className="w-1/2 hidden md:block relative">
          <Image
            src="/images/login.png"
            alt="Login"
            fill
            className="object-cover"
          />
        </div>
      </div>
    </div>
  );
}
