"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Search, RotateCcw, Trash2, User, FileText, FileCode, Folder } from "lucide-react";
import DeleteModal from "@/components/shared/delete-modal";
import RestoreModal from "@/components/shared/restore-modal";
import SuccessModal from "@/components/shared/success-modal";
import TablePagination from "@/components/shared/table-pagination";
import { cn } from "@/lib/utils";

interface ArchivedItem {
  id: string;
  type: "clients" | "contracts" | "notes" | "documents";
  title: string;
  subtitle: string;
  deletedDate: string;
  daysLeft: string;
}

const INITIAL_ARCHIVED_ITEMS: ArchivedItem[] = [
  // --- CLIENTS TAB ITEMS ---
  {
    id: "cli-1",
    type: "clients",
    title: "James Ellington",
    subtitle: "4 contracts",
    deletedDate: "Deleted Jul 9, 2026",
    daysLeft: "60d left",
  },
  {
    id: "cli-2",
    type: "clients",
    title: "Eleanor Vance",
    subtitle: "2 contracts",
    deletedDate: "Deleted Jul 9, 2026",
    daysLeft: "52d left",
  },
  {
    id: "cli-3",
    type: "clients",
    title: "Robert Jackson",
    subtitle: "5 contracts",
    deletedDate: "Deleted Jul 9, 2026",
    daysLeft: "46d left",
  },
  {
    id: "cli-4",
    type: "clients",
    title: "Michael Mitchell",
    subtitle: "3 contracts",
    deletedDate: "Deleted Jul 9, 2026",
    daysLeft: "30d left",
  },
  {
    id: "cli-5",
    type: "clients",
    title: "Sarah Jenkins",
    subtitle: "1 contract",
    deletedDate: "Deleted Jul 9, 2026",
    daysLeft: "10d left",
  },
  {
    id: "cli-6",
    type: "clients",
    title: "David Brooks",
    subtitle: "2 contracts",
    deletedDate: "Deleted Jul 9, 2026",
    daysLeft: "5d left",
  },

  // --- CONTRACTS TAB ITEMS ---
  {
    id: "cnt-1",
    type: "contracts",
    title: "IX-841719",
    subtitle: "Jennifer Wilson",
    deletedDate: "Deleted Jul 9, 2026",
    daysLeft: "60d left",
  },
  {
    id: "cnt-2",
    type: "contracts",
    title: "VR-357824",
    subtitle: "Jeffrey Clark",
    deletedDate: "Deleted Jul 9, 2026",
    daysLeft: "52d left",
  },
  {
    id: "cnt-3",
    type: "contracts",
    title: "AN-697414",
    subtitle: "Jerry Anderson",
    deletedDate: "Deleted Jul 9, 2026",
    daysLeft: "46d left",
  },
  {
    id: "cnt-4",
    type: "contracts",
    title: "FX-256585",
    subtitle: "George Nguyen",
    deletedDate: "Deleted Jul 9, 2026",
    daysLeft: "30d left",
  },
  {
    id: "cnt-5",
    type: "contracts",
    title: "VR-287929",
    subtitle: "Steven Jackson",
    deletedDate: "Deleted Jul 9, 2026",
    daysLeft: "12d left",
  },
  {
    id: "cnt-6",
    type: "contracts",
    title: "IM-991204",
    subtitle: "Karen Scott",
    deletedDate: "Deleted Jul 9, 2026",
    daysLeft: "4d left",
  },

  // --- NOTES TAB ITEMS ---
  {
    id: "nt-1",
    type: "notes",
    title: "Client requested allocation rebalance after market volatility.",
    subtitle: "Note for Jacob Thompson",
    deletedDate: "Deleted Jul 9, 2026",
    daysLeft: "60d left",
  },
  {
    id: "nt-2",
    type: "notes",
    title: "Client considering 1035 exchange to lower-fee product.",
    subtitle: "Note for Eleanor Vance",
    deletedDate: "Deleted Jul 9, 2026",
    daysLeft: "52d left",
  },
  {
    id: "nt-3",
    type: "notes",
    title: "Discussed beneficiary update during quarterly review.",
    subtitle: "Note for Robert Jackson",
    deletedDate: "Deleted Jul 9, 2026",
    daysLeft: "46d left",
  },
  {
    id: "nt-4",
    type: "notes",
    title: "Anniversary review completed; no changes requested.",
    subtitle: "Note for Sarah Jenkins",
    deletedDate: "Deleted Jul 9, 2026",
    daysLeft: "30d left",
  },
  {
    id: "nt-5",
    type: "notes",
    title: "Followed up on missing suitability questionnaire form.",
    subtitle: "Note for David Brooks",
    deletedDate: "Deleted Jul 9, 2026",
    daysLeft: "8d left",
  },

  // --- DOCUMENTS TAB ITEMS ---
  {
    id: "doc-1",
    type: "documents",
    title: "Signed_Annuity_Application_2026.pdf",
    subtitle: "Document for Jacob Thompson",
    deletedDate: "Deleted Jul 9, 2026",
    daysLeft: "60d left",
  },
  {
    id: "doc-2",
    type: "documents",
    title: "Beneficiary_Designation_Form.pdf",
    subtitle: "Document for Eleanor Vance",
    deletedDate: "Deleted Jul 9, 2026",
    daysLeft: "52d left",
  },
  {
    id: "doc-3",
    type: "documents",
    title: "Quarterly_Performance_Statement.pdf",
    subtitle: "Document for Robert Jackson",
    deletedDate: "Deleted Jul 9, 2026",
    daysLeft: "46d left",
  },
  {
    id: "doc-4",
    type: "documents",
    title: "Suitability_Questionnaire_2025.pdf",
    subtitle: "Document for Sarah Jenkins",
    deletedDate: "Deleted Jul 9, 2026",
    daysLeft: "30d left",
  },
  {
    id: "doc-5",
    type: "documents",
    title: "Driver_License_Copy.pdf",
    subtitle: "Document for David Brooks",
    deletedDate: "Deleted Jul 9, 2026",
    daysLeft: "15d left",
  },
];

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

  const tabParam = searchParams.get("tab") as ArchivedItem["type"] | null;
  const [activeTab, setActiveTab] = useState<ArchivedItem["type"]>(
    tabParam && ["clients", "contracts", "notes", "documents"].includes(tabParam)
      ? tabParam
      : "clients"
  );

  const [searchTerm, setSearchTerm] = useState("");
  const [items, setItems] = useState<ArchivedItem[]>(INITIAL_ARCHIVED_ITEMS);
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

  // Sync state with search params
  useEffect(() => {
    if (tabParam && ["clients", "contracts", "notes", "documents"].includes(tabParam)) {
      setActiveTab(tabParam);
      setCurrentPage(1);
    }
  }, [tabParam]);

  const handleTabChange = (tabId: ArchivedItem["type"]) => {
    setActiveTab(tabId);
    setCurrentPage(1);
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", tabId);
    router.push(`${pathname}?${params.toString()}`);
  };

  const filteredItems = items.filter(
    (item) =>
      item.type === activeTab &&
      (item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.subtitle.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
  const paginatedItems = filteredItems.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleConfirmRestore = () => {
    if (restoringItem) {
      setItems((prev) => prev.filter((i) => i.id !== restoringItem.id));
      setFeedbackModal({
        isOpen: true,
        title: "Item Restored!",
        desc: `"${restoringItem.title}" has been restored back to active records.`,
      });
      setRestoringItem(null);
    }
  };

  const handleConfirmDelete = () => {
    if (deletingItem) {
      setItems((prev) => prev.filter((i) => i.id !== deletingItem.id));
      setFeedbackModal({
        isOpen: true,
        title: "Item Deleted!",
        desc: `"${deletingItem.title}" has been permanently deleted.`,
      });
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
                onClick={() => handleTabChange(tab.id as ArchivedItem["type"])}
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
          {paginatedItems.length === 0 ? (
            <div className="w-full bg-[#141C24] border border-[#0F1F3D]/20 rounded-xl p-12 text-center text-[#919191] text-sm">
              No archived {activeTab} found.
            </div>
          ) : (
            paginatedItems.map((item) => (
              <div
                key={item.id}
                className="w-full bg-[#141C24] border border-[#0F1F3D]/20 hover:border-white/10 rounded-xl p-4 sm:px-6 sm:py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all shadow-sm"
              >
                {/* Left Column Details */}
                <div className="flex flex-col gap-0.5">
                  <h3 className="text-white font-medium text-sm sm:text-base tracking-tight">
                    {item.title}
                  </h3>
                  <p className="text-[#919191] text-xs sm:text-sm">{item.subtitle}</p>
                  <p className="text-[#919191] text-xs font-normal mt-0.5">{item.deletedDate}</p>
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
                    {item.daysLeft}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Reusable Pagination */}
        {filteredItems.length > 0 && (
          <div className="pt-2">
            <TablePagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              totalItems={filteredItems.length}
              itemsPerPage={itemsPerPage}
            />
          </div>
        )}
      </div>

      {/* Restore Confirmation Modal */}
      <RestoreModal
        isOpen={!!restoringItem}
        onClose={() => setRestoringItem(null)}
        onConfirm={handleConfirmRestore}
        title="Restore Archived Item"
        description={`Are you sure you want to restore "${restoringItem?.title}" back to active records?`}
        confirmText="Yes, Restore"
        cancelText="Cancel"
      />

      {/* Delete Confirmation Modal */}
      <DeleteModal
        isOpen={!!deletingItem}
        onClose={() => setDeletingItem(null)}
        onConfirm={handleConfirmDelete}
        title="Permanently Delete Item"
        description={`Are you sure you want to permanently delete "${deletingItem?.title}"? This action cannot be undone.`}
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
    <Suspense fallback={<div className="text-white p-6">Loading archived items...</div>}>
      <ArchivedContent />
    </Suspense>
  );
}
