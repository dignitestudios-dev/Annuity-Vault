"use client";

import { Bell } from "lucide-react";
import Link from "next/link";

export default function DashboardHeader() {
  return (
    <header className="w-full h-20 bg-[#141C24] px-6 lg:px-8 flex items-center justify-between border-b border-white/5 flex-shrink-0 z-10">
      {/* Greeting Title & Subtitle */}
      <div className="flex flex-col gap-1">
        <h1 className="text-xl lg:text-[20px] font-semibold text-white leading-tight font-sans">
          Good morning, Adam Smith
        </h1>
        <p className="text-xs lg:text-sm font-normal text-[#919191] font-sans">
          Wednesday, January 15, 2025 &mdash; 4 unread notifications
        </p>
      </div>

      {/* Notifications Icon Button */}
      <Link
        href="/dashboard/notifications"
        className="relative w-10 h-10 rounded-lg bg-[#0C1116] flex items-center justify-center text-[#6887A0] hover:text-white transition-colors"
        aria-label="Notifications"
      >
        <Bell className="w-5 h-5 text-[#6887A0]" />
        <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-600 text-white text-[10px] font-bold flex items-center justify-center">
          4
        </span>
      </Link>
    </header>
  );
}
