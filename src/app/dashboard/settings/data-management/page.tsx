"use client";

import { useState } from "react";
import DeleteModal from "@/components/shared/delete-modal";
import SuccessModal from "@/components/shared/success-modal";

export default function SettingsDataManagementPage() {
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [successModal, setSuccessModal] = useState<{ isOpen: boolean; title: string; desc: string }>({
    isOpen: false,
    title: "",
    desc: "",
  });

  const handleDownloadCSV = () => {
    setSuccessModal({
      isOpen: true,
      title: "Export Started!",
      desc: "Your data is being exported to CSV. The file download will begin shortly.",
    });
  };

  const handleConfirmReset = () => {
    setSuccessModal({
      isOpen: true,
      title: "Data Reset Completed!",
      desc: "All accounts, transactions, budgets, goals, and settings have been reset successfully.",
    });
  };

  return (
    <div className="w-full flex flex-col font-sans">
      {/* Header */}
      <h2 className="text-2xl font-semibold text-white tracking-tight pb-4 border-b border-[#333333] mb-6">
        Data Management
      </h2>

      {/* Cards List */}
      <div className="flex flex-col gap-4 w-full">
        {/* Card 1: Export as CSV */}
        <div className="w-full bg-[#141C24] border border-white/5 rounded-xl p-4 sm:p-5 flex items-center justify-between gap-4 shadow-sm">
          <div className="flex flex-col gap-1 pr-4">
            <h3 className="text-white font-semibold text-base capitalize">
              Export As CSV
            </h3>
            <p className="text-[#919191] text-sm font-normal">
              Export All Data
            </p>
          </div>

          <button
            type="button"
            onClick={handleDownloadCSV}
            className="bg-gradient-to-r from-[#66859E] to-[#849EB2] text-white font-semibold text-xs sm:text-sm h-11 px-7 rounded-xl hover:opacity-90 transition-all cursor-pointer shadow-sm flex-shrink-0"
          >
            Download
          </button>
        </div>

        {/* Card 2: Reset All Data */}
        <div className="w-full bg-[#141C24] border border-white/5 rounded-xl p-4 sm:p-5 flex items-center justify-between gap-4 shadow-sm">
          <div className="flex flex-col gap-1 pr-4">
            <h3 className="text-white font-semibold text-base capitalize">
              Reset All Data
            </h3>
            <p className="text-[#919191] text-sm font-normal leading-relaxed max-w-[440px]">
              This will permanently delete all your accounts, transactions, budgets, goals, and settings.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setIsDeleteOpen(true)}
            className="bg-gradient-to-r from-[#66859E] to-[#849EB2] text-white font-semibold text-xs sm:text-sm h-11 px-7 rounded-xl hover:opacity-90 transition-all cursor-pointer shadow-sm flex-shrink-0"
          >
            Reset
          </button>
        </div>
      </div>

      {/* Delete Confirmation Modal for Reset All Data */}
      <DeleteModal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleConfirmReset}
        title="Reset All Data?"
        description="This will permanently delete all your accounts, transactions, budgets, goals, and settings. This action cannot be undone."
        confirmText="Yes, Reset Data"
        cancelText="No, Keep Data"
      />

      {/* Success Modal Feedback */}
      <SuccessModal
        isOpen={successModal.isOpen}
        onClose={() => setSuccessModal((prev) => ({ ...prev, isOpen: false }))}
        title={successModal.title}
        description={successModal.desc}
      />
    </div>
  );
}
