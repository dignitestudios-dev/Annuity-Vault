"use client";
import { Loader } from "@/components/ui/loader";
import { Skeleton } from "@/components/ui/skeleton";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Calendar, CheckSquare, Info, Check, Bell } from "lucide-react";
import SuccessModal from "@/components/shared/success-modal";
import { EmptyState } from "@/components/shared/empty-state";
import { cn } from "@/lib/utils";

import { 
  useNotifications, 
  useMarkAllNotificationsRead, 
  useMarkNotificationRead, 
  NotificationItem 
} from "@/features/notifications/api/notifications.service";

type NotificationTab = "all" | "Anniversary" | "Task" | "System";

const TABS: { id: NotificationTab; label: string }[] = [
  { id: "all", label: "All" },
  { id: "Anniversary", label: "Anniversaries" },
  { id: "Task", label: "Tasks" },
  { id: "System", label: "System" },
];

function NotificationsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const tabParam = searchParams.get("tab") as NotificationTab | null;
  const [activeTab, setActiveTab] = useState<NotificationTab>(
    tabParam && ["all", "Anniversary", "Task", "System"].includes(tabParam) ? tabParam : "all"
  );
  const [feedbackModal, setFeedbackModal] = useState<{ isOpen: boolean; title: string; desc: string }>({
    isOpen: false,
    title: "",
    desc: "",
  });

  useEffect(() => {
    if (tabParam && ["all", "Anniversary", "Task", "System"].includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, [tabParam]);

  const handleTabChange = (newTab: NotificationTab) => {
    setActiveTab(newTab);
    const params = new URLSearchParams(searchParams.toString());
    if (newTab === "all") {
      params.delete("tab");
    } else {
      params.set("tab", newTab);
    }
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const { data, isLoading } = useNotifications({
    type: activeTab === "all" ? undefined : activeTab,
    page: 1, // Add pagination state if needed in the future
    limit: 50,
  });

  const markAllAsReadMutation = useMarkAllNotificationsRead();
  const markAsReadMutation = useMarkNotificationRead();

  const notifications = data?.data?.notifications || [];

  const handleMarkAllRead = async () => {
    try {
      await markAllAsReadMutation.mutateAsync();
      setFeedbackModal({
        isOpen: true,
        title: "Notifications Updated",
        desc: "All notifications have been marked as read.",
      });
    } catch (error) {
      console.error("Failed to mark all as read:", error);
    }
  };

  const handleNotificationClick = async (notification: NotificationItem) => {
    const notificationId = notification.id || notification._id;
    if (!notification.isRead && notificationId && notificationId !== "undefined") {
      try {
        await markAsReadMutation.mutateAsync(notificationId);
      } catch (error) {
        console.error("Failed to mark as read:", error);
      }
    }
    
    // Optionally navigate based on relatedEntity
    if (notification.relatedEntity) {
      const entityId = notification.relatedEntity.id || notification.relatedEntity._id;
      if (notification.relatedEntity.type === "Contract" && entityId) {
        router.push(`/dashboard/contracts/${entityId}`);
      } else if (notification.relatedEntity.type === "Task") {
        router.push(`/dashboard/tasks`);
      }
    }
  };

  const getCategoryIcon = (category: "Anniversary" | "Task" | "System") => {
    switch (category) {
      case "Anniversary":
        return <Calendar className="w-4 h-4 text-white" />;
      case "Task":
        return <CheckSquare className="w-4 h-4 text-white" />;
      case "System":
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
              onClick={() => handleTabChange(tab.id)}
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
        {isLoading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <div key={`skeleton-${i}`} className="w-full bg-[#141C24] border border-[#0F1F3D]/20 rounded-xl p-4 sm:p-5 flex items-start gap-4 h-[106px]">
              <Skeleton className="w-8 h-8 rounded-lg bg-white/5 flex-shrink-0" />
              <div className="flex flex-col flex-1 gap-2 w-full mt-0.5">
                <Skeleton className="h-5 w-[120px] bg-white/5 rounded-md" />
                <Skeleton className="h-4 w-full bg-white/5 rounded-md" />
                <div className="flex gap-3 mt-1.5">
                  <Skeleton className="h-4 w-[80px] bg-white/5 rounded-md" />
                  <Skeleton className="h-4 w-[60px] bg-white/5 rounded-md" />
                </div>
              </div>
            </div>
          ))
        ) : notifications.length === 0 ? (
          <EmptyState 
            icon={Bell}
            title="No notifications"
            description="You don't have any notifications in this category yet."
            className="py-12"
          />
        ) : (
          notifications.map((item, i) => (
            <div
              key={item.id || item._id || `notification-${i}`}
              onClick={() => handleNotificationClick(item)}
              className={cn(
                "w-full bg-[#141C24] border rounded-xl p-4 sm:p-5 flex items-start gap-4 shadow-sm relative transition-all cursor-pointer",
                !item.isRead ? "border-[#FF0000]" : "border-[#0F1F3D]/20 hover:border-white/10"
              )}
            >
              {/* Left Category Icon Container */}
              <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0 text-white mt-0.5">
                {getCategoryIcon(item.type)}
              </div>

              {/* Main Content Details */}
              <div className="flex flex-col flex-1 gap-1">
                <div className="flex items-center justify-between gap-2 w-full">
                  <h3 className="text-white font-medium text-sm sm:text-base tracking-tight">
                    {item.title}
                  </h3>
                  {!item.isRead && (
                    <div className="w-2 h-2 rounded-full bg-[#FF0000] flex-shrink-0" />
                  )}
                </div>

                <p className="text-[#919191] text-xs sm:text-sm leading-relaxed">
                  {item.message}
                </p>

                <div className="flex items-center gap-3 mt-1.5 text-xs">
                  {item.relatedName && (
                    <span className="text-white font-medium">{item.relatedName}</span>
                  )}
                  <span className="text-[#919191] font-mono">
                    {new Date(item.createdAt).toLocaleDateString("en-US", { year: 'numeric', month: 'short', day: 'numeric' })}
                  </span>
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
    <Suspense fallback={<div className="text-white p-6"><Skeleton className="h-[400px] w-full bg-white/5 rounded-xl" /></div>}>
      <NotificationsContent />
    </Suspense>
  );
}
