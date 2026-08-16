"use client";

import { useLegalContent } from "@/features/settings/api/settings.service";
import { Loader2 } from "lucide-react";

export default function SettingsTermsPage() {
  const { data: terms, isLoading } = useLegalContent("terms");
  return (
    <div className="w-full flex flex-col font-sans">
      <h2 className="text-2xl font-semibold text-white tracking-tight pb-4 border-b border-[#333333] mb-6">
        Terms & Conditions
      </h2>

      <div className="flex flex-col gap-4 text-sm text-[#919191] leading-relaxed max-w-[800px]">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-8 h-8 animate-spin text-[#6887A0]" />
          </div>
        ) : (
          <div dangerouslySetInnerHTML={{ __html: terms?.content || "No terms available." }} />
        )}
      </div>
    </div>
  );
}
