"use client";
import { Loader } from "@/components/ui/loader";
import { Skeleton } from "@/components/ui/skeleton";

import { useState } from "react";
import { useDebounce } from "@/hooks/use-debounce";
import { useRouter } from "next/navigation";
import { Search, FileText, Download, X } from "lucide-react";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import SuccessModal from "@/components/shared/success-modal";
import TablePagination from "@/components/shared/table-pagination";
import { cn } from "@/lib/utils";

import { useAuditLogs, exportAuditLogs, AuditLogItem } from "@/features/activity/api/activity.service";

export default function ActivityAuditPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearch = useDebounce(searchTerm, 400);
  const [selectedModule, setSelectedModule] = useState("All Modules");
  const [selectedAction, setSelectedAction] = useState("All Actions");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  const [feedbackModal, setFeedbackModal] = useState<{
    isOpen: boolean;
    title: string;
    desc: string;
  }>({
    isOpen: false,
    title: "",
    desc: "",
  });

  const { data, isLoading } = useAuditLogs({
    page: currentPage,
    limit: itemsPerPage,
    search: debouncedSearch || undefined,
    action: selectedAction !== "All Actions" ? selectedAction : undefined,
    module: selectedModule !== "All Modules" ? selectedModule : undefined,
  });

  const logs = data?.data || [];
  const totalItems = data?.pagination?.totalItems || 0;
  const totalPages = data?.pagination?.totalPages || 1;

  const handleExportPDF = async () => {
    try {
      await exportAuditLogs(
        "pdf",
        debouncedSearch || undefined,
        selectedAction !== "All Actions" ? selectedAction : undefined,
        selectedModule !== "All Modules" ? selectedModule : undefined
      );
      setFeedbackModal({
        isOpen: true,
        title: "PDF Export Complete",
        desc: "Your activity and audit logs have been exported to PDF format.",
      });
    } catch (error) {
      console.error("Export PDF failed:", error);
    }
  };

  const handleExportCSV = async () => {
    try {
      await exportAuditLogs(
        "csv",
        debouncedSearch || undefined,
        selectedAction !== "All Actions" ? selectedAction : undefined,
        selectedModule !== "All Modules" ? selectedModule : undefined
      );
      setFeedbackModal({
        isOpen: true,
        title: "CSV Export Complete",
        desc: "Your audit log records have been exported to CSV format successfully.",
      });
    } catch (error) {
      console.error("Export CSV failed:", error);
    }
  };

  const handleRowClick = (log: AuditLogItem) => {
    if (!log.recordId || log.action === "Delete" || log.action === "Archive") return;
    const mod = log.module.toLowerCase();
    
    switch (mod) {
      case "clients":
        router.push(`/dashboard/clients/${log.recordId}`);
        break;
      case "contracts":
        router.push(`/dashboard/contracts/${log.recordId}`);
        break;
      case "tasks":
        router.push(`/dashboard/tasks`);
        break;
      case "settings":
        router.push(`/dashboard/settings`);
        break;
      case "notes":
        router.push(`/dashboard/clients/${log.recordId}?tab=notes`);
        break;
      case "documents":
        router.push(`/dashboard/clients/${log.recordId}?tab=documents`);
        break;
      default:
        router.push(`/dashboard/clients/${log.recordId}?tab=${mod}`);
        break;
    }
  };

  return (
    <div className="w-full flex flex-col gap-6 max-w-[1440px] mx-auto pb-10 font-sans">
      {/* 1. Top Header Row (Title & Action Buttons) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl sm:text-[32px] font-semibold text-white tracking-tight leading-tight">
          Activity & Audit Log
        </h1>

        <div className="flex items-center gap-3">
          <button
            onClick={handleExportPDF}
            className="h-10 px-4 bg-[#141C24] hover:bg-white/10 text-white rounded-xl text-xs sm:text-sm font-medium transition-all flex items-center gap-2 border border-white/5 shadow-sm cursor-pointer"
          >
            <FileText className="w-4 h-4 text-[#919191]" />
            <span>Export PDF</span>
          </button>

          <button
            onClick={handleExportCSV}
            className="h-10 px-4 bg-[#141C24] hover:bg-white/10 text-white rounded-xl text-xs sm:text-sm font-medium transition-all flex items-center gap-2 border border-white/5 shadow-sm cursor-pointer"
          >
            <Download className="w-4 h-4 text-[#919191]" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* 2. Filter Bar Container (#394A58) */}
      <div className="w-full bg-[#394A58] border border-white/5 rounded-xl p-3 sm:p-4 flex flex-col md:flex-row items-center justify-between gap-3 sm:gap-4 shadow-sm">
        {/* Search Input Box */}
        <div className="relative w-full md:flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8C8C8C]" />
          <input
            type="text"
            placeholder="Search activity & audit logs..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full h-10 pl-10 pr-9 bg-[#141C24] border border-white/5 text-white placeholder:text-[#8C8C8C] rounded-[12px] text-xs sm:text-sm focus:outline-none focus:border-white/20 font-sans"
          />
          {searchTerm && (
            <button
              type="button"
              onClick={() => {
                setSearchTerm("");
                setCurrentPage(1);
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8C8C8C] hover:text-white transition-colors cursor-pointer p-0.5"
              title="Clear search"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Dropdown Filters */}
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
          {/* Module Select Filter */}
          <div className="w-full sm:w-[180px]">
            <Select
              value={selectedModule}
              onValueChange={(val: string | null) => {
                if (val) setSelectedModule(val);
                setCurrentPage(1);
              }}
            >
              <SelectTrigger className="w-full h-10 bg-[#141C24] border border-white/5 text-white rounded-[12px] text-xs sm:text-sm focus:ring-0 font-sans">
                <SelectValue placeholder="All Modules" />
              </SelectTrigger>
              <SelectContent
                side="bottom"
                alignItemWithTrigger={false}
                className="bg-[#141C24] border-white/10 text-white font-sans"
              >
                <SelectItem value="All Modules">All Modules</SelectItem>
                <SelectItem value="Contracts">Contracts</SelectItem>
                <SelectItem value="Clients">Clients</SelectItem>
                <SelectItem value="Tasks">Tasks</SelectItem>
                <SelectItem value="Documents">Documents</SelectItem>
                <SelectItem value="Notes">Notes</SelectItem>
                <SelectItem value="Settings">Settings</SelectItem>
              
              </SelectContent>
            </Select>
          </div>

          {/* Action Select Filter */}
          <div className="w-full sm:w-[180px]">
            <Select
              value={selectedAction}
              onValueChange={(val: string | null) => {
                if (val) setSelectedAction(val);
                setCurrentPage(1);
              }}
            >
              <SelectTrigger className="w-full h-10 bg-[#141C24] border border-white/5 text-white rounded-[12px] text-xs sm:text-sm focus:ring-0 font-sans">
                <SelectValue placeholder="All Actions" />
              </SelectTrigger>
              <SelectContent
                side="bottom"
                alignItemWithTrigger={false}
                className="bg-[#141C24] border-white/10 text-white font-sans"
              >
                <SelectItem value="All Actions">All Actions</SelectItem>
                <SelectItem value="Create">Create</SelectItem>
                <SelectItem value="Update">Update</SelectItem>
                <SelectItem value="Delete">Delete</SelectItem>
                <SelectItem value="Archive">Archive</SelectItem>
                <SelectItem value="Upload">Upload</SelectItem>
                <SelectItem value="Restore">Restore</SelectItem>
               
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* 3. Audit Log Data Table Container */}
      <div className="w-full bg-[#141C24] border border-[#0F1F3D]/20 rounded-xl overflow-hidden shadow-sm flex flex-col justify-between min-h-[420px]">
        <div className="overflow-x-auto w-full">
          <Table className="w-full border-collapse">
            <TableHeader className="bg-[#394A58] border-b border-white/10">
              <TableRow className="border-b border-white/10 hover:bg-transparent h-[40px]">
                <TableHead className="text-white font-medium text-xs sm:text-sm px-6 py-2 w-[16%]">
                  Date
                </TableHead>
                <TableHead className="text-white font-medium text-xs sm:text-sm px-6 py-2 w-[20%]">
                  User
                </TableHead>
                <TableHead className="text-white font-medium text-xs sm:text-sm px-6 py-2 w-[16%]">
                  Action
                </TableHead>
                <TableHead className="text-white font-medium text-xs sm:text-sm px-6 py-2 w-[16%]">
                  Module
                </TableHead>
                <TableHead className="text-white font-medium text-xs sm:text-sm px-6 py-2 w-[16%]">
                  Record
                </TableHead>
                <TableHead className="text-white font-medium text-xs sm:text-sm px-6 py-2 w-[16%]">
                  Change
                </TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={`skeleton-${i}`} className="border-b border-white/[0.08] h-[51px]">
                    <TableCell className="px-6 py-2.5"><Skeleton className="h-4 w-[100px] bg-white/5 rounded-md" /></TableCell>
                    <TableCell className="px-6 py-2.5"><Skeleton className="h-4 w-[120px] bg-white/5 rounded-md" /></TableCell>
                    <TableCell className="px-6 py-2.5"><Skeleton className="h-4 w-[80px] bg-white/5 rounded-md" /></TableCell>
                    <TableCell className="px-6 py-2.5"><Skeleton className="h-4 w-[80px] bg-white/5 rounded-md" /></TableCell>
                    <TableCell className="px-6 py-2.5"><Skeleton className="h-4 w-[120px] bg-white/5 rounded-md" /></TableCell>
                    <TableCell className="px-6 py-2.5"><Skeleton className="h-4 w-[200px] bg-white/5 rounded-md" /></TableCell>
                  </TableRow>
                ))
              ) : logs.length > 0 ? (
                logs.map((log) => {
                  const isClickable = Boolean(log.recordId && log.action !== "Delete" && log.action !== "Archive");
                  return (
                    <TableRow
                      key={log._id}
                      onClick={() => handleRowClick(log)}
                      className={cn(
                        "border-b border-white/[0.08] hover:bg-white/[0.02] transition-colors h-[51px]",
                        isClickable ? "cursor-pointer" : "cursor-default"
                      )}
                    >
                      <TableCell className="px-6 py-2.5 text-xs sm:text-sm font-medium text-white whitespace-nowrap">
                        {new Date(log.createdAt).toLocaleDateString("en-US", { year: 'numeric', month: '2-digit', day: '2-digit' })}
                      </TableCell>
                      <TableCell className="px-6 py-2.5 text-xs sm:text-sm text-white font-normal whitespace-nowrap">
                        {log.performedBy ? (log.performedBy.name || `${log.performedBy.firstName || ''} ${log.performedBy.lastName || ''}`.trim()) : "System"}
                      </TableCell>
                      <TableCell className="px-6 py-2.5 text-xs sm:text-sm text-white font-normal capitalize whitespace-nowrap">
                        {log.action}
                      </TableCell>
                      <TableCell className="px-6 py-2.5 text-xs sm:text-sm text-white font-normal capitalize whitespace-nowrap">
                        {log.module}
                      </TableCell>
                      <TableCell className="px-6 py-2.5 text-xs sm:text-sm text-white font-normal capitalize whitespace-nowrap">
                        {log.recordLabel}
                      </TableCell>
                      <TableCell className="px-6 py-2.5 text-xs sm:text-sm text-white font-normal capitalize whitespace-nowrap">
                        {log.change}
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="py-12 text-center text-xs text-[#919191]">
                    No audit log records found matching your search.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Reusable Pagination */}
        <div className="px-6 pb-4">
          <TablePagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            totalItems={totalItems}
            itemsPerPage={itemsPerPage}
            itemLabel="activities"
          />
        </div>
      </div>

      {/* Reusable Success/Feedback Modal */}
      <SuccessModal
        isOpen={feedbackModal.isOpen}
        onClose={() => setFeedbackModal((prev) => ({ ...prev, isOpen: false }))}
        title={feedbackModal.title}
        description={feedbackModal.desc}
      />
    </div>
  );
}
