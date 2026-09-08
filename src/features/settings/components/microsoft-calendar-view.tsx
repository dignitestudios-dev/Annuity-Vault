"use client";

import { useState, useEffect } from "react";
import SuccessModal from "@/components/shared/success-modal";
import DeleteModal from "@/components/shared/delete-modal";
import { CheckCircle2, Loader2, RefreshCw, AlertCircle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import toast from "react-hot-toast";
import {
  useMicrosoftCalendarStatus,
  connectMicrosoftCalendar,
  useDisconnectMicrosoftCalendar,
  useSyncMicrosoftCalendar,
} from "@/features/settings/api/settings.service";
import { useAppSelector } from "@/store";

function MicrosoftLogo({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 21 21" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="1" y="1" width="9" height="9" fill="#F25022" rx="1" />
      <rect x="11" y="1" width="9" height="9" fill="#7FBA00" rx="1" />
      <rect x="1" y="11" width="9" height="9" fill="#00A4EF" rx="1" />
      <rect x="11" y="11" width="9" height="9" fill="#FFB900" rx="1" />
    </svg>
  );
}

export default function MicrosoftCalendarView() {
  const user = useAppSelector((state) => state.auth.user);
  const { data: status, isLoading, error, refetch } = useMicrosoftCalendarStatus();
  const disconnectMutation = useDisconnectMicrosoftCalendar();
  const syncMutation = useSyncMicrosoftCalendar();

  const [isConnectLoading, setIsConnectLoading] = useState(false);
  const [isDisconnectModalOpen, setIsDisconnectModalOpen] = useState(false);
  const [isSuccessOpen, setIsSuccessOpen] = useState(false);
  const [successMsg, setSuccessMsg] = useState({ title: "", description: "" });
  const [errorMessage, setErrorMessage] = useState("");

  // Refetch connection status when user returns to tab after completing OAuth in new tab
  useEffect(() => {
    const handleFocus = () => {
      refetch();
    };
    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, [refetch]);

  const handleConnect = async () => {
    setErrorMessage("");
    setIsConnectLoading(true);
    try {
      const { authUrl } = await connectMicrosoftCalendar();
      if (authUrl) {
        window.open(authUrl, "_blank", "noopener,noreferrer");
      } else {
        setErrorMessage("Invalid authorization URL received.");
      }
    } catch (err: any) {
      if (err?.response?.status === 503) {
        setErrorMessage(
          err?.response?.data?.message ||
            "Microsoft Calendar is currently not configured on this environment."
        );
      } else {
        setErrorMessage(
          err?.response?.data?.message || "Failed to initiate Microsoft Calendar connection."
        );
      }
    } finally {
      setIsConnectLoading(false);
    }
  };

  const handleSyncNow = async () => {
    setErrorMessage("");
    try {
      const response = await syncMutation.mutateAsync();
      const tasksCount = response?.data?.tasksCount ?? 0;
      const anniversariesCount = response?.data?.anniversariesCount ?? 0;
      toast.success(`Calendar synced (${tasksCount} tasks, ${anniversariesCount} anniversaries)`);
    } catch (err: any) {
      const msg = err?.response?.data?.message || "Failed to synchronize Microsoft Calendar.";
      toast.error(msg);
      setErrorMessage(msg);
    }
  };

  const handleConfirmDisconnect = async () => {
    setErrorMessage("");
    try {
      await disconnectMutation.mutateAsync();
      setIsDisconnectModalOpen(false);
      setSuccessMsg({
        title: "Microsoft Calendar Disconnected",
        description: "Microsoft Calendar sync has been disconnected from your account.",
      });
      setIsSuccessOpen(true);
    } catch (err: any) {
      setErrorMessage(
        err?.response?.data?.message || "Failed to disconnect Microsoft Calendar."
      );
      setIsDisconnectModalOpen(false);
    }
  };

  if (isLoading) {
    return (
      <div className="w-full flex flex-col font-sans">
        <div className="flex items-center justify-between pb-4 border-b border-[#333333] mb-6">
          <Skeleton className="h-8 w-[240px] bg-white/5 rounded-md" />
        </div>
        <div className="flex flex-col gap-3.5 w-full">
          <Skeleton className="w-full h-[100px] bg-[#141C24] border border-white/5 rounded-xl shadow-sm" />
        </div>
      </div>
    );
  }

  const isConfigured = !error || (error as any)?.response?.status !== 503;

  return (
    <div className="w-full flex flex-col font-sans">
      {/* Header */}
      <h2 className="text-2xl font-semibold text-white tracking-tight pb-4 border-b border-[#333333] mb-6">
        Microsoft Calendar
      </h2>

      {/* Main Settings Card Row */}
      <div className="w-full border-b border-white/10 pb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Left Information Area */}
        <div className="flex flex-col gap-1.5 flex-1 min-w-0 pr-2">
          <div className="flex items-center gap-2 flex-wrap">
            <MicrosoftLogo className="w-4 h-4 flex-shrink-0" />
            <h3 className="text-white font-semibold text-base">
              Microsoft Calendar
            </h3>
            {status?.connected && (
              <span className="inline-flex items-center gap-1 bg-[#34C759]/10 text-[#34C759] text-xs font-medium px-2.5 py-0.5 rounded-full border border-[#34C759]/20">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Connected {user?.email ? `(${user.email})` : ""}
              </span>
            )}
          </div>
          <p className="text-[#919191] text-sm font-normal leading-relaxed">
            Sync upcoming contract anniversaries, task due dates, and reminders directly to your Microsoft Calendar account.
          </p>
        </div>

        {/* Action Buttons & Status Error */}
        <div className="flex flex-col sm:items-end gap-2 flex-shrink-0">
          {status?.connected ? (
            <div className="flex items-center gap-2.5 flex-wrap">
              {/* Sync Now Button */}
              <button
                type="button"
                onClick={handleSyncNow}
                disabled={syncMutation.isPending}
                className="bg-gradient-to-r from-[#66859E] to-[#849EB2] text-white font-semibold text-xs sm:text-sm h-11 px-5 rounded-xl hover:opacity-90 transition-all cursor-pointer shadow-sm flex items-center justify-center gap-2 whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${syncMutation.isPending ? "animate-spin" : ""}`} />
                {syncMutation.isPending ? "Syncing..." : "Sync Now"}
              </button>

              {/* Disconnect Button */}
              <button
                type="button"
                onClick={() => setIsDisconnectModalOpen(true)}
                disabled={disconnectMutation.isPending}
                className="bg-[#FF3E46]/10 hover:bg-[#FF3E46]/20 text-[#FF3E46] border border-[#FF3E46]/30 font-medium text-xs sm:text-sm h-11 px-5 rounded-xl transition-all cursor-pointer shadow-sm flex items-center justify-center gap-2 whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {disconnectMutation.isPending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                Disconnect
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={handleConnect}
              disabled={!isConfigured || isConnectLoading}
              className="bg-gradient-to-r from-[#66859E] to-[#849EB2] text-white font-semibold text-xs sm:text-sm h-11 px-6 rounded-xl hover:opacity-90 transition-all cursor-pointer shadow-sm flex-shrink-0 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 whitespace-nowrap"
            >
              {isConnectLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <MicrosoftLogo className="w-4 h-4" />
              )}
              Connect Microsoft Calendar
            </button>
          )}

          {!isConfigured && (
            <span className="flex items-center gap-1.5 text-[#FF3E46] text-xs text-left sm:text-right max-w-[260px]">
              <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
              Microsoft Calendar is currently not configured on this environment.
            </span>
          )}

          {errorMessage && (
            <span className="flex items-center gap-1.5 text-[#FF3E46] text-xs text-left sm:text-right max-w-[260px]">
              <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
              {errorMessage}
            </span>
          )}
        </div>
      </div>

      {/* Disconnect Confirmation Modal */}
      <DeleteModal
        isOpen={isDisconnectModalOpen}
        onClose={() => setIsDisconnectModalOpen(false)}
        onConfirm={handleConfirmDisconnect}
        title="Disconnect Microsoft Calendar"
        description="Are you sure you want to disconnect Microsoft Calendar? This will stop syncing your tasks and contract anniversaries."
        confirmText="Disconnect"
        cancelText="Keep Connected"
        isPending={disconnectMutation.isPending}
      />

      {/* Success Modal */}
      <SuccessModal
        isOpen={isSuccessOpen}
        onClose={() => setIsSuccessOpen(false)}
        title={successMsg.title}
        description={successMsg.description}
      />
    </div>
  );
}
