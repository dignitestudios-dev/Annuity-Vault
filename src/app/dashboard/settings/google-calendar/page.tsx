"use client";

import { useState } from "react";
import SuccessModal from "@/components/shared/success-modal";
import { CheckCircle2, Loader2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useGoogleCalendarStatus, connectGoogleCalendar, useDisconnectGoogleCalendar } from "@/features/settings/api/settings.service";
import { useAppSelector } from "@/store";

export default function SettingsGoogleCalendarPage() {
  const user = useAppSelector(state => state.auth.user);
  const { data: status, isLoading, error } = useGoogleCalendarStatus();
  const disconnectMutation = useDisconnectGoogleCalendar();

  const [isSuccessOpen, setIsSuccessOpen] = useState(false);
  const [successMsg, setSuccessMsg] = useState({ title: "", description: "" });
  const [errorMessage, setErrorMessage] = useState("");

  const handleToggleConnect = async () => {
    setErrorMessage("");
    if (!status?.connected) {
      try {
        const { authUrl } = await connectGoogleCalendar();
        window.location.href = authUrl;
      } catch (err: any) {
        setErrorMessage(err?.response?.data?.message || "Failed to initiate Google Calendar connection.");
      }
    } else {
      try {
        await disconnectMutation.mutateAsync();
        setSuccessMsg({
          title: "Google Calendar Disconnected",
          description: "Google Calendar sync has been disconnected from your account.",
        });
        setIsSuccessOpen(true);
      } catch (err: any) {
        setErrorMessage(err?.response?.data?.message || "Failed to disconnect Google Calendar.");
      }
    }
  };

  if (isLoading) {
    return (
      <div className="w-full flex flex-col font-sans">
        <div className="flex items-center justify-between pb-4 border-b border-[#333333] mb-6">
          <Skeleton className="h-8 w-[200px] bg-white/5 rounded-md" />
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
        Google Calender
      </h2>

      {/* Main Settings Card Row */}
      <div className="w-full border-b border-white/10 pb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-col gap-1.5 max-w-[542px]">
          <div className="flex items-center gap-2">
            <h3 className="text-white font-semibold text-base capitalize">
              Google Calendar
            </h3>
            {status?.connected && (
              <span className="inline-flex items-center gap-1 bg-[#34C759]/10 text-[#34C759] text-xs font-medium px-2.5 py-0.5 rounded-full border border-[#34C759]/20">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Connected ({user?.email})
              </span>
            )}
          </div>
          <p className="text-[#919191] text-sm font-normal leading-relaxed">
            Sync contract anniversaries, task due dates, and reminders directly to your Google Calendar.
          </p>
        </div>

        {/* Connect Action Button */}
        <div className="flex flex-col gap-2">
          <button
            type="button"
            onClick={handleToggleConnect}
            disabled={!isConfigured || disconnectMutation.isPending}
            className="bg-gradient-to-r from-[#66859E] to-[#849EB2] text-white font-semibold text-xs sm:text-sm h-11 px-6 rounded-xl hover:opacity-90 transition-all cursor-pointer shadow-sm flex-shrink-0 self-start sm:self-center disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {disconnectMutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
            {status?.connected ? "Disconnect Google Calendar" : "Connect Google Calendar"}
          </button>
          {!isConfigured && (
            <span className="text-[#FF3E46] text-xs text-center max-w-[200px]">
              Google Calendar integration is not currently configured on the server.
            </span>
          )}
          {errorMessage && (
            <span className="text-[#FF3E46] text-xs text-center max-w-[200px]">
              {errorMessage}
            </span>
          )}
        </div>
      </div>

      {/* Success Feedback Modal */}
      <SuccessModal
        isOpen={isSuccessOpen}
        onClose={() => setIsSuccessOpen(false)}
        title={successMsg.title}
        description={successMsg.description}
      />
    </div>
  );
}
