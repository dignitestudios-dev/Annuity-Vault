"use client";

import { useState, useEffect, useRef } from "react";
import SuccessModal from "@/components/shared/success-modal";
import DeleteModal from "@/components/shared/delete-modal";
import { CheckCircle2, Loader2, RefreshCw, AlertCircle, ShieldAlert, Calendar, Info } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import toast from "react-hot-toast";
import {
  useGoogleCalendarStatus,
  connectGoogleCalendar,
  useDisconnectGoogleCalendar,
  useSyncGoogleCalendar,
} from "@/features/settings/api/settings.service";
import { useAppSelector } from "@/store";

function GoogleLogo({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
        fill="#EA4335"
      />
    </svg>
  );
}

const isAuthorizedApiOrigin = (origin: string): boolean => {
  try {
    const configuredOrigin = new URL(
      process.env.NEXT_PUBLIC_API_URL || "https://api.dev.annuity-vault.com/api/v1"
    ).origin;
    if (origin === configuredOrigin) return true;
  } catch {}
  if (origin === "https://api.annuity-vault.com") return true;
  if (origin === "https://api.dev.annuity-vault.com") return true;
  if (process.env.NODE_ENV !== "production") {
    if (origin.includes("localhost") || origin.includes("devtunnels.ms")) return true;
  }
  return false;
};

