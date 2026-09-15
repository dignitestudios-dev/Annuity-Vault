"use client";

import { useState, useEffect } from "react";
import SuccessModal from "@/components/shared/success-modal";
import { cn } from "@/lib/utils";
import { useNotificationPreferences, useUpdateNotificationPreferences } from "@/features/settings/api/settings.service";
import { Loader2, Bell, BellOff, BellRing } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { showBrowserNotification } from "@/components/notification-permission";
import toast from "react-hot-toast";

interface NotificationSettingItem {
  id: "days30" | "days60" | "days90" | "days180" | "taskDueDates" | "systemAlerts";
  title: string;
  description: string;
  enabled: boolean;
  category: "anniversaryAlerts" | "general";
}

const INITIAL_SETTINGS: NotificationSettingItem[] = [
  {
    id: "days30",
    title: "Contract Anniversaries — 30 Days Out",
    description: "Receive an alert 30 days before a contract anniversary",
    enabled: true,
    category: "anniversaryAlerts"
  },
  {
    id: "days60",
    title: "Contract Anniversaries — 60 Days Out",
    description: "Receive an alert 60 days before a contract anniversary",
    enabled: true,
    category: "anniversaryAlerts"
  },
  {
    id: "days90",
    title: "Contract Anniversaries — 90 Days Out",
    description: "Receive an alert 90 days before a contract anniversary",
    enabled: true,
    category: "anniversaryAlerts"
  },
  {
    id: "days180",
    title: "Contract Anniversaries — 180 Days Out",
    description: "Receive an alert 180 days before a contract anniversary",
    enabled: true,
    category: "anniversaryAlerts"
  },
  {
    id: "taskDueDates",
    title: "Task Due Dates",
    description: "Alerts when tasks are approaching their due date",
    enabled: true,
    category: "general"
  },
  {
    id: "systemAlerts",
    title: "System Alerts",
    description: "Platform updates and maintenance notifications",
    enabled: true,
    category: "general"
  },
];

