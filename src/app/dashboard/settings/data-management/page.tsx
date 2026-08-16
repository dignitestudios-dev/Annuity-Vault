"use client";

import { useState } from "react";
import DeleteModal from "@/components/shared/delete-modal";
import SuccessModal from "@/components/shared/success-modal";
import { exportAllData, useResetData } from "@/features/settings/api/settings.service";
import { Loader2, X, Eye, EyeOff } from "lucide-react";

export default function SettingsDataManagementPage() {
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [isExporting, setIsExporting] = useState(false);

  const resetDataMutation = useResetData();

  const [successModal, setSuccessModal] = useState<{ isOpen: boolean; title: string; desc: string }>({
    isOpen: false,
    title: "",
    desc: "",
  });

  const handleDownloadCSV = async () => {
    setIsExporting(true);
    try {
      await exportAllData();
      setSuccessModal({
        isOpen: true,
        title: "Export Completed!",
        desc: "Your data has been exported to CSV successfully.",
      });
    } catch (error) {
      console.error("Export failed:", error);
    } finally {
      setIsExporting(false);
    }
  };

  const handleConfirmWarning = () => {
    setIsDeleteOpen(false);
    setIsPasswordModalOpen(true);
    setPassword("");
    setPasswordError("");
    setShowPassword(false);
  };

  const handleConfirmReset = async () => {
    setPasswordError("");
    if (!password) {
      setPasswordError("Password is required");
      return;
    }
    
    try {
      await resetDataMutation.mutateAsync(password);
      setIsPasswordModalOpen(false);
      setSuccessModal({
        isOpen: true,
        title: "Data Reset Completed!",
        desc: "All clients, contracts, tasks, and notifications have been wiped successfully.",
      });
    } catch (error: any) {
      setPasswordError(error?.response?.data?.message || "Failed to reset data. Incorrect password?");
    }
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
            disabled={isExporting}
            className="bg-gradient-to-r from-[#66859E] to-[#849EB2] text-white font-semibold text-xs sm:text-sm h-11 px-7 rounded-xl hover:opacity-90 transition-all cursor-pointer shadow-sm flex-shrink-0 flex items-center justify-center gap-2 disabled:opacity-70"
          >
            {isExporting && <Loader2 className="w-4 h-4 animate-spin" />}
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
        onConfirm={handleConfirmWarning}
        title="Reset All Data?"
        description="This will permanently delete all your clients, contracts, notes, documents, and tasks. This action cannot be undone."
        confirmText="Yes, Continue"
        cancelText="Cancel"
      />

      {/* Password Verification Modal */}
      {isPasswordModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 sm:p-6">
          <div className="w-full max-w-[400px] bg-[#141C24] border border-white/10 rounded-2xl p-6 sm:p-8 flex flex-col items-center text-center shadow-2xl relative">
            <button
              onClick={() => setIsPasswordModalOpen(false)}
              className="absolute top-4 right-4 text-[#919191] hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-xl font-semibold text-white tracking-tight mb-2">
              Verify Password
            </h3>
            <p className="text-[#919191] text-sm font-normal mb-6">
              Please enter your password to confirm the data reset.
            </p>

            <div className="w-full flex flex-col gap-2 mb-6">
              <div className="relative w-full">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="h-10 w-full bg-[#0D1217] text-white pl-3.5 pr-10 rounded-xl border border-white/5 focus:border-[#6887A0] outline-none text-sm font-sans placeholder:text-[#919191] transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#919191] hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {passwordError && (
                <span className="text-[#FF3E46] text-xs font-normal text-left">
                  {passwordError}
                </span>
              )}
            </div>

            <div className="flex w-full gap-3">
              <button
                onClick={() => setIsPasswordModalOpen(false)}
                className="flex-1 h-11 bg-transparent text-[#919191] hover:text-white font-semibold text-sm rounded-xl border border-white/10 hover:bg-white/5 transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmReset}
                disabled={resetDataMutation.isPending}
                className="flex-1 h-11 bg-[#FF0000] hover:bg-red-600 text-white font-semibold text-sm rounded-xl transition-all cursor-pointer shadow-sm flex items-center justify-center gap-2 disabled:opacity-70"
              >
                {resetDataMutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                Reset Data
              </button>
            </div>
          </div>
        </div>
      )}

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
