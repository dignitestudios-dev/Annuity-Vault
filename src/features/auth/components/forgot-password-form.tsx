"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Mail } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const forgotPasswordSchema = z.object({
  email: z.string().min(1, "Email is required").email("Invalid email address").max(100, "Email must be less than 100 characters"),
});
type ForgotPasswordData = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordForm() {
  const { register, handleSubmit, formState: { errors } } = useForm<ForgotPasswordData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" }
  });
  const [isSubmitted, setIsSubmitted] = useState(false);

  const onSubmit = (data: ForgotPasswordData) => {
    console.log("Forgot password data:", data);
    setIsSubmitted(true);
  };

  return (
    <div className="relative z-10 w-full ml-auto max-w-[580px] lg:max-w-[620px] h-full bg-[#0C1116]/60 backdrop-blur-[8px] rounded-[20px] p-6 lg:p-10 border border-white/5 shadow-2xl flex flex-col items-center justify-center overflow-hidden transition-all duration-300">
      {/* Background Ellipse Image matching Figma design */}
      <Image
        src="/images/auth-ellipse.png"
        alt=""
        fill
        className="object-cover pointer-events-none z-0 "
      />

      {/* Form Container */}
      <div className="relative z-10 w-full max-w-[340px] flex flex-col items-center transition-all duration-300">
        
        {!isSubmitted ? (
          <div className="w-full flex flex-col items-start gap-6 animate-in fade-in zoom-in-95 duration-300">
            {/* Back Arrow Button */}
            <Link
              href="/auth/login"
              className="w-8 h-8 rounded-full flex items-center justify-center text-white hover:bg-white/10 transition-colors -ml-1"
              aria-label="Back to login"
            >
              <ArrowLeft className="w-5 h-5 text-white" />
            </Link>

            {/* Heading Section */}
            <div className="flex flex-col items-start text-left gap-1.5 w-full">
              <h1 className="text-2xl lg:text-[30px] font-semibold leading-[36px] tracking-[-0.008em] text-white capitalize font-sans">
                Forgot Password
              </h1>
              <p className="text-xs lg:text-sm font-normal leading-[17px] tracking-[-0.014em] text-[#919191] font-sans">
                Please enter your registered email address.
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit(onSubmit)} className="w-full flex flex-col gap-5">
              
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
                  {...register("email")}
                  className={`h-[38px] w-full bg-[#141C24] border-0 rounded-[10px] px-3 text-xs text-white placeholder:text-[#919191] placeholder:text-xs focus-visible:ring-1 focus-visible:ring-[#66859E] ${errors.email ? "ring-1 ring-[#FF3E46]" : ""}`}
                />
                {errors.email && (
                  <p className="text-[11px] font-medium text-[#FF3E46]">
                    {errors.email.message}
                  </p>
                )}
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full h-[40px] bg-gradient-to-r from-[#66859E] to-[#849EB2] rounded-[10px] text-xs font-bold text-white capitalize hover:opacity-95 transition-opacity shadow-md border-0 mt-1"
              >
                Send OTP
              </Button>
            </form>
          </div>
        ) : (
          <div className="w-full flex flex-col items-center text-center gap-6 py-4 animate-in fade-in zoom-in-95 duration-300">
            
            {/* Circular Mail Icon Container */}
            <div className="w-24 h-24 sm:w-[110px] sm:h-[110px] rounded-full bg-[#0C1116] border border-white/5 flex items-center justify-center shadow-lg">
              <Mail className="w-10 h-10 sm:w-12 sm:h-12 text-[#6887A0] stroke-[1.75]" />
            </div>

            {/* Heading & Subtitle */}
            <div className="flex flex-col items-center text-center gap-2 w-full max-w-[348px]">
              <h1 className="text-2xl sm:text-[32px] font-semibold leading-[38px] tracking-[-0.008em] text-white capitalize font-sans">
                Check Your Email
              </h1>
              <p className="text-xs sm:text-sm font-normal leading-[19px] tracking-[-0.014em] text-[#919191] font-sans">
                We have sent a password recover instructions to your email.
              </p>
            </div>

            {/* Resend Code Button (Disabled State) */}
            <Button
              disabled
              className="w-full h-[40px] bg-[#141C24] rounded-[10px] text-xs font-bold text-[#5B5B5B] capitalize cursor-not-allowed border-0 mt-2"
            >
              Resend Code (00:30s)
            </Button>

            {/* Navigation Shortcut to Reset Password Page for testing */}
            <Link
              href="/auth/reset-password"
              className="text-xs font-normal text-[#0084FF] hover:underline transition-colors mt-1"
            >
              Continue to Reset Password &rarr;
            </Link>
          </div>
        )}

      </div>
    </div>
  );
}
