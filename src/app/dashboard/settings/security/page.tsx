"use client";

import { useSecuritySettings } from "@/features/settings/api/settings.service";
import { Loader2 } from "lucide-react";

export default function SettingsSecurityPage() {
  const { data: security, isLoading } = useSecuritySettings();

  if (isLoading) {
    return <div className="p-8 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-[#6887A0]" /></div>;
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
