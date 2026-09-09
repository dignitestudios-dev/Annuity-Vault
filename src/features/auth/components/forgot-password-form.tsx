"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Mail, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import toast from "react-hot-toast";
import {
  useForgotPasswordMutation,
  useVerifyOtpMutation,
  useResendOtpMutation,
} from "@/features/auth/api/auth.service";

const forgotPasswordSchema = z.object({
  email: z.string().min(1, "Email is required").email("Invalid email address").max(100, "Email must be less than 100 characters"),
});
type ForgotPasswordData = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordForm() {
  const router = useRouter();
  const [step, setStep] = useState<"email" | "otp">("email");
  const [submittedEmail, setSubmittedEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [otpError, setOtpError] = useState("");
  const [countdown, setCountdown] = useState(30);

  const { register, handleSubmit, formState: { errors } } = useForm<ForgotPasswordData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" }
  });

  const { mutate: sendForgotPassword, isPending: isSendingForgot } = useForgotPasswordMutation();
  const { mutate: verifyOtp, isPending: isVerifyingOtp } = useVerifyOtpMutation();
  const { mutate: resendOtp, isPending: isResendingOtp } = useResendOtpMutation();

  // Countdown timer for Resend Code
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (step === "otp" && countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [step, countdown]);

  const onEmailSubmit = (data: ForgotPasswordData) => {
    sendForgotPassword(
      { email: data.email },
      {
        onSuccess: () => {
          toast.success("OTP sent to your email!");
          setSubmittedEmail(data.email);
          setStep("otp");
          setCountdown(30);
          setOtp("");
          setOtpError("");
        },
      }
    );
  };

  const handleResendOtp = () => {
    if (countdown > 0 || !submittedEmail || isResendingOtp) return;

    resendOtp(
      { email: submittedEmail },
      {
        onSuccess: () => {
          toast.success("A new OTP has been sent to your email.");
          setCountdown(30);
          setOtp("");
          setOtpError("");
        },
      }
    );
  };

  const onVerifyOtpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanOtp = otp.trim();
    if (!cleanOtp) {
      setOtpError("Please enter the OTP.");
      return;
    }
    if (cleanOtp.length < 4) {
      setOtpError("Please enter a valid OTP.");
      return;
    }

    setOtpError("");
    verifyOtp(
      { email: submittedEmail, otp: cleanOtp },
      {
        onSuccess: (res) => {
          toast.success("OTP verified successfully!");
          if (res?.resetToken) {
            sessionStorage.setItem("resetToken", res.resetToken);
            router.push(`/auth/reset-password?token=${encodeURIComponent(res.resetToken)}`);
          } else {
            router.push("/auth/reset-password");
          }
        },
      }
    );
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
        
        {step === "email" ? (
          <div key="step-email-container" className="w-full flex flex-col items-start gap-6 animate-in fade-in zoom-in-95 duration-300">
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
            <form onSubmit={handleSubmit(onEmailSubmit)} className="w-full flex flex-col gap-5">
              
              {/* Email Address Field */}
              <div className="flex flex-col gap-1.5 w-full">
                <Label 
                  htmlFor="email" 
                  className="text-xs font-medium text-white capitalize leading-[15px]"
                >
                  Email Address <span className="text-destructive">*</span>
                </Label>
                <Input
                  key="email-input"
                  id="email"
                  type="email"
                  placeholder="Enter email address"
                  {...register("email")}
                  className={`h-10 w-full bg-[#141C24] border-0 rounded-[10px] px-3 text-xs text-white placeholder:text-[#919191] placeholder:text-xs focus-visible:ring-1 focus-visible:ring-[#66859E] ${errors.email ? "ring-1 ring-[#FF3E46]" : ""}`}
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
                disabled={isSendingForgot}
                className="w-full h-10 bg-gradient-to-r from-[#66859E] to-[#849EB2] rounded-[10px] text-xs font-bold text-white capitalize hover:opacity-95 transition-opacity shadow-md border-0 mt-1 flex items-center justify-center gap-2"
              >
                {isSendingForgot && <Loader2 className="w-4 h-4 animate-spin" />}
                {isSendingForgot ? "Sending OTP..." : "Send OTP"}
              </Button>
            </form>
          </div>
        ) : (
          <div key="step-otp-container" className="w-full flex flex-col items-center text-center gap-5 py-4 animate-in fade-in zoom-in-95 duration-300">
            
            {/* Circular Mail Icon Container */}
            <div className="w-20 h-20 sm:w-[96px] sm:h-[96px] rounded-full bg-[#0C1116] border border-white/5 flex items-center justify-center shadow-lg">
              <Mail className="w-9 h-9 sm:w-10 sm:h-10 text-[#6887A0] stroke-[1.75]" />
            </div>

            {/* Heading & Subtitle */}
            <div className="flex flex-col items-center text-center gap-1.5 w-full max-w-[348px]">
              <h1 className="text-2xl sm:text-[28px] font-semibold leading-[34px] tracking-[-0.008em] text-white capitalize font-sans">
                Check Your Email
              </h1>
              <p className="text-xs sm:text-sm font-normal leading-[19px] tracking-[-0.014em] text-[#919191] font-sans">
                We sent a 6-digit OTP code to <br /><span className="text-white font-medium">{submittedEmail}</span>
              </p>
            </div>

            {/* OTP Form */}
            <form key="form-otp" onSubmit={onVerifyOtpSubmit} className="w-full flex flex-col gap-4" autoComplete="off">
              {/* Dummy field to absorb browser email autofill */}
              <input type="text" name="prevent_autofill" style={{ display: "none" }} tabIndex={-1} autoComplete="off" />

              <div className="flex flex-col gap-1.5 w-full text-left">
                <Label htmlFor="otp" className="text-xs font-medium text-white capitalize leading-[15px]">
                  Verification Code <span className="text-destructive">*</span>
                </Label>
                <Input
                  key="otp-code-input"
                  id="otp"
                  name="verification-code-otp"
                  type="text"
                  inputMode="numeric"
                  autoComplete="off"
                  maxLength={6}
                  autoFocus
                  value={otp}
                  onChange={(e) => {
                    const onlyDigits = e.target.value.replace(/\D/g, "").slice(0, 6);
                    setOtp(onlyDigits);
                    if (otpError) setOtpError("");
                  }}
                  placeholder="Enter 6-digit OTP"
                  className={`h-10 w-full bg-[#141C24] border-0 rounded-[10px] px-3 text-center tracking-[0.25em] text-sm text-white placeholder:tracking-normal placeholder:text-[#919191] placeholder:text-xs focus-visible:ring-1 focus-visible:ring-[#66859E] ${otpError ? "ring-1 ring-[#FF3E46]" : ""}`}
                />
                {otpError && (
                  <p className="text-[11px] font-medium text-[#FF3E46]">
                    {otpError}
                  </p>
                )}
              </div>

              {/* Verify OTP Button */}
              <Button
                type="submit"
                disabled={isVerifyingOtp}
                className="w-full h-10 bg-gradient-to-r from-[#66859E] to-[#849EB2] rounded-[10px] text-xs font-bold text-white capitalize hover:opacity-95 transition-opacity shadow-md border-0 flex items-center justify-center gap-2"
              >
                {isVerifyingOtp && <Loader2 className="w-4 h-4 animate-spin" />}
                {isVerifyingOtp ? "Verifying..." : "Verify OTP"}
              </Button>
            </form>

            {/* Resend Code Button with countdown */}
            <Button
              type="button"
              onClick={handleResendOtp}
              disabled={countdown > 0 || isResendingOtp}
              className={`w-full h-10 rounded-[10px] text-xs font-bold capitalize border-0 transition-colors ${
                countdown > 0
                  ? "bg-[#141C24] text-[#5B5B5B] cursor-not-allowed"
                  : "bg-[#141C24] text-white hover:bg-white/10 cursor-pointer"
              }`}
            >
              {countdown > 0
                ? `Resend Code (00:${countdown < 10 ? "0" : ""}${countdown}s)`
                : isResendingOtp
                ? "Sending..."
                : "Resend Code"}
            </Button>

            {/* Back to Edit Email */}
            <button
              type="button"
              onClick={() => setStep("email")}
              className="text-xs font-normal text-[#919191] hover:text-white transition-colors"
            >
              Wrong email address? <span className="text-[#0084FF] underline ml-1">Change email</span>
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
