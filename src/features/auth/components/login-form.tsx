"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";
import { useLogin } from "@/features/auth/hooks/use-login";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export default function LoginForm() {
  const { form, onSubmit, isPending } = useLogin();
  const { formState: { errors } } = form;
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="relative z-10 w-full ml-auto max-w-[580px] lg:max-w-[620px] h-full bg-[#0C1116]/60 backdrop-blur-[8px] rounded-[20px] p-6 lg:p-10 border border-white/5 shadow-2xl flex flex-col items-center justify-center overflow-hidden transition-all duration-300">
      {/* Background Ellipse Image matching Figma design */}
      <Image
        src="/images/auth-ellipse.png"
        alt=""
        fill
        className="object-cover pointer-events-none z-0"
      />

        {/* Form Container */}
        <div className="relative z-10 w-full max-w-[340px] flex flex-col items-center gap-6">
          
          {/* Brand Logo */}
          <div className="flex justify-center w-[170px]">
            <Image
              src="/images/logo.png"
              alt="Annuity Vault Logo"
              width={170}
              height={130}
              priority
              className="w-[170px] h-auto object-contain"
            />
          </div>

          {/* Heading Section */}
          <div className="flex flex-col items-center text-center gap-1.5 w-full">
            <h1 className="text-2xl lg:text-[30px] font-semibold leading-[36px] tracking-[-0.008em] text-white capitalize font-sans">
              Welcome Back
            </h1>
            <p className="text-xs lg:text-sm font-normal leading-[17px] tracking-[-0.014em] text-[#919191] font-sans">
              Please enter your details to log in.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={onSubmit} className="w-full flex flex-col gap-5">
            
            {/* Email Address Field */}
            <div className="flex flex-col gap-1.5 w-full">
              <Label 
                htmlFor="email" 
                className="text-xs font-medium text-white capitalize leading-[15px]"
              >
                Email Address <span className="text-destructive">*</span>
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter email address"
                {...form.register("email")}
                className={`h-[38px] w-full bg-[#141C24] border-0 rounded-[10px] px-3 text-xs text-white placeholder:text-[#919191] placeholder:text-xs focus-visible:ring-1 focus-visible:ring-[#66859E] ${errors.email ? "ring-1 ring-[#FF3E46]" : ""}`}
              />
              {errors.email && (
                <p className="text-[11px] font-medium text-[#FF3E46]">
                  {errors.email.message as string}
                </p>
              )}
            </div>

            {/* Password Field */}
            <div className="flex flex-col gap-1.5 w-full">
              <Label 
                htmlFor="password" 
                className="text-xs font-medium text-white capitalize leading-[15px]"
              >Password <span className="text-destructive">*</span></Label>
              <div className="relative w-full">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter password here"
                  {...form.register("password")}
                  className={`h-[38px] w-full bg-[#141C24] border-0 rounded-[10px] pl-3 pr-10 text-xs text-white placeholder:text-[#919191] placeholder:text-xs focus-visible:ring-1 focus-visible:ring-[#66859E] ${errors.password ? "ring-1 ring-[#FF3E46]" : ""}`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#919191] hover:text-white transition-colors"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="text-[11px] font-medium text-[#FF3E46]">
                  {errors.password.message as string}
                </p>
              )}

              {/* Forgot Password Link */}
              <div className="flex justify-end w-full mt-0.5">
                <Link
                  href="/auth/forgot-password"
                  className="text-[11px] font-normal text-[#0084FF] hover:underline leading-[14px] capitalize"
                >
                  Forgot Password?
                </Link>
              </div>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isPending}
              className="w-full h-[40px] bg-gradient-to-r from-[#66859E] to-[#849EB2] rounded-[10px] text-xs font-bold text-white capitalize hover:opacity-95 transition-opacity shadow-md border-0 mt-1"
            >
              Log In
            </Button>
          </form>

      </div>
    </div>
  );
}
