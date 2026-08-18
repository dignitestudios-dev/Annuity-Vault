"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { User as UserIcon, Camera, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import { useAppSelector, useAppDispatch } from "@/store";
import { updateUser } from "@/store/slices/auth.slice";
import { useUpdateProfile } from "@/features/settings/api/settings.service";

const profileSchema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters").max(50, "Full name must be less than 50 characters"),
  email: z.string().email("Please enter a valid email address").max(100, "Email must be less than 100 characters"),
  jobTitle: z.string().max(100, "Role must be less than 100 characters").optional().or(z.literal("")),
  firm: z.string().max(100, "Firm must be less than 100 characters").optional().or(z.literal("")),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

export default function SettingsProfilePage() {
  const user = useAppSelector((state) => state.auth.user);
  const dispatch = useAppDispatch();
  const updateProfileMutation = useUpdateProfile();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      fullName: "",
      email: "",
      jobTitle: "",
      firm: "",
    },
  });

  useEffect(() => {
    if (user) {
      reset({
        fullName: user.name || "",
        email: user.email || "",
        jobTitle: user.jobTitle || "",
        firm: user.firm || "",
      });
    }
  }, [user, reset]);

  const onSubmit = async (data: ProfileFormValues) => {
    try {
      // Note: email is not editable per requirements, so we only send name, jobTitle, firm
      const payload = {
        name: data.fullName,
        jobTitle: data.jobTitle,
        firm: data.firm,
      };
      const response = await updateProfileMutation.mutateAsync(payload);
      
      const updatedUser = {
        ...user,
        name: data.fullName,
        jobTitle: data.jobTitle,
        firm: data.firm,
      };
      
      // Update local storage and redux
      dispatch(updateUser(updatedUser));
      localStorage.setItem("auth-user", JSON.stringify(updatedUser));
      
      toast.success("Profile updated successfully!");
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to update profile.");
    }
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
          <UserIcon className="w-10 h-10 text-white" />
          
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
              Full Name <span className="text-destructive">*</span>
            </label>
            <input
              type="text"
              {...register("fullName")}
              placeholder="Full Name"
              className={`h-10 w-full bg-[#141C24] text-white px-3.5 rounded-xl border border-white/5 focus:border-[#6887A0] outline-none text-sm font-sans transition-all focus-visible:ring-1 focus-visible:ring-[#6887A0] ${errors.fullName ? "ring-1 ring-[#FF3E46]" : ""}`}
            />
            {errors.fullName && (
              <p className="text-[11px] font-medium text-[#FF3E46] mt-0.5">
                {errors.fullName.message}
              </p>
            )}
          </div>

          {/* Email Address Field */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-white capitalize">
              Email Address <span className="text-destructive">*</span>
            </label>
              <input
                type="email"
                {...register("email")}
                disabled
                placeholder="Email Address"
                className={`h-10 w-full bg-[#141C24] text-[#727272] px-3.5 rounded-xl border border-white/5 focus:border-[#6887A0] outline-none text-sm font-sans transition-all disabled:opacity-50 cursor-not-allowed focus-visible:ring-1 focus-visible:ring-[#6887A0] ${errors.email ? "ring-1 ring-[#FF3E46]" : ""}`}
              />
            {errors.email && (
              <p className="text-[11px] font-medium text-[#FF3E46] mt-0.5">
                {errors.email.message}
              </p>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-white capitalize">
              Role
            </label>
            <input
              type="text"
              {...register("jobTitle")}
              placeholder="Role"
              className={`h-10 w-full bg-[#141C24] text-white px-3.5 rounded-xl border border-white/5 focus:border-[#6887A0] outline-none text-sm font-sans transition-all focus-visible:ring-1 focus-visible:ring-[#6887A0] ${errors.jobTitle ? "ring-1 ring-[#FF3E46]" : ""}`}
            />
            {errors.jobTitle && (
              <p className="text-[11px] font-medium text-[#FF3E46] mt-0.5">
                {errors.jobTitle.message}
              </p>
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
              className={`h-10 w-full bg-[#141C24] text-white px-3.5 rounded-xl border border-white/5 focus:border-[#6887A0] outline-none text-sm font-sans transition-all focus-visible:ring-1 focus-visible:ring-[#6887A0] ${errors.firm ? "ring-1 ring-[#FF3E46]" : ""}`}
            />
            {errors.firm && (
              <p className="text-[11px] font-medium text-[#FF3E46] mt-0.5">
                {errors.firm.message}
              </p>
            )}
          </div>
        </div>


        {/* Save Changes CTA Button */}
        <div className="flex justify-end mt-4 sm:mt-6">
          <button
            type="submit"
            disabled={isSubmitting || updateProfileMutation.isPending}
            className="bg-gradient-to-r from-[#66859E] to-[#849EB2] text-white font-semibold text-xs sm:text-sm h-11 px-8 rounded-xl hover:opacity-90 transition-all cursor-pointer shadow-sm flex items-center justify-center gap-2 disabled:opacity-70"
          >
            {(isSubmitting || updateProfileMutation.isPending) && (
              <Loader2 className="w-4 h-4 animate-spin" />
            )}
            Save Changes
          </button>
        </div>
      </form>
    </div>
  );
}
