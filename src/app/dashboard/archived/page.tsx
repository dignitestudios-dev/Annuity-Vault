"use client";
import { Loader } from "@/components/ui/loader";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Search, RotateCcw, Trash2, User, FileText, FileCode, Folder } from "lucide-react";
import DeleteModal from "@/components/shared/delete-modal";
import RestoreModal from "@/components/shared/restore-modal";
import SuccessModal from "@/components/shared/success-modal";
import TablePagination from "@/components/shared/table-pagination";
import { cn } from "@/lib/utils";

import { 
  useArchived, 
  useRestoreArchived, 
  useDeleteArchived, 
  ArchivedItem 
} from "@/features/archived/api/archived.service";

const TABS = [
  { id: "clients", label: "Clients", icon: User },
  { id: "contracts", label: "Contracts", icon: FileText },
  { id: "notes", label: "Notes", icon: FileCode },
  { id: "documents", label: "Documents", icon: Folder },
] as const;

function ArchivedContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const tabParam = searchParams.get("tab") as "clients" | "contracts" | "notes" | "documents" | null;
  const [activeTab, setActiveTab] = useState<"clients" | "contracts" | "notes" | "documents">(
    tabParam && ["clients", "contracts", "notes", "documents"].includes(tabParam)
      ? tabParam
      : "clients"
  );

  const [searchTerm, setSearchTerm] = useState("");
  const [restoringItem, setRestoringItem] = useState<ArchivedItem | null>(null);
  const [deletingItem, setDeletingItem] = useState<ArchivedItem | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const [feedbackModal, setFeedbackModal] = useState<{
    isOpen: boolean;
    title: string;
    desc: string;
  }>({
    isOpen: false,
    title: "",
    desc: "",
  });

  const { data, isLoading } = useArchived({
    type: activeTab,
    page: currentPage,
    limit: itemsPerPage,
    search: searchTerm || undefined,
  });

  const handleTabChange = (tabId: "clients" | "contracts" | "notes" | "documents") => {
    setActiveTab(tabId);
    setCurrentPage(1);
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", tabId);
    router.push(`${pathname}?${params.toString()}`);
  };

  const restoreMutation = useRestoreArchived(activeTab);
  const deleteMutation = useDeleteArchived(activeTab);

  const items = data?.data || [];
  const totalItems = data?.pagination?.totalItems || 0;
  const totalPages = data?.pagination?.totalPages || 1;

  const handleConfirmRestore = async () => {
    if (restoringItem) {
      try {
        await restoreMutation.mutateAsync(restoringItem.id);
        setFeedbackModal({
          isOpen: true,
          title: "Item Restored!",
          desc: `"${restoringItem.label}" has been restored back to active records.`,
        });
      } catch (error) {
        console.error("Failed to restore:", error);
      }
      setRestoringItem(null);
    }
  };

  const handleConfirmDelete = async () => {
    if (deletingItem) {
      try {
        await deleteMutation.mutateAsync(deletingItem.id);
        setFeedbackModal({
          isOpen: true,
          title: "Item Deleted!",
          desc: `"${deletingItem.label}" has been permanently deleted.`,
        });
      } catch (error) {
        console.error("Failed to delete:", error);
      }
      setDeletingItem(null);
    }
  };

  return (
    <div className="w-full flex flex-col gap-6 max-w-[1440px] mx-auto pb-10 font-sans">
      {/* 1. Header Title */}
      <h1 className="text-2xl sm:text-[32px] font-semibold text-white tracking-tight leading-tight">
        Archived
      </h1>

      {/* 2. Search & Tab Switcher Bar (#394A58 Container) */}
      <div className="w-full bg-[#394A58] p-3 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
        {/* Search Input Box */}
        <div className="flex items-center gap-2.5 px-3.5 h-10 bg-[#141C24] rounded-xl text-white text-xs sm:text-sm w-full sm:w-[320px]">
          <Search className="w-4 h-4 text-[#919191] flex-shrink-0" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Search"
            className="w-full bg-transparent text-xs sm:text-sm text-white placeholder-[#919191] outline-none font-sans"
          />
        </div>

        {/* Navigation Category Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
          {TABS.map((tab) => {
            const isActive = activeTab === tab.id;
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id as "clients" | "contracts" | "notes" | "documents")}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all cursor-pointer font-sans whitespace-nowrap",
                  isActive
                    ? "bg-gradient-to-r from-[#66859E] to-[#849EB2] text-white shadow-sm font-semibold"
                    : "bg-[#141C24] text-white hover:bg-white/10"
                )}
              >
                <Icon className="w-4 h-4 text-white" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Cards List Container */}
      <div className="flex flex-col gap-3.5 w-full min-h-[380px] justify-between">
        <div className="flex flex-col gap-3.5 w-full">
          {isLoading ? (
            <div className="w-full bg-[#141C24] border border-[#0F1F3D]/20 rounded-xl p-12 text-center text-[#919191] text-sm"><div className="flex items-center justify-center p-6"><Loader className="text-white" /></div></div>
          ) : items.length === 0 ? (
            <div className="w-full bg-[#141C24] border border-[#0F1F3D]/20 rounded-xl p-12 text-center text-[#919191] text-sm">
              No archived {activeTab} found.
            </div>
          ) : (
            items.map((item) => (
              <div
                key={item.id}
                className="w-full bg-[#141C24] border border-[#0F1F3D]/20 hover:border-white/10 rounded-xl p-4 sm:px-6 sm:py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all shadow-sm"
              >
                {/* Left Column Details */}
                <div className="flex flex-col gap-0.5">
                  <h3 className="text-white font-medium text-sm sm:text-base tracking-tight">
                    {item.label}
                  </h3>
                  <p className="text-[#919191] text-xs sm:text-sm">{item.subtitle}</p>
                  <p className="text-[#919191] text-xs font-normal mt-0.5">
                    Deleted {new Date(item.archivedAt).toLocaleDateString("en-US", { year: 'numeric', month: '2-digit', day: '2-digit' })}
                  </p>
                </div>

                {/* Right Column Actions & Retention Counter */}
                <div className="flex flex-col sm:items-end gap-2 sm:gap-1 flex-shrink-0">
                  <div className="flex items-center gap-2">
                    {/* Restore Button */}
                    <button
                      onClick={() => setRestoringItem(item)}
                      className="h-7 px-3.5 bg-[#42CD7F] hover:bg-emerald-400 text-[#181818] rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm cursor-pointer"
                    >
                      <RotateCcw className="w-3.5 h-3.5 text-[#181818]" />
                      <span>Restore</span>
                    </button>

                    {/* Delete Button */}
                    <button
                      onClick={() => setDeletingItem(item)}
                      className="w-7 h-7 bg-[#FF0000] hover:bg-red-600 text-white rounded-lg flex items-center justify-center transition-all shadow-sm cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5 text-white" />
                    </button>
                  </div>

                  <span className="text-white font-semibold text-sm sm:text-base text-right tracking-tight">
                    {item.daysLeft}d left
                  </span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Reusable Pagination */}
            <TablePagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              totalItems={totalItems}
              itemsPerPage={itemsPerPage}
            />
      </div>

      {/* Restore Confirmation Modal */}
      <RestoreModal
        isOpen={!!restoringItem}
        onClose={() => setRestoringItem(null)}
        onConfirm={handleConfirmRestore}
        title="Restore Archived Item"
        description={`Are you sure you want to restore "${restoringItem?.label}" back to active records?`}
        confirmText="Yes, Restore"
        cancelText="Cancel"
      />

      {/* Delete Confirmation Modal */}
      <DeleteModal
        isOpen={!!deletingItem}
        onClose={() => setDeletingItem(null)}
        onConfirm={handleConfirmDelete}
        title="Permanently Delete Item"
        description={`Are you sure you want to permanently delete "${deletingItem?.label}"? This action cannot be undone.`}
        confirmText="Yes, Delete Now"
        cancelText="No, keep it"
      />

      {/* Feedback / Success Notification Modal */}
      <SuccessModal
        isOpen={feedbackModal.isOpen}
        onClose={() => setFeedbackModal((prev) => ({ ...prev, isOpen: false }))}
        title={feedbackModal.title}
        description={feedbackModal.desc}
      />
    </div>
  );
}

export default function ArchivedPage() {
  return (
    <Suspense fallback={<div className="text-white p-6"><div className="flex items-center justify-center p-6"><Loader className="text-white" /></div></div>}>
      <ArchivedContent />
    </Suspense>
  );
}
