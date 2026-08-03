"use client";

import { useState } from "react";
import { Bell, Check } from "lucide-react";

const INITIAL_NOTIFICATIONS = [
  {
    id: "n1",
    title: "Anniversary Reminder",
    message: "Contract IX-239032 (Jacob Thompson) anniversary is approaching in 62 days.",
    timestamp: "10 minutes ago",
    unread: true,
  },
  {
    id: "n2",
    title: "Client Updated",
    message: "Jacob Thompson profile details were successfully updated.",
    timestamp: "1 hour ago",
    unread: true,
  },
  {
    id: "n3",
    title: "Document Uploaded",
    message: "Pacific Life Policy Contract.pdf was uploaded to Jacob Thompson's vault.",
    timestamp: "Yesterday at 14:20",
    unread: false,
  },
  {
    id: "n4",
    title: "System Notification",
    message: "Google Calendar synchronization completed with 0 errors.",
    timestamp: "2 days ago",
    unread: false,
  },
];

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS);

  const markAllAsRead = () => {
    setNotifications(
      notifications.map((n) => ({ ...n, unread: false }))
    );
  };

  return (
    <div className="w-full flex flex-col gap-6 max-w-[1440px] mx-auto pb-12 font-sans">
      {/* Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Bell className="w-7 h-7 text-[#6887A0]" />
          <h1 className="text-2xl lg:text-[32px] font-semibold text-white tracking-tight leading-tight">
            Notifications
          </h1>
        </div>

        <button
          onClick={markAllAsRead}
          className="h-9 px-4 bg-gradient-to-r from-[#66859E] to-[#849EB2] text-white hover:opacity-90 rounded-[12px] text-xs sm:text-sm font-medium transition-all flex items-center gap-2 shadow-sm self-start sm:self-auto"
        >
          <Check className="w-4 h-4 text-white" />
          <span>Mark all as read</span>
        </button>
      </div>

      {/* Notifications List Card */}
      <div className="w-full bg-[#141C24] border border-[#0F1F3D]/12 rounded-[12px] overflow-hidden shadow-sm divide-y divide-white/10">
        {notifications.map((item) => (
          <div
            key={item.id}
            className={`p-5 flex items-start justify-between gap-4 transition-colors ${
              item.unread ? "bg-white/[0.03]" : "hover:bg-white/[0.01]"
            }`}
          >
            <div className="flex items-start gap-3.5 flex-1">
              {item.unread ? (
                <div className="w-2.5 h-2.5 rounded-full bg-[#FF3E46] mt-1.5 flex-shrink-0" />
              ) : (
                <div className="w-2.5 h-2.5 rounded-full bg-transparent mt-1.5 flex-shrink-0" />
              )}
              <div className="flex flex-col gap-1">
                <h4 className="text-sm font-semibold text-white">
                  {item.title}
                </h4>
                <p className="text-xs sm:text-sm text-[#919191]">
                  {item.message}
                </p>
                <span className="text-[11px] text-[#829CB0] font-mono pt-1">
                  {item.timestamp}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
