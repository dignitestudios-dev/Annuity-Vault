"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, FileText, Download } from "lucide-react";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import SuccessModal from "@/components/shared/success-modal";
import TablePagination from "@/components/shared/table-pagination";

interface AuditLogItem {
  id: string;
  date: string;
  user: string;
  action: string;
  module: string;
  record: string;
  change: string;
}

const AUDIT_LOGS: AuditLogItem[] = [
  {
    id: "log-1",
    date: "2026-06-01",
    user: "Avery Hayes",
    action: "Update",
    module: "Notes",
    record: "Cli_e",
    change: "Updated Value",
  },
  {
    id: "log-2",
    date: "2026-05-30",
    user: "Jordan Reed",
    action: "Archive",
    module: "Notes",
    record: "Cli_j",
    change: "Updated Value",
  },
  {
    id: "log-3",
    date: "2026-05-28",
    user: "Samantha Collins",
    action: "Create",
    module: "Documents",
    record: "Cli_s",
    change: "Updated Value",
  },
  {
    id: "log-4",
    date: "2026-05-27",
    user: "Liam O'Connor",
    action: "Upload",
    module: "Clients",
    record: "Cli_l",
    change: "Updated Value",
  },
  {
    id: "log-5",
    date: "2026-05-25",
    user: "Maya Patel",
    action: "Update",
    module: "Contracts",
    record: "Cli_m",
    change: "Updated Value",
  },
  {
    id: "log-6",
    date: "2026-05-24",
    user: "Ethan Brooks",
    action: "Archive",
    module: "Documents",
    record: "Cli_e",
    change: "Updated Value",
  },
  {
    id: "log-7",
    date: "2026-05-22",
    user: "Isabella Nguyen",
    action: "Upload",
    module: "Clients",
    record: "Cli_i",
    change: "Updated Value",
  },
  {
    id: "log-8",
    date: "2026-05-21",
    user: "Noah Kim",
    action: "Upload",
    module: "Contracts",
    record: "Cli_n",
    change: "Updated Value",
  },
  {
    id: "log-9",
    date: "2026-05-20",
    user: "Olivia Martinez",
    action: "Update",
    module: "Clients",
    record: "Cli_o",
    change: "Updated Value",
  },
  {
    id: "log-10",
    date: "2026-05-18",
    user: "Lucas Scott",
    action: "Create",
    module: "Notes",
    record: "Cli_lu",
    change: "Created Record",
  },

  {
    id: "log-11",
    date: "2026-05-16",
    user: "Sophia Taylor",
    action: "Upload",
    module: "Documents",
    record: "Cli_so",
    change: "Uploaded File",
  },
  {
    id: "log-12",
    date: "2026-05-15",
    user: "Benjamin Adams",
    action: "Update",
    module: "Contracts",
    record: "Cli_b",
    change: "Status Changed",
  },
];

export default function ActivityAuditPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 7;

  const [feedbackModal, setFeedbackModal] = useState<{
    isOpen: boolean;
    title: string;
    desc: string;
  }>({
    isOpen: false,
    title: "",
    desc: "",
  });

  const filteredLogs = AUDIT_LOGS.filter((log) => {
    const term = searchTerm.toLowerCase();
    return (
      log.user.toLowerCase().includes(term) ||
      log.action.toLowerCase().includes(term) ||
      log.module.toLowerCase().includes(term) ||
      log.record.toLowerCase().includes(term) ||
      log.date.toLowerCase().includes(term)
    );
  });

  const totalPages = Math.ceil(filteredLogs.length / itemsPerPage);
  const paginatedLogs = filteredLogs.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleRowClick = (log: AuditLogItem) => {
    const mod = log.module.toLowerCase();
    if (mod === "notes") {
      router.push("/dashboard/clients/1?tab=notes");
    } else if (mod === "documents") {
      router.push("/dashboard/clients/1?tab=documents");
    } else if (mod === "contracts") {
      router.push("/dashboard/clients/1?tab=contracts");
    } else {
      router.push("/dashboard/clients/1?tab=activity");
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
            onClick={() =>
              setFeedbackModal({
                isOpen: true,
                title: "PDF Export Complete",
                desc: "Your activity and audit logs have been exported to PDF format.",
              })
            }
            className="h-10 px-4 bg-[#141C24] hover:bg-white/10 text-white rounded-xl text-xs sm:text-sm font-medium transition-all flex items-center gap-2 border border-white/5 shadow-sm cursor-pointer"
          >
            <FileText className="w-4 h-4 text-[#919191]" />
            <span>Export PDF</span>
          </button>

          <button
            onClick={() =>
              setFeedbackModal({
                isOpen: true,
                title: "CSV Export Complete",
                desc: "Your audit log records have been exported to CSV format successfully.",
              })
            }
            className="h-10 px-4 bg-[#141C24] hover:bg-white/10 text-white rounded-xl text-xs sm:text-sm font-medium transition-all flex items-center gap-2 border border-white/5 shadow-sm cursor-pointer"
          >
            <Download className="w-4 h-4 text-[#919191]" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* 2. Full Width Search Bar Container (#394A58 Container) */}
      <div className="w-full bg-[#394A58] p-3 rounded-xl shadow-sm flex items-center">
        <div className="flex items-center gap-2.5 px-3.5 h-10 bg-[#141C24] rounded-xl text-white text-xs sm:text-sm w-full">
          <Search className="w-4 h-4 text-[#919191] flex-shrink-0" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Search"
            className="w-full bg-transparent text-xs sm:text-sm text-white placeholder-[#919191] outline-none"
          />
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
              {paginatedLogs.length > 0 ? (
                paginatedLogs.map((log) => (
                  <TableRow
                    key={log.id}
                    onClick={() => handleRowClick(log)}
                    className="border-b border-white/[0.08] hover:bg-white/[0.02] transition-colors h-[51px] cursor-pointer"
                  >
                    <TableCell className="px-6 py-2.5 text-xs sm:text-sm font-medium text-white whitespace-nowrap">
                      {log.date}
                    </TableCell>
                    <TableCell className="px-6 py-2.5 text-xs sm:text-sm text-white font-normal whitespace-nowrap">
                      {log.user}
                    </TableCell>
                    <TableCell className="px-6 py-2.5 text-xs sm:text-sm text-white font-normal capitalize whitespace-nowrap">
                      {log.action}
                    </TableCell>
                    <TableCell className="px-6 py-2.5 text-xs sm:text-sm text-white font-normal capitalize whitespace-nowrap">
                      {log.module}
                    </TableCell>
                    <TableCell className="px-6 py-2.5 text-xs sm:text-sm text-white font-normal capitalize whitespace-nowrap">
                      {log.record}
                    </TableCell>
                    <TableCell className="px-6 py-2.5 text-xs sm:text-sm text-white font-normal capitalize whitespace-nowrap">
                      {log.change}
                    </TableCell>
                  </TableRow>
                ))
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
            totalItems={filteredLogs.length}
            itemsPerPage={itemsPerPage}
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
