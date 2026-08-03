"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  FileText,
  CheckSquare,
  Calendar,
  Activity,
  Archive,
  Bell,
  Settings,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Clients Folder", href: "/dashboard/clients", icon: Users },
  { name: "Contracts", href: "/dashboard/contracts", icon: FileText },
  { name: "Tasks Management", href: "/dashboard/tasks", icon: CheckSquare },
  { name: "Anniversaries", href: "/dashboard/anniversaries", icon: Calendar },
  { name: "Activity & Audit Log", href: "/dashboard/activity", icon: Activity },
  { name: "Archived", href: "/dashboard/archived", icon: Archive },
  { name: "Notifications", href: "/dashboard/notifications", icon: Bell },
  { name: "Settings", href: "/dashboard/settings", icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = () => {
    // Remove auth tokens
    localStorage.removeItem("auth-token");
    localStorage.removeItem("auth-user");
    document.cookie = "auth-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    router.push("/auth/login");
  };

  return (
    <aside className="relative w-60 h-screen bg-[#141C24] flex flex-col justify-between flex-shrink-0 border-r border-white/5 overflow-hidden z-20">
      {/* Decorative Background Ellipses */}
      <div className="absolute -left-28 bottom-0 w-[304px] h-[411px] bg-[#6887A0]/[0.08] rounded-full blur-2xl pointer-events-none -rotate-28" />
      <div className="absolute -left-36 bottom-0 w-[304px] h-[411px] bg-[#6887A0]/[0.05] rounded-full blur-2xl pointer-events-none -rotate-28" />

      {/* Top Logo & User Profile Section */}
      <div className="relative z-10 p-4 flex flex-col items-center gap-6">
        
        {/* Logo */}
        <Link href="/dashboard" className="flex justify-center pt-2">
          <Image
            src="/images/logo.png"
            alt="Annuity Vault"
            width={140}
            height={100}
            priority
            className="w-[140px] h-auto object-contain"
          />
        </Link>

        {/* User Card */}
        <div className="w-full bg-[#141C24] border border-[#1F2E3C] rounded-[18px] p-3 flex items-center gap-3 shadow-md relative overflow-hidden">
          <div className="w-12 h-12 rounded-full bg-[#394A58] flex items-center justify-center text-white font-semibold text-sm flex-shrink-0 border border-white/10 overflow-hidden">
            <span className="text-sm font-semibold">AS</span>
          </div>
          <div className="flex flex-col min-w-0">
            <h4 className="text-sm font-semibold text-white truncate font-sans">
              Adam Smith
            </h4>
            <span className="text-xs font-normal text-[#818181] truncate font-sans">
              Senior Advisor
            </span>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="w-full flex flex-col gap-1.5 pt-2">
          {NAV_ITEMS.map((item) => {
            const isActive =
              item.href === "/dashboard"
                ? pathname === "/dashboard"
                : pathname.startsWith(item.href);
            const Icon = item.icon;

            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "w-full h-10 px-4 rounded-[8px] flex items-center gap-3 text-xs font-semibold tracking-tight capitalize transition-colors font-sans",
                  isActive
                    ? "bg-gradient-to-r from-[#66859E] to-[#849EB2] text-white shadow-sm"
                    : "text-white hover:bg-white/5"
                )}
              >
                <Icon className="w-4 h-4 flex-shrink-0 text-white" />
                <span className="truncate">{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Logout Button at Bottom */}
      <div className="relative z-10 p-4 pt-0">
        <button
          onClick={handleLogout}
          className="w-full h-10 px-4 rounded-[8px] flex items-center gap-3 text-xs font-semibold text-white hover:bg-white/5 transition-colors font-sans"
        >
          <LogOut className="w-4 h-4 flex-shrink-0 text-white" />
          <span>Log out</span>
        </button>
      </div>
    </aside>
  );
}
