"use client";

interface SecurityItem {
  label: string;
  value: string;
}

const SECURITY_ITEMS: SecurityItem[] = [
  {
    label: "Two-factor authentication",
    value: "Enforced",
  },
  {
    label: "Session timeout",
    value: "30 Minutes",
  },
  {
    label: "Audit retention",
    value: "7 Years",
  },
  {
    label: "Encryption at rest",
    value: "AES-256",
  },
];

export default function SettingsSecurityPage() {
  return (
    <div className="w-full flex flex-col font-sans">
      {/* Header */}
      <h2 className="text-2xl font-semibold text-white tracking-tight pb-4 border-b border-[#333333] mb-6">
        Security
      </h2>

      {/* Security Status Items List */}
      <div className="flex flex-col gap-3.5 w-full">
        {SECURITY_ITEMS.map((item) => (
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
