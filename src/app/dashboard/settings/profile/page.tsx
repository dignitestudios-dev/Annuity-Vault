"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { User, Camera } from "lucide-react";
import SuccessModal from "@/components/shared/success-modal";

const profileSchema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  role: z.string().min(2, "Role is required"),
  firm: z.string().min(2, "Firm name is required"),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

export default function SettingsProfilePage() {
  const [isSuccessOpen, setIsSuccessOpen] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      fullName: "Adam Smith",
      email: "a.smith@annuityvault.com",
      role: "Senior Advisor",
      firm: "Annuity Vault Group",
    },
  });

  const onSubmit = (_data: ProfileFormValues) => {
    setIsSuccessOpen(true);
  };

  return (
    <div className="w-full flex flex-col font-sans">
      {/* Profile Panel Header */}
      <h2 className="text-2xl font-semibold text-white tracking-tight pb-4 border-b border-[#333333]">
        Profile
      </h2>

      {/* Profile Picture Upload Section */}
      <div className="flex items-center gap-4 py-6">
        {/* Avatar Circle Container with Camera Badge */}
        <div className="relative w-[78px] h-[78px] rounded-full bg-[#6887A0] flex items-center justify-center shadow-md flex-shrink-0">
          <User className="w-10 h-10 text-white" />
          
          {/* Camera Overlay Icon Badge */}
          <div className="absolute -bottom-0.5 -right-0.5 w-[30px] h-[30px] rounded-full bg-[#F4F4F4] p-[1.5px] flex items-center justify-center shadow-sm">
            <div className="w-full h-full rounded-full bg-[#6887A0] flex items-center justify-center">
              <Camera className="w-3.5 h-3.5 text-white" />
            </div>
          </div>
        </div>

        {/* Add Profile Picture Link */}
        <button
          type="button"
          className="text-white font-normal underline hover:opacity-80 text-base cursor-pointer font-sans bg-transparent border-0 p-0"
        >
          Add Profile Picture
        </button>
      </div>

      {/* Profile Form Fields */}
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-6 w-full">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6">
          {/* Full Name Field */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-white capitalize">
              Full Name
            </label>
            <input
              type="text"
              {...register("fullName")}
              placeholder="Full Name"
              className="h-10 w-full bg-[#141C24] text-white px-3.5 rounded-xl border border-white/5 focus:border-[#6887A0] outline-none text-sm font-sans transition-all"
            />
            {errors.fullName && (
              <span className="text-[#FF3E46] text-xs font-normal">
                {errors.fullName.message}
              </span>
            )}
          </div>

          {/* Email Address Field */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-white capitalize">
              Email Address
            </label>
            <input
              type="email"
              {...register("email")}
              placeholder="Email Address"
              className="h-10 w-full bg-[#141C24] text-[#727272] px-3.5 rounded-xl border border-white/5 focus:border-[#6887A0] outline-none text-sm font-sans transition-all"
            />
            {errors.email && (
              <span className="text-[#FF3E46] text-xs font-normal">
                {errors.email.message}
              </span>
            )}
          </div>

          {/* Role Field */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-white capitalize">
              Role
            </label>
            <input
              type="text"
              {...register("role")}
              placeholder="Role"
              className="h-10 w-full bg-[#141C24] text-white px-3.5 rounded-xl border border-white/5 focus:border-[#6887A0] outline-none text-sm font-sans transition-all"
            />
            {errors.role && (
              <span className="text-[#FF3E46] text-xs font-normal">
                {errors.role.message}
              </span>
            )}
          </div>

          {/* Firm Field */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-white capitalize">
              Firm
            </label>
            <input
              type="text"
              {...register("firm")}
              placeholder="Firm"
              className="h-10 w-full bg-[#141C24] text-white px-3.5 rounded-xl border border-white/5 focus:border-[#6887A0] outline-none text-sm font-sans transition-all"
            />
            {errors.firm && (
              <span className="text-[#FF3E46] text-xs font-normal">
                {errors.firm.message}
              </span>
            )}
          </div>
        </div>

        {/* Save Changes CTA Button */}
        <div className="flex justify-end mt-4 sm:mt-6">
          <button
            type="submit"
            className="bg-gradient-to-r from-[#66859E] to-[#849EB2] text-white font-semibold text-xs sm:text-sm h-11 px-8 rounded-xl hover:opacity-90 transition-all cursor-pointer shadow-sm"
          >
            Save Changes
          </button>
        </div>
      </form>

      {/* Success Modal Confirmation */}
      <SuccessModal
        isOpen={isSuccessOpen}
        onClose={() => setIsSuccessOpen(false)}
        title="Profile Updated!"
        description="Your profile information has been saved successfully!"
      />
    </div>
  );
}