export default function GoogleCalendarView() {
  const user = useAppSelector((state) => state.auth.user);
  const userRole = typeof user?.role === "object" ? (user?.role as any)?.name : user?.role;
  const isAdmin = userRole === "Admin";

  const { data: status, isLoading, error, refetch } = useGoogleCalendarStatus();
  const disconnectMutation = useDisconnectGoogleCalendar();
  const syncMutation = useSyncGoogleCalendar();

  const [isConnectLoading, setIsConnectLoading] = useState(false);
  const [isDisconnectModalOpen, setIsDisconnectModalOpen] = useState(false);
  const [isSuccessOpen, setIsSuccessOpen] = useState(false);
  const [successMsg, setSuccessMsg] = useState({ title: "", description: "" });
  const [errorMessage, setErrorMessage] = useState("");
  const [isServiceUnavailable, setIsServiceUnavailable] = useState(false);

  const popupRef = useRef<Window | null>(null);

  // Refetch connection status when user returns to tab
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

    // Open popup synchronously inside the click handler to prevent popup blocking
    const popup = window.open("", "google-calendar-connect", "width=520,height=680");
    if (!popup) {
      setIsConnectLoading(false);
      const msg = "Popup blocked — please allow popups for this site to connect Google Calendar.";
      setErrorMessage(msg);
      toast.error(msg);
      return;
    }

    popupRef.current = popup;

    try {
      const { authUrl } = await connectGoogleCalendar();
      if (!authUrl) {
        popup.close();
        setErrorMessage("Invalid authorization URL received from server.");
        setIsConnectLoading(false);
        return;
      }

      popup.location.href = authUrl;

      // Await postMessage or popup close
      await new Promise<boolean>((resolve) => {
        let isResolved = false;

        const finish = (ok: boolean) => {
          if (isResolved) return;
          isResolved = true;
          window.removeEventListener("message", onMessage);
          clearInterval(closedPoll);
          resolve(ok);
        };

        const onMessage = (event: MessageEvent) => {
          if (!isAuthorizedApiOrigin(event.origin)) return;
          if (event.data?.type !== "GOOGLE_CALENDAR_CONNECTED") return;
          finish(Boolean(event.data.success));
        };

        window.addEventListener("message", onMessage);

        const closedPoll = setInterval(() => {
          if (popup.closed) {
            finish(false);
          }
        }, 500);
      });

      // Always re-check status directly from server
      const latestStatus = await refetch();
      if (latestStatus.data?.connected) {
        setSuccessMsg({
          title: "Google Calendar Connected",
          description:
            "Your Google Calendar has been connected! Open tasks and contract anniversaries are now syncing in the background.",
        });
        setIsSuccessOpen(true);
      }
    } catch (err: any) {
      if (popup && !popup.closed) {
        popup.close();
      }

      const statusCode = err?.response?.status || err?.status;
      const is503 =
        statusCode === 503 ||
        err?.message?.includes("not configured") ||
        err?.message?.includes("GOOGLE_CLIENT_ID") ||
        err?.message?.includes("GOOGLE_CLIENT_SECRET");
      const is403 =
        statusCode === 403 ||
        err?.message?.includes("only available for Advisor");

      if (is503) {
        setIsServiceUnavailable(true);
        setErrorMessage("");
      } else if (is403) {
        setErrorMessage("Google Calendar is only available for Advisor accounts.");
      } else {
        const msg = err?.response?.data?.message || err?.message || "Failed to initiate Google Calendar connection.";
        setErrorMessage(msg);
      }
    } finally {
      setIsConnectLoading(false);
    }
  };

  const handleSyncNow = async () => {
    setErrorMessage("");
    try {
      await syncMutation.mutateAsync();
      toast.success("Sync started, events will appear in Google Calendar shortly");
      refetch();
    } catch (err: any) {
      const msg = err?.response?.data?.message || "Failed to synchronize Google Calendar.";
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
        title: "Google Calendar Disconnected",
        description:
          "Google Calendar sync has been disconnected from your account. Existing calendar events remain untouched.",
      });
      setIsSuccessOpen(true);
    } catch (err: any) {
      setErrorMessage(
        err?.response?.data?.message || "Failed to disconnect Google Calendar."
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
          <Skeleton className="w-full h-[120px] bg-[#141C24] border border-white/5 rounded-xl shadow-sm" />
        </div>
      </div>
    );
  }

  // Advisor only check
  if (isAdmin) {
    return (
      <div className="w-full flex flex-col font-sans">
        <h2 className="text-2xl font-semibold text-white tracking-tight pb-4 border-b border-[#333333] mb-6">
          Google Calendar
        </h2>
        <div className="bg-[#141C24] border border-[#FF3E46]/20 rounded-xl p-5 flex items-start gap-3.5">
          <ShieldAlert className="w-5 h-5 text-[#FF3E46] flex-shrink-0 mt-0.5" />
          <div className="flex flex-col gap-1">
            <h3 className="text-white font-medium text-sm">Advisor Accounts Only</h3>
            <p className="text-[#919191] text-xs sm:text-sm">
              Google Calendar integration is only available for Advisor accounts. Administrator accounts cannot connect or sync personal calendars.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const is503FromStatus =
    (error as any)?.response?.status === 503 ||
    (error as any)?.status === 503 ||
    (error as any)?.message?.includes("not configured") ||
    (error as any)?.message?.includes("GOOGLE_CLIENT_ID");

  const isConfigured = !isServiceUnavailable && !is503FromStatus;

  return (
    <div className="w-full flex flex-col font-sans">
      {/* Header */}
      <h2 className="text-2xl font-semibold text-white tracking-tight pb-4 border-b border-[#333333] mb-6">
        Google Calendar
      </h2>

      {/* Main Settings Card Row */}
      <div className="w-full border-b border-white/10 pb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Left Information Area */}
        <div className="flex flex-col gap-1.5 flex-1 min-w-0 pr-2">
          <div className="flex items-center gap-2 flex-wrap">
            <GoogleLogo className="w-4 h-4 flex-shrink-0" />
            <h3 className="text-white font-semibold text-base">
              Google Calendar
            </h3>
            {status?.connected && (
              <span className="inline-flex items-center gap-1 bg-[#34C759]/10 text-[#34C759] text-xs font-medium px-2.5 py-0.5 rounded-full border border-[#34C759]/20">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Connected {user?.email ? `(${user.email})` : ""}
              </span>
            )}
          </div>
          <p className="text-[#919191] text-sm font-normal leading-relaxed">
            Sync upcoming contract anniversaries, task due dates, and reminders directly to your Google Calendar account.
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
                <GoogleLogo className="w-4 h-4" />
              )}
              {isConfigured ? "Connect Google Calendar" : "Google Calendar isn't available yet"}
            </button>
          )}

          {!isConfigured && (
            <span className="flex items-center gap-1.5 text-amber-400 text-xs text-left sm:text-right max-w-[280px]">
              <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
              Google Calendar isn&apos;t available yet on this server.
            </span>
          )}

          {isConfigured && errorMessage && (
            <span className="flex items-center gap-1.5 text-[#FF3E46] text-xs text-left sm:text-right max-w-[280px]">
              <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
              {errorMessage}
            </span>
          )}
        </div>
      </div>

      {/* Integration Details / Info Section */}
      <div className="mt-8 flex flex-col gap-4">
        <h4 className="text-sm font-semibold text-white uppercase tracking-wider">
          Integration Details
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-[#141C24] border border-white/5 rounded-xl p-4 flex flex-col gap-2">
            <div className="flex items-center gap-2 text-white text-sm font-medium">
              <Calendar className="w-4 h-4 text-[#849EB2]" />
              Contract Anniversaries
            </div>
            <p className="text-xs text-[#919191] leading-relaxed">
              Every contract anniversary syncs as a yearly recurring all-day event with client, provider, policy, and contract details.
            </p>
          </div>

          <div className="bg-[#141C24] border border-white/5 rounded-xl p-4 flex flex-col gap-2">
            <div className="flex items-center gap-2 text-white text-sm font-medium">
              <RefreshCw className="w-4 h-4 text-[#849EB2]" />
              Tasks & Reminders
            </div>
            <p className="text-xs text-[#919191] leading-relaxed">
              Your open tasks sync with automated priority color-coding (urgent tasks in red) and reminders scheduled before due dates.
            </p>
          </div>
        </div>

        <div className="bg-[#141C24]/60 border border-white/5 rounded-xl p-3.5 flex items-start gap-2.5 mt-1">
          <Info className="w-4 h-4 text-[#849EB2] flex-shrink-0 mt-0.5" />
          <p className="text-xs text-[#919191] leading-relaxed">
            Note: Disconnecting stops future synchronization. Events already created in your Google Calendar will not be deleted.
          </p>
        </div>
      </div>

      {/* Disconnect Confirmation Modal */}
      <DeleteModal
        isOpen={isDisconnectModalOpen}
        onClose={() => setIsDisconnectModalOpen(false)}
        onConfirm={handleConfirmDisconnect}
        title="Disconnect Google Calendar"
        description="Are you sure you want to disconnect Google Calendar? Events already created in your calendar will remain, but new tasks and contract anniversaries will no longer sync."
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