export default function SettingsNotificationsPage() {
  const [settings, setSettings] = useState<NotificationSettingItem[]>(INITIAL_SETTINGS);
  const [feedbackModal, setFeedbackModal] = useState<{ isOpen: boolean; title: string; desc: string }>({
    isOpen: false,
    title: "",
    desc: "",
  });
  const [permissionStatus, setPermissionStatus] = useState<NotificationPermission | "unsupported">("default");
  const [isTesting, setIsTesting] = useState(false);
  
  const { data: preferences, isLoading, error } = useNotificationPreferences();
  const updateMutation = useUpdateNotificationPreferences();

  // Check real-time browser permission status
  useEffect(() => {
    if (typeof window === "undefined" || !("Notification" in window)) {
      setPermissionStatus("unsupported");
      return;
    }
    setPermissionStatus(Notification.permission);
  }, []);

  const handleTestNotification = async () => {
    if (permissionStatus !== "granted") {
      toast.error("Notifications are not enabled. Please allow notifications in your browser settings.");
      return;
    }
    setIsTesting(true);
    try {
      const ok = await showBrowserNotification(
        "🔔 Test Notification",
        "Browser notifications are working correctly for Annuity Vault!",
        "/images/logo.png",
        "/dashboard"
      );
      if (!ok) toast.error("Could not send notification. Check browser permissions.");
    } finally {
      setIsTesting(false);
    }
  };

  useEffect(() => {
    if (preferences) {
      setSettings(prev => prev.map(item => {
        if (item.category === "anniversaryAlerts") {
          return { ...item, enabled: preferences.anniversaryAlerts[item.id as "days30" | "days60" | "days90" | "days180"] ?? item.enabled };
        } else {
          return { ...item, enabled: preferences[item.id as "taskDueDates" | "systemAlerts"] ?? item.enabled };
        }
      }));
    }
  }, [preferences]);

  if (isLoading) {
    return (
      <div className="w-full flex flex-col font-sans">
        <div className="flex items-center justify-between pb-4 border-b border-[#333333] mb-6">
          <Skeleton className="h-8 w-[150px] bg-white/5 rounded-md" />
        </div>
        <div className="flex flex-col gap-3.5 w-full">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={`skel-${i}`} className="w-full h-[74px] bg-[#141C24] border border-white/5 rounded-xl shadow-sm" />
          ))}
        </div>
      </div>
    );
  }
  
  if (error && (error as any)?.response?.status === 403) {
    return <div className="p-8 text-center text-[#919191]">Notification preferences are only available for Advisor accounts.</div>;
  }

  const toggleSetting = (id: string) => {
    setSettings((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, enabled: !item.enabled } : item
      )
    );
  };

  const handleSavePreferences = async () => {
    try {
      const anniversaryAlerts = {
        days30: settings.find(s => s.id === "days30")?.enabled || false,
        days60: settings.find(s => s.id === "days60")?.enabled || false,
        days90: settings.find(s => s.id === "days90")?.enabled || false,
        days180: settings.find(s => s.id === "days180")?.enabled || false,
      };
      const taskDueDates = settings.find(s => s.id === "taskDueDates")?.enabled || false;
      const systemAlerts = settings.find(s => s.id === "systemAlerts")?.enabled || false;

      await updateMutation.mutateAsync({
        anniversaryAlerts,
        taskDueDates,
        systemAlerts
      });

      setFeedbackModal({
        isOpen: true,
        title: "Notification Settings Saved!",
        desc: "Your notification alert preferences have been updated successfully.",
      });
    } catch (e: any) {
      console.error(e);
      // Could show error modal
    }
  };

  return (
    <div className="w-full flex flex-col font-sans">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-[#333333] mb-6">
        <h2 className="text-2xl font-semibold text-white tracking-tight">
          Notification
        </h2>

        <button
          onClick={handleSavePreferences}
          disabled={updateMutation.isPending}
          className="bg-gradient-to-r from-[#66859E] to-[#849EB2] text-white font-semibold text-xs sm:text-sm h-9 px-5 rounded-xl hover:opacity-90 transition-all cursor-pointer shadow-sm flex items-center justify-center gap-2 disabled:opacity-70"
        >
          {updateMutation.isPending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
          Save Preferences
        </button>
      </div>

      {/* Test Browser Notification Card */}
      <div className="w-full bg-[#141C24] border border-white/5 rounded-xl p-4 sm:p-5 mb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
        <div className="flex items-start gap-3.5">
          <div className={cn(
            "flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center",
            permissionStatus === "granted" ? "bg-[#34C759]/15" :
            permissionStatus === "denied"  ? "bg-[#FF3E46]/15" :
                                             "bg-[#66859E]/15"
          )}>
            {permissionStatus === "granted" ? (
              <BellRing className="w-5 h-5 text-[#34C759]" />
            ) : permissionStatus === "denied" ? (
              <BellOff className="w-5 h-5 text-[#FF3E46]" />
            ) : (
              <Bell className="w-5 h-5 text-[#66859E]" />
            )}
          </div>
          <div className="flex flex-col gap-0.5">
            <div className="flex items-center gap-2">
              <h3 className="text-white font-semibold text-sm sm:text-base tracking-tight">Browser Notifications</h3>
              <span className={cn(
                "text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase tracking-wide",
                permissionStatus === "granted" ? "bg-[#34C759]/15 text-[#34C759]" :
                permissionStatus === "denied"  ? "bg-[#FF3E46]/15 text-[#FF3E46]" :
                permissionStatus === "unsupported" ? "bg-white/10 text-[#919191]" :
                                                     "bg-[#66859E]/15 text-[#66859E]"
              )}>
                {permissionStatus === "granted"     ? "Granted" :
                 permissionStatus === "denied"      ? "Denied" :
                 permissionStatus === "unsupported" ? "Not Supported" :
                                                      "Not Set"}
              </span>
            </div>
            <p className="text-[#919191] text-xs sm:text-sm font-normal leading-relaxed">
              {permissionStatus === "granted"
                ? "Click \"Send Test\" to verify browser notifications appear on your OS."
                : permissionStatus === "denied"
                ? "Notifications are blocked. Allow them in your browser site settings and reload."
                : permissionStatus === "unsupported"
                ? "Your browser does not support notifications."
                : "Notifications permission hasn't been set yet. Navigate to the dashboard to trigger the prompt."}
            </p>
          </div>
        </div>

        <button
          id="test-notification-btn"
          onClick={handleTestNotification}
          disabled={isTesting || permissionStatus !== "granted"}
          className="flex-shrink-0 flex items-center justify-center gap-2 h-9 px-5 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer bg-[#192430] border border-white/10 text-white hover:bg-[#1f2e3d] disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {isTesting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <BellRing className="w-3.5 h-3.5" />}
          {isTesting ? "Sending…" : "Send Test"}
        </button>
      </div>
      <div className="flex flex-col gap-3.5 w-full">
        {settings.map((item) => (
          <div
            key={item.id}
            className="w-full bg-[#141C24] border border-white/5 rounded-xl p-4 sm:p-5 flex items-center justify-between gap-4 transition-all shadow-sm"
          >
            {/* Left Title & Subtitle */}
            <div className="flex flex-col gap-1 pr-4">
              <h3 className="text-white font-semibold text-sm sm:text-base tracking-tight capitalize">
                {item.title}
              </h3>
              <p className="text-[#919191] text-xs sm:text-sm font-normal leading-relaxed">
                {item.description}
              </p>
            </div>

            {/* Right Green iOS/Figma Style Toggle Switch */}
            <button
              type="button"
              role="switch"
              aria-checked={item.enabled}
              onClick={() => toggleSetting(item.id)}
              className={cn(
                "relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none shadow-inner",
                item.enabled ? "bg-[#34C759]" : "bg-[#394A58]"
              )}
            >
              <span
                className={cn(
                  "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out",
                  item.enabled ? "translate-x-5" : "translate-x-0"
                )}
              />
            </button>
          </div>
        ))}
      </div>

      {/* Success Modal Feedback */}
      <SuccessModal
        isOpen={feedbackModal.isOpen}
        onClose={() => setFeedbackModal((prev) => ({ ...prev, isOpen: false }))}
        title={feedbackModal.title}
        description={feedbackModal.desc}
      />
    </div>
  );
}
