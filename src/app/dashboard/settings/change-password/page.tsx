"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Eye, EyeOff } from "lucide-react";
import SuccessModal from "@/components/shared/success-modal";

const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(6, "Current password must be at least 6 characters"),
    newPassword: z
      .string()
      .min(8, "New password must be at least 8 characters")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[0-9]/, "Password must contain at least one number"),
    confirmPassword: z.string().min(1, "Please confirm your new password"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type ChangePasswordValues = z.infer<typeof changePasswordSchema>;

export default function SettingsChangePasswordPage() {
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isSuccessOpen, setIsSuccessOpen] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ChangePasswordValues>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const onSubmit = (_data: ChangePasswordValues) => {
    setIsSuccessOpen(true);
    reset();
  };

  return (
    <div className="w-full flex flex-col font-sans">
      {/* Header */}
      <h2 className="text-2xl font-semibold text-white tracking-tight pb-4 border-b border-[#333333] mb-6">
        Change Password
      </h2>

      {/* Form Container */}
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="w-full flex flex-col gap-6">
        {/* 2-Column Grid matching Figma design */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 max-w-[760px]">
          {/* Left Column: Current Password */}
          <div className="flex flex-col gap-2 w-full max-w-[350px]">
            <label className="text-sm font-medium text-white capitalize">
              Current Password
            </label>
            <div className="relative w-full">
              <input
                type={showCurrent ? "text" : "password"}
                {...register("currentPassword")}
                placeholder="Enter password here"
                className="h-10 w-full bg-[#141C24] text-white pl-3.5 pr-10 rounded-xl border border-white/5 focus:border-[#6887A0] outline-none text-sm font-sans placeholder:text-[#919191] transition-all"
              />
              <button
                type="button"
                onClick={() => setShowCurrent(!showCurrent)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#919191] hover:text-white transition-colors"
              >
                {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {errors.currentPassword && (
              <span className="text-[#FF3E46] text-xs font-normal">
                {errors.currentPassword.message}
              </span>
            )}
          </div>

          {/* Right Column: New Password & Confirm Password */}
          <div className="flex flex-col gap-6 w-full max-w-[350px]">
            {/* New Password Field */}
            <div className="flex flex-col gap-2 w-full">
              <label className="text-sm font-medium text-white capitalize">
                New Password
              </label>
              <div className="relative w-full">
                <input
                  type={showNew ? "text" : "password"}
                  {...register("newPassword")}
                  placeholder="Enter new password here"
                  className="h-10 w-full bg-[#141C24] text-white pl-3.5 pr-10 rounded-xl border border-white/5 focus:border-[#6887A0] outline-none text-sm font-sans placeholder:text-[#919191] transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowNew(!showNew)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#919191] hover:text-white transition-colors"
                >
                  {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.newPassword && (
                <span className="text-[#FF3E46] text-xs font-normal">
                  {errors.newPassword.message}
                </span>
              )}
            </div>

            {/* Confirm Password Field */}
            <div className="flex flex-col gap-2 w-full">
              <label className="text-sm font-medium text-white capitalize">
                Confirm Password
              </label>
              <div className="relative w-full">
                <input
                  type={showConfirm ? "text" : "password"}
                  {...register("confirmPassword")}
                  placeholder="Re enter password here"
                  className="h-10 w-full bg-[#141C24] text-white pl-3.5 pr-10 rounded-xl border border-white/5 focus:border-[#6887A0] outline-none text-sm font-sans placeholder:text-[#919191] transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#919191] hover:text-white transition-colors"
                >
                  {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.confirmPassword && (
                <span className="text-[#FF3E46] text-xs font-normal">
                  {errors.confirmPassword.message}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Action Button: Update */}
        <div className="flex justify-end max-w-[760px] mt-4">
          <button
            type="submit"
            className="bg-gradient-to-r from-[#66859E] to-[#849EB2] text-white font-semibold text-xs sm:text-sm h-11 px-8 rounded-xl hover:opacity-90 transition-all cursor-pointer shadow-sm"
          >
            Update
          </button>
        </div>
      </form>

      {/* Success Modal Feedback */}
      <SuccessModal
        isOpen={isSuccessOpen}
        onClose={() => setIsSuccessOpen(false)}
        title="Password Updated!"
        description="Your password has been changed successfully."
      />
    </div>
  );
}
