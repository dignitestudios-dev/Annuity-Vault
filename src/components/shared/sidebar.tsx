"use client";

import { useState } from "react";
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
import LogoutModal from "@/components/shared/logout-modal";
import { useAppSelector, useAppDispatch } from "@/store";
import { logout as logoutAction } from "@/store/slices/auth.slice";
import { useLogoutMutation } from "@/features/auth/api/auth.service";

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
  const [isLogoutOpen, setIsLogoutOpen] = useState(false);
  const pathname = usePathname();
  const { user } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();
  const { mutate: logoutApi } = useLogoutMutation();
  const router = useRouter();

  const handleConfirmLogout = () => {
    logoutApi(undefined, {
      onSettled: () => {
        localStorage.removeItem("auth-token");
        localStorage.removeItem("auth-user");
        document.cookie = "auth-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
        dispatch(logoutAction());
        router.push("/auth/login");
      }
    });
  };

  const getInitials = (name: string) => {
    if (!name) return "U";
    const parts = name.split(" ");
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return name[0].toUpperCase();
  };

  return (
    <>
      <aside className="relative w-60 h-screen bg-[#141C24] flex flex-col justify-between flex-shrink-0 border-r border-white/5 overflow-hidden z-20 font-sans">
        {/* Decorative Background Ellipses */}
        <div className="absolute -left-28 bottom-0 w-[304px] h-[411px] bg-[#6887A0]/[0.08] rounded-full blur-2xl pointer-events-none -rotate-28" />
        <div className="absolute -left-36 bottom-0 w-[304px] h-[411px] bg-[#6887A0]/[0.05] rounded-full blur-2xl pointer-events-none -rotate-28" />

        {/* Scrollable Container for Header, User Card, Links, and Logout */}
        <div className="relative z-10 flex-1 flex flex-col justify-between overflow-y-auto custom-scrollbar p-4 min-h-0">
          <div className="flex flex-col items-center gap-6 w-full">
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
            <div className="w-full bg-[#141C24] border border-[#1F2E3C] rounded-[18px] p-3 flex items-center gap-3 shadow-md relative overflow-hidden flex-shrink-0">
              <div className="w-12 h-12 rounded-full bg-[#394A58] flex items-center justify-center text-white font-semibold text-sm flex-shrink-0 border border-white/10 overflow-hidden">
                <span className="text-sm font-semibold">{getInitials(user?.name || "")}</span>
              </div>
              <div className="flex flex-col min-w-0">
                <h4 className="text-sm font-semibold text-white truncate font-sans">
                  {user?.name || "User"}
                </h4>
                <span className="text-xs font-normal text-[#818181] truncate font-sans">
                  {user?.role || "Advisor"}
                </span>
              </div>
            </div>

            {/* Navigation Links */}
            <nav className="w-full flex flex-col gap-1.5 pt-1">
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
          <div className="pt-4 mt-auto w-full">
            <button
              type="button"
              onClick={() => setIsLogoutOpen(true)}
              className="w-full h-10 px-4 rounded-[8px] flex items-center gap-3 text-xs font-semibold text-white hover:bg-white/5 transition-colors font-sans cursor-pointer"
            >
              <LogOut className="w-4 h-4 flex-shrink-0 text-white" />
              <span>Log out</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Logout Confirmation Dialog */}
      <LogoutModal
        isOpen={isLogoutOpen}
        onClose={() => setIsLogoutOpen(false)}
        onConfirm={handleConfirmLogout}
      />
    </>
  );
}
