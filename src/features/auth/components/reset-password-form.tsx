"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Eye, EyeOff, Check } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const resetPasswordSchema = z.object({
  password: z.string().min(6, "Password must be at least 6 characters").max(50, "Password must be less than 50 characters"),
  confirmPassword: z.string().min(6, "Password must be at least 6 characters").max(50, "Password must be less than 50 characters"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

type ResetPasswordData = z.infer<typeof resetPasswordSchema>;

export default function ResetPasswordForm() {
  const { register, handleSubmit, formState: { errors } } = useForm<ResetPasswordData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { password: "", confirmPassword: "" }
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const onSubmit = (data: ResetPasswordData) => {
    console.log("Reset password data:", data);
    setIsSubmitted(true);
  };

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
      <div className="relative z-10 w-full max-w-[340px] flex flex-col items-center transition-all duration-300">
        {!isSubmitted ? (
          <div className="w-full flex flex-col items-center gap-6 animate-in fade-in zoom-in-95 duration-300">
            {/* Heading Section */}
            <div className="flex flex-col items-center text-center gap-1.5 w-full">
              <h1 className="text-2xl lg:text-[30px] font-semibold leading-[36px] tracking-[-0.008em] text-white capitalize font-sans">
                Create New Password
              </h1>
              <p className="text-xs lg:text-sm font-normal leading-[17px] tracking-[-0.014em] text-[#919191] font-sans">
                Enter new password to reset.
              </p>
            </div>

            {/* Form */}
            <form
              onSubmit={handleSubmit(onSubmit)}
              className="w-full flex flex-col gap-5"
            >
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
                    {...register("password")}
                    className={`h-[38px] w-full bg-[#141C24] border-0 rounded-[10px] pl-3 pr-10 text-xs text-white placeholder:text-[#919191] placeholder:text-xs focus-visible:ring-1 focus-visible:ring-[#66859E] ${errors.password ? "ring-1 ring-[#FF3E46]" : ""}`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#919191] hover:text-white transition-colors"
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
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
                    {errors.password.message}
                  </p>
                )}
              </div>

              {/* Confirm Password Field */}
              <div className="flex flex-col gap-1.5 w-full">
                <Label
                  htmlFor="confirmPassword"
                  className="text-xs font-medium text-white capitalize leading-[15px]"
                >Confirm Password <span className="text-destructive">*</span></Label>
                <div className="relative w-full">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Re-enter password here"
                    {...register("confirmPassword")}
                    className={`h-[38px] w-full bg-[#141C24] border-0 rounded-[10px] pl-3 pr-10 text-xs text-white placeholder:text-[#919191] placeholder:text-xs focus-visible:ring-1 focus-visible:ring-[#66859E] ${errors.confirmPassword ? "ring-1 ring-[#FF3E46]" : ""}`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#919191] hover:text-white transition-colors"
                    aria-label={
                      showConfirmPassword ? "Hide password" : "Show password"
                    }
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="text-[11px] font-medium text-[#FF3E46]">
                    {errors.confirmPassword.message}
                  </p>
                )}
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full h-[40px] bg-gradient-to-r from-[#66859E] to-[#849EB2] rounded-[10px] text-xs font-bold text-white capitalize hover:opacity-95 transition-opacity shadow-md border-0 mt-1"
              >
                Update
              </Button>
            </form>
          </div>
        ) : (
          <div className="w-full flex flex-col items-center text-center gap-6 py-6 animate-in fade-in zoom-in-95 duration-300">
            {/* Circular Checkmark Badge */}
            <div className="w-24 h-24 sm:w-[110px] sm:h-[110px] rounded-full bg-[#0C1116] border border-white/5 flex items-center justify-center shadow-lg">
              <Check className="w-10 h-10 sm:w-12 sm:h-12 text-[#6887A0] stroke-[2.5]" />
            </div>

            {/* Heading & Subtitle */}
            <div className="flex flex-col items-center text-center gap-2 w-full max-w-[377px]">
              <h1 className="text-2xl sm:text-[32px] font-semibold leading-[38px] tracking-[-0.008em] text-white capitalize font-sans">
                Password Updated!
              </h1>
              <p className="text-xs sm:text-sm font-normal leading-[19px] tracking-[-0.014em] text-[#919191] font-sans">
                Your password has been updated successfully.
              </p>
            </div>

            {/* Back to Login Button */}
            <Button
              type="button"
              onClick={() => (window.location.href = "/auth/login")}
              className="w-full h-[40px] bg-gradient-to-r from-[#66859E] to-[#849EB2] rounded-[10px] text-xs font-bold text-white capitalize hover:opacity-95 transition-opacity shadow-md border-0 mt-2"
            >
              Back to Log In
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
