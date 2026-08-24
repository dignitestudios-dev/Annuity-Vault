"use client";

import { useSecuritySettings } from "@/features/settings/api/settings.service";
import { Loader2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function SettingsSecurityPage() {
  const { data: security, isLoading } = useSecuritySettings();

  if (isLoading) {
    return (
      <div className="w-full flex flex-col font-sans">
        <div className="flex items-center justify-between pb-4 border-b border-[#333333] mb-6">
          <Skeleton className="h-8 w-[150px] bg-white/5 rounded-md" />
        </div>
        <div className="flex flex-col gap-3.5 w-full">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={`skel-${i}`} className="w-full h-[74px] bg-[#141C24] border border-white/5 rounded-xl shadow-sm" />
          ))}
        </div>
      </div>
    );
  }

  const securityItems = security ? [
    { label: "Two-factor authentication", value: security.twoFactorAuthentication ? "Enabled" : "Disabled" },
    { label: "Session timeout", value: security.sessionTimeout },
    { label: "Audit retention", value: security.auditRetention },
    { label: "Encryption at rest", value: security.encryptionAtRest ? "Enabled" : "Disabled" },
  ] : [];

  return (
    <div className="w-full flex flex-col font-sans">
      {/* Header */}
      <h2 className="text-2xl font-semibold text-white tracking-tight pb-4 border-b border-[#333333] mb-6">
        Security
      </h2>

      {/* Security Status Items List */}
      <div className="flex flex-col gap-3.5 w-full">
        {securityItems.map((item) => (
          <div
            key={item.label}
            className="w-full bg-[#141C24] border border-white/5 rounded-xl p-4 sm:p-[17px] flex items-center justify-between gap-4 transition-all shadow-sm"
          >
            <span className="text-[#919191] text-sm sm:text-base font-normal">
              {item.label}
            </span>
            <span className="text-white font-semibold text-sm sm:text-base tracking-tight">
              {item.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
