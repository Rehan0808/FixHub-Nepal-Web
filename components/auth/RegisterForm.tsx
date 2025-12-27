"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerSchema } from "@/schemas/registerSchema";
import { useRouter } from "next/navigation";
import Input from "../ui/Input";
import Button from "../ui/Button";
import Image from "next/image";
import Link from "next/link";

export default function RegisterForm() {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(registerSchema),
  });

  function onSubmit(data: any) {
    console.log(data);
    router.push("/login"); 
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 text-black">
      <div className="bg-white shadow-lg rounded-lg flex w-[900px] overflow-hidden">
        <div className="w-1/2 p-10 flex flex-col">
          <div className="flex items-center justify-center mb-8">
            <Image src="/logo.png" alt="FixHub Nepal logo" width={32} height={32} />
            <span className="ml-2 text-xl font-semibold">FixHub Nepal</span>
          </div>

          <h1 className="text-3xl font-semibold mb-2">Create Account</h1>
          <p className="text-gray-500 mb-8">Sign up to get started</p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Input label="First Name" register={register("firstName")} error={errors.firstName?.message as string} />
              <Input label="Last Name" register={register("lastName")} error={errors.lastName?.message as string} />
            </div>

            <Input label="Email" register={register("email")} error={errors.email?.message as string} />
            <Input label="Phone" register={register("phone")} error={errors.phone?.message as string} />
            <Input label="Address" register={register("address")} error={errors.address?.message as string} />

            <div className="grid grid-cols-2 gap-4">
              <Input label="Password" type="password" register={register("password")} error={errors.password?.message as string} />
              <Input label="Confirm Password" type="password" register={register("confirmPassword")} error={errors.confirmPassword?.message as string} />
            </div>

            <Button text="Create Account" />
          </form>

          <p className="mt-6 text-center text-sm">
            Already have an account?{" "}
            <Link href="/login" className="text-red-500 font-medium">
              Sign in
            </Link>
          </p>
        </div>

        <div className="w-1/2 hidden md:block relative">
          <Image src="/images/login.png" alt="Register" fill className="object-cover" />
        </div>
      </div>
    </div>
  );
}
