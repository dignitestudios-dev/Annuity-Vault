"use client";

import { useState } from "react";
import SuccessModal from "@/components/shared/success-modal";
import { CheckCircle2 } from "lucide-react";

export default function SettingsGoogleCalendarPage() {
  const [isConnected, setIsConnected] = useState(false);
  const [isSuccessOpen, setIsSuccessOpen] = useState(false);
  const [successMsg, setSuccessMsg] = useState({ title: "", description: "" });

  const handleToggleConnect = () => {
    if (!isConnected) {
      setIsConnected(true);
      setSuccessMsg({
        title: "Google Calendar Connected!",
        description: "Your contract anniversaries and task due dates will now sync automatically.",
      });
      setIsSuccessOpen(true);
    } else {
      setIsConnected(false);
      setSuccessMsg({
        title: "Google Calendar Disconnected",
        description: "Google Calendar sync has been disconnected from your account.",
      });
      setIsSuccessOpen(true);
    }
  };

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
            {isConnected && (
              <span className="inline-flex items-center gap-1 bg-[#34C759]/10 text-[#34C759] text-xs font-medium px-2.5 py-0.5 rounded-full border border-[#34C759]/20">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Connected (a.smith@annuityvault.com)
              </span>
            )}
          </div>
          <p className="text-[#919191] text-sm font-normal leading-relaxed">
            Sync contract anniversaries, task due dates, and reminders directly to your Google Calendar.
          </p>
        </div>

        {/* Connect Action Button */}
        <button
          type="button"
          onClick={handleToggleConnect}
          className="bg-gradient-to-r from-[#66859E] to-[#849EB2] text-white font-semibold text-xs sm:text-sm h-11 px-6 rounded-xl hover:opacity-90 transition-all cursor-pointer shadow-sm flex-shrink-0 self-start sm:self-center"
        >
          {isConnected ? "Disconnect Google Calendar" : "Connect Google Calender"}
        </button>
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
