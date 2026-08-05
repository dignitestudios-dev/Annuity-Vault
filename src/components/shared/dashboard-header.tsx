"use client";

import { useState, useRef, useEffect } from "react";
import { Bell } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface NotificationPreviewItem {
  id: string;
  title: string;
  description: string;
  time: string;
  isUnread: boolean;
}

const PREVIEW_NOTIFICATIONS: NotificationPreviewItem[] = [
  {
    id: "1",
    title: "Contract Anniversary Approaching",
    description: "Robert Jackson's contract #AV-88421 anniversary is in 30 days.",
    time: "7:30 PM",
    isUnread: true,
  },
  {
    id: "2",
    title: "Task Due Today",
    description: "Review quarterly index performance options for Sarah Jenkins.",
    time: "7:30 PM",
    isUnread: true,
  },
  {
    id: "3",
    title: "System Maintenance Scheduled",
    description: "Platform system update scheduled for Sunday at 2:00 AM EST.",
    time: "7:30 PM",
    isUnread: false,
  },
  {
    id: "4",
    title: "Contract Anniversary Approaching",
    description: "Michael Vance's annuity contract renewal date is approaching.",
    time: "7:30 PM",
    isUnread: false,
  },
  {
    id: "5",
    title: "Client Document Uploaded",
    description: "Signed annuity application agreement uploaded by Eleanor Vance.",
    time: "7:30 PM",
    isUnread: false,
  },
];

export default function DashboardHeader() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleViewAll = () => {
    setIsOpen(false);
    router.push("/dashboard/notifications");
  };

  const unreadCount = PREVIEW_NOTIFICATIONS.filter((n) => n.isUnread).length;

  return (
    <header className="relative w-full h-20 bg-[#141C24] px-6 lg:px-8 flex items-center justify-between border-b border-white/5 flex-shrink-0 z-40">
      {/* Greeting Title & Subtitle */}
      <div className="flex flex-col gap-1">
        <h1 className="text-xl lg:text-[20px] font-semibold text-white leading-tight font-sans">
          Good morning, Adam Smith
        </h1>
        <p className="text-xs lg:text-sm font-normal text-[#919191] font-sans">
          Wednesday, January 15, 2025 &mdash; {unreadCount} unread notifications
        </p>
      </div>

      {/* Notifications Dropdown Trigger Container */}
      <div className="relative" ref={dropdownRef}>
        {/* Bell Toggle Icon Button */}
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="relative w-10 h-10 rounded-lg bg-[#0C1116] flex items-center justify-center text-[#6887A0] hover:text-white transition-colors cursor-pointer focus:outline-none"
          aria-label="Notifications"
        >
          <Bell className="w-5 h-5 text-[#6887A0]" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#FF0000] text-white text-[10px] font-bold flex items-center justify-center">
              {unreadCount}
            </span>
          )}
        </button>

        {/* Dropdown Menu Popup Panel */}
        {isOpen && (
          <div className="absolute right-0 top-12 w-[340px] sm:w-[400px] bg-[#0C1116] border border-white/10 rounded-xl shadow-2xl z-50 overflow-hidden flex flex-col py-2 font-sans animate-in fade-in-0 zoom-in-95 duration-150">
            {/* Dropdown Header */}
            <div className="flex items-center justify-between px-5 py-3 border-b border-white/10">
              <h3 className="text-white font-semibold text-lg tracking-tight">
                Notifications
              </h3>
              <button
                type="button"
                onClick={handleViewAll}
                className="text-white font-normal underline hover:opacity-80 text-sm cursor-pointer bg-transparent border-0 p-0 font-sans"
              >
                View All
              </button>
            </div>

            {/* Notifications List */}
            <div className="flex flex-col max-h-[380px] overflow-y-auto divide-y divide-white/10">
              {PREVIEW_NOTIFICATIONS.map((item) => (
                <div
                  key={item.id}
                  onClick={handleViewAll}
                  className="p-4 hover:bg-white/5 transition-colors cursor-pointer flex flex-col gap-1.5"
                >
                  {/* Top Row: Title + Time */}
                  <div className="flex items-center justify-between">
                    <h4 className="text-white font-semibold text-sm tracking-tight truncate pr-2">
                      {item.title}
                    </h4>
                    <span className="text-[#919191] text-xs font-normal flex-shrink-0">
                      {item.time}
                    </span>
                  </div>

                  {/* Bottom Row: Description + Unread Badge */}
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-[#919191] text-xs font-normal leading-relaxed line-clamp-2 flex-1">
                      {item.description}
                    </p>

                    {item.isUnread && (
                      <span className="w-4 h-4 rounded-full bg-[#FF0000] text-white text-[10px] font-bold flex items-center justify-center flex-shrink-0 shadow-sm">
                        1
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
