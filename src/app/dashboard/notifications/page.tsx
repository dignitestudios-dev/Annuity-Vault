"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Calendar, CheckSquare, Info, Check } from "lucide-react";
import SuccessModal from "@/components/shared/success-modal";
import { cn } from "@/lib/utils";

interface NotificationItem {
  id: string;
  category: "anniversaries" | "tasks" | "system";
  title: string;
  message: string;
  client?: string;
  date: string;
  unread: boolean;
}

const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: "notif-1",
    category: "anniversaries",
    title: "Contract Anniversary — 14 days",
    message: "Adam Smith's Pacific Life contract AV-2022-001847 anniversary is on January 15, 2025.",
    client: "Adam Smith",
    date: "2025-01-01",
    unread: true,
  },
  {
    id: "notif-2",
    category: "anniversaries",
    title: "Contract Anniversary — 20 days",
    message: "Margaret Holloway's North American contract AV-2021-000594 anniversary is on May 20, 2025.",
    client: "Margaret Holloway",
    date: "2025-04-30",
    unread: true,
  },
  {
    id: "notif-3",
    category: "anniversaries",
    title: "Contract Anniversary — 81 days",
    message: "James Ellington's Nationwide Variable Annuity AV-2019-000044 anniversary is on March 22, 2025.",
    client: "James Ellington",
    date: "2025-01-01",
    unread: false,
  },
  {
    id: "notif-4",
    category: "tasks",
    title: "Task Due Soon",
    message: "Follow Up with Sandra Collins is due on February 1, 2025.",
    client: "Sandra Collins",
    date: "2025-01-25",
    unread: false,
  },
  {
    id: "notif-5",
    category: "anniversaries",
    title: "Contract Anniversary — 221 days",
    message: "Patricia Nguyen's Allianz contract AV-2020-000112 anniversary is on November 8, 2025.",
    client: "Patricia Nguyen",
    date: "2025-01-01",
    unread: false,
  },
  {
    id: "notif-6",
    category: "system",
    title: "Annual Review Reminder",
    message: "3 clients are due for their annual policy review this month.",
    date: "2025-01-01",
    unread: false,
  },
];

const TABS = [
  { id: "all", label: "All" },
  { id: "anniversaries", label: "Anniversaries" },
  { id: "tasks", label: "Tasks" },
  { id: "system", label: "System" },
];

function NotificationsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const tabParam = searchParams.get("tab") as "all" | "anniversaries" | "tasks" | "system" | null;
  const [activeTab, setActiveTab] = useState<"all" | "anniversaries" | "tasks" | "system">(
    tabParam && ["all", "anniversaries", "tasks", "system"].includes(tabParam) ? tabParam : "all"
  );
  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);
  const [feedbackModal, setFeedbackModal] = useState<{ isOpen: boolean; title: string; desc: string }>({
    isOpen: false,
    title: "",
    desc: "",
  });

  // Sync state when query parameter updates
  useEffect(() => {
    if (tabParam && ["all", "anniversaries", "tasks", "system"].includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, [tabParam]);

  const handleTabChange = (newTab: "all" | "anniversaries" | "tasks" | "system") => {
    setActiveTab(newTab);
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", newTab);
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const handleMarkAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
    setFeedbackModal({
      isOpen: true,
      title: "Notifications Updated",
      desc: "All notifications have been marked as read.",
    });
  };

  const filteredNotifications = notifications.filter((n) => {
    if (activeTab === "all") return true;
    return n.category === activeTab;
  });

  const getCategoryIcon = (category: "anniversaries" | "tasks" | "system") => {
    switch (category) {
      case "anniversaries":
        return <Calendar className="w-4 h-4 text-white" />;
      case "tasks":
        return <CheckSquare className="w-4 h-4 text-white" />;
      case "system":
        return <Info className="w-4 h-4 text-white" />;
    }
  };

  return (
    <div className="w-full flex flex-col gap-5 max-w-[1440px] mx-auto pb-12 font-sans">
      {/* 1. Header Row (Title & Mark All Read Button) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl sm:text-[32px] font-semibold text-white tracking-tight leading-tight">
          Notifications
        </h1>

        <button
          onClick={handleMarkAllRead}
          className="h-10 px-5 bg-gradient-to-r from-[#66859E] to-[#849EB2] text-white hover:opacity-90 rounded-xl text-xs sm:text-sm font-medium transition-all flex items-center justify-center gap-2 shadow-sm cursor-pointer self-start sm:self-auto"
        >
          <Check className="w-4 h-4 text-white" />
          <span>Mark all read</span>
        </button>
      </div>

      {/* 2. Filter Tabs Container */}
      <div className="bg-[#394A58] p-1 rounded-xl flex items-center gap-1.5 w-fit flex-wrap">
        {TABS.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id as any)}
              className={cn(
                "h-8 px-4 rounded-lg text-xs sm:text-sm font-medium flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap",
                isActive
                  ? "bg-gradient-to-r from-[#66859E] to-[#849EB2] text-white shadow-sm"
                  : "text-[#919191] hover:text-white"
              )}
            >
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* 3. Notifications List */}
      <div className="flex flex-col gap-3.5 w-full">
        {filteredNotifications.length === 0 ? (
          <div className="w-full bg-[#141C24] border border-[#0F1F3D]/20 rounded-xl p-12 text-center text-xs sm:text-sm text-[#919191]">
            No notifications in this category.
          </div>
        ) : (
          filteredNotifications.map((item) => (
            <div
              key={item.id}
              className={cn(
                "w-full bg-[#141C24] border rounded-xl p-4 sm:p-5 flex items-start gap-4 shadow-sm relative transition-all",
                item.unread ? "border-[#FF0000]" : "border-[#0F1F3D]/20 hover:border-white/10"
              )}
            >
              {/* Left Category Icon Container */}
              <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0 text-white mt-0.5">
                {getCategoryIcon(item.category)}
              </div>

              {/* Main Content Details */}
              <div className="flex flex-col flex-1 gap-1">
                <div className="flex items-center justify-between gap-2 w-full">
                  <h3 className="text-white font-medium text-sm sm:text-base tracking-tight">
                    {item.title}
                  </h3>
                  {item.unread && (
                    <div className="w-2 h-2 rounded-full bg-[#FF0000] flex-shrink-0" />
                  )}
                </div>

                <p className="text-[#919191] text-xs sm:text-sm leading-relaxed">
                  {item.message}
                </p>

                <div className="flex items-center gap-3 mt-1.5 text-xs">
                  {item.client && (
                    <span className="text-white font-medium">{item.client}</span>
                  )}
                  <span className="text-[#919191] font-mono">{item.date}</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Feedback Popup Modal */}
      <SuccessModal
        isOpen={feedbackModal.isOpen}
        onClose={() => setFeedbackModal((prev) => ({ ...prev, isOpen: false }))}
        title={feedbackModal.title}
        description={feedbackModal.desc}
      />
    </div>
  );
}

export default function NotificationsPage() {
  return (
    <Suspense fallback={<div className="text-white p-6">Loading notifications...</div>}>
      <NotificationsContent />
    </Suspense>
  );
}
