"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerSchema } from "@/schemas/registerSchema";
import Input from "../ui/Input";
import Button from "../ui/Button";
import Image from "next/image";
import Link from "next/link";

export default function RegisterForm() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(registerSchema),
  });

  function onSubmit(data: any) {
    console.log(data);
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
          <h1 className="text-3xl font-semibold mb-2">Create Account</h1>
          <p className="text-gray-500 mb-8">
            Sign up to get started with Fixhub Nepal
          </p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 flex-1">
            {/* Name row */}
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="First Name"
                register={register("firstName")}
                error={errors.firstName?.message as string}
              />
              <Input
                label="Last Name"
                register={register("lastName")}
                error={errors.lastName?.message as string}
              />
            </div>

            <Input
              label="Email Address"
              register={register("email")}
              error={errors.email?.message as string}
            />

            <Input
              label="Phone Number"
              register={register("phone")}
              error={errors.phone?.message as string}
            />

            <Input
              label="Address"
              register={register("address")}
              error={errors.address?.message as string}
            />

            {/* Password row */}
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Password"
                type="password"
                register={register("password")}
                error={errors.password?.message as string}
              />
              <Input
                label="Confirm Password"
                type="password"
                register={register("confirmPassword")}
                error={errors.confirmPassword?.message as string}
              />
            </div>

            {/* Terms checkbox */}
            <div className="flex items-center text-sm text-gray-600 mt-2">
              <input type="checkbox" id="terms" className="h-4 w-4 mr-2" />
              <label htmlFor="terms">
                I agree to the <span className="text-red-500">Terms of Service</span> and{' '}
                <span className="text-red-500">Privacy Policy</span>
              </label>
            </div>

            {/* Submit button */}
            <div className="w-full mt-4">
              <Button text="Create Account" />
            </div>
          </form>

          {/* Divider + footer */}
          <div className="mt-6 border-t border-gray-200 pt-4 text-center text-sm text-gray-600">
            <p>
              Already have an account?{' '}
              <Link href="/login" className="text-red-500 font-medium">
                Sign in here
              </Link>
            </p>
          </div>
        </div>

        {/* Right (Image) */}
        <div className="w-1/2 relative hidden md:block">
          <Image
            src="/images/login.png"
            alt="Register illustration"
            fill
            className="object-cover"
            priority
          />
        </div>
      </div>
    </div>
  );
}
