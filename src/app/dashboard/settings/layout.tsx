"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

const SETTINGS_NAV_ITEMS = [
  { label: "Profile", href: "/dashboard/settings/profile" },
  { label: "Notification Settings", href: "/dashboard/settings/notifications" },
  { label: "Microsoft Calendar", href: "/dashboard/settings/microsoft-calendar" },
  { label: "Change Password", href: "/dashboard/settings/change-password" },
  // { label: "Security", href: "/dashboard/settings/security" },
  { label: "Data Management", href: "/dashboard/settings/data-management" },
  { label: "Terms & Conditions", href: "/dashboard/settings/terms-and-conditions" },
  { label: "Privacy Policy", href: "/dashboard/settings/privacy-policy" },
];

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="w-full flex flex-col gap-6 max-w-[1440px] mx-auto pb-12 font-sans">
      {/* Settings Main Header */}
      <h1 className="text-2xl sm:text-[32px] font-semibold text-white tracking-tight leading-tight">
        Settings
      </h1>

      {/* Main Settings Card Container (#232B34 background) */}
      <div className="w-full bg-[#232B34] border border-white/5 rounded-xl p-5 sm:p-6 shadow-sm flex flex-col md:flex-row gap-6 min-h-[640px]">
        {/* Left Sidebar Navigation Menu */}
        <aside className="w-full md:w-[320px] flex-shrink-0 flex flex-col">
          <nav className="flex flex-col">
            {SETTINGS_NAV_ITEMS.map((item) => {
              const isActive =
                pathname === item.href ||
                (item.href === "/dashboard/settings/profile" && pathname === "/dashboard/settings") ||
                (item.href === "/dashboard/settings/microsoft-calendar" && pathname === "/dashboard/settings/google-calendar");
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "h-[56px] px-4 flex items-center justify-between text-sm font-medium transition-all cursor-pointer font-sans",
                    isActive
                      ? "bg-gradient-to-r from-[#66859E] to-[#849EB2] text-white rounded-lg shadow-sm"
                      : "text-white border-b border-white/10 hover:bg-white/5"
                  )}
                >
                  <span className="capitalize">{item.label}</span>
                  <ChevronRight className="w-5 h-5 text-white flex-shrink-0" />
                </Link>
              );
            })}
          </nav>
        </aside>

        {/* Vertical Divider Line */}
        <div className="w-[1px] bg-[#333333] hidden md:block self-stretch my-1" />

        {/* Right Content Panel */}
        <main className="flex-1 flex flex-col min-w-0">
          {children}
        </main>
      </div>
    </div>
  );
}
