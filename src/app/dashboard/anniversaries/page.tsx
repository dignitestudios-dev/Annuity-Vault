"use client";
import { Loader } from "@/components/ui/loader";
import { Skeleton } from "@/components/ui/skeleton";

import { useState } from "react";
import { Search, FileText, Download, CalendarDays } from "lucide-react";
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
import { cn } from "@/lib/utils";

import { useAnniversaries, exportAnniversaries } from "@/features/anniversaries/api/anniversaries.service";



export default function AnniversariesPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDaysFilter, setSelectedDaysFilter] = useState<30 | 60 | 90 | 120 | "all">("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  const { data, isLoading } = useAnniversaries({
    page: currentPage,
    limit: itemsPerPage,
    search: searchTerm || undefined,
    window: selectedDaysFilter !== "all" ? selectedDaysFilter : 120, // Backend default is 90, so we specify explicitly if possible
  });

  
  const anniversariesData = data?.data;
  const stats = anniversariesData?.stats;
  const rows = anniversariesData?.rows || [];
  const totalItems = data?.pagination?.totalItems || 0;
  const totalPages = data?.pagination?.totalPages || 1;

  const [feedbackModal, setFeedbackModal] = useState<{
    isOpen: boolean;
    title: string;
    desc: string;
  }>({
    isOpen: false,
    title: "",
    desc: "",
  });

  const handleExportPDF = async () => {
    try {
      await exportAnniversaries(
        "pdf",
        searchTerm || undefined,
        selectedDaysFilter !== "all" ? selectedDaysFilter : 120
      );
      setFeedbackModal({
        isOpen: true,
        title: "PDF Export Started!",
        desc: "Your contract anniversaries report is being generated and will download automatically.",
      });
    } catch (error) {
      console.error("Export failed:", error);
    }
  };

  const handleExportCSV = async () => {
    try {
      await exportAnniversaries(
        "csv",
        searchTerm || undefined,
        selectedDaysFilter !== "all" ? selectedDaysFilter : 120
      );
      setFeedbackModal({
        isOpen: true,
        title: "CSV Export Started!",
        desc: "Your contract anniversaries CSV dataset is ready for download.",
      });
    } catch (error) {
      console.error("Export failed:", error);
    }
  };



  return (
    <div className="w-full flex flex-col gap-6 max-w-[1440px] mx-auto pb-10 font-sans">
      {/* 1. Page Header & Export Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h1 className="text-2xl lg:text-3xl font-semibold text-white tracking-tight font-sans">
          Anniversaries
        </h1>

        <div className="flex items-center gap-3">
          <button
            onClick={handleExportPDF}
            className="h-10 px-4 rounded-xl bg-[#141C24] border border-white/10 text-white font-medium text-xs sm:text-sm hover:bg-white/5 transition-all flex items-center gap-2 cursor-pointer shadow-sm"
          >
            <FileText className="w-4 h-4 text-[#919191]" />
            <span>Export PDF</span>
          </button>
          <button
            onClick={handleExportCSV}
            className="h-10 px-4 rounded-xl bg-[#141C24] border border-white/10 text-white font-medium text-xs sm:text-sm hover:bg-white/5 transition-all flex items-center gap-2 cursor-pointer shadow-sm"
          >
            <Download className="w-4 h-4 text-[#919191]" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* 2. Top Metric Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
        {/* Card 1: Next 30 Days */}
        <div className="bg-[#141C24] border border-[#0F1F3D]/20 rounded-xl p-5 flex items-center gap-4 shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-[#394A58]/50 flex items-center justify-center flex-shrink-0">
            <CalendarDays className="w-6 h-6 text-[#6887A0]" />
          </div>
          <div className="flex flex-col">
            <span className="text-2xl sm:text-[24px] font-semibold text-white leading-tight font-sans tracking-tight">
              {stats?.next30Days || 0}
            </span>
            <span className="text-xs sm:text-sm text-[#919191] font-normal">
              In next 30 days
            </span>
          </div>
        </div>

        {/* Card 2: Next 60 Days */}
        <div className="bg-[#141C24] border border-[#0F1F3D]/20 rounded-xl p-5 flex items-center gap-4 shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-[#394A58]/50 flex items-center justify-center flex-shrink-0">
            <CalendarDays className="w-6 h-6 text-[#6887A0]" />
          </div>
          <div className="flex flex-col">
            <span className="text-2xl sm:text-[24px] font-semibold text-white leading-tight font-sans tracking-tight">
              {stats?.next60Days || 0}
            </span>
            <span className="text-xs sm:text-sm text-[#919191] font-normal">
              In next 60 days
            </span>
          </div>
        </div>

        {/* Card 3: Next 90 Days */}
        <div className="bg-[#141C24] border border-[#0F1F3D]/20 rounded-xl p-5 flex items-center gap-4 shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-[#394A58]/50 flex items-center justify-center flex-shrink-0">
            <CalendarDays className="w-6 h-6 text-[#6887A0]" />
          </div>
          <div className="flex flex-col">
            <span className="text-2xl sm:text-[24px] font-semibold text-white leading-tight font-sans tracking-tight">
              {stats?.next90Days || 0}
            </span>
            <span className="text-xs sm:text-sm text-[#919191] font-normal">
              In next 90 days
            </span>
          </div>
        </div>

        {/* Card 4: Next 120 Days */}
        <div className="bg-[#141C24] border border-[#0F1F3D]/20 rounded-xl p-5 flex items-center gap-4 shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-[#394A58]/50 flex items-center justify-center flex-shrink-0">
            <CalendarDays className="w-6 h-6 text-[#6887A0]" />
          </div>
          <div className="flex flex-col">
            <span className="text-2xl sm:text-[24px] font-semibold text-white leading-tight font-sans tracking-tight">
              {stats?.next120Days || 0}
            </span>
            <span className="text-xs sm:text-sm text-[#919191] font-normal">
              In next 120 days
            </span>
          </div>
        </div>
      </div>

      {/* 3. Search & Time Horizon Filter Bar (#394A58 Container) */}
      <div className="w-full bg-[#394A58] p-3 rounded-xl flex flex-wrap items-center justify-between gap-3 shadow-sm">
        {/* Search Input */}
        <div className="flex items-center gap-2.5 px-3.5 h-10 bg-[#141C24] rounded-xl text-white text-xs sm:text-sm flex-1 min-w-[240px] max-w-[882px]">
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

        {/* Time Horizon Preset Buttons (30d, 60d, 90d, 120d) */}
        <div className="flex items-center gap-1 bg-transparent p-0.5 rounded-lg">
          {([30, 60, 90, 120] as const).map((daysVal) => {
            const isActive = selectedDaysFilter === daysVal;
            return (
              <button
                key={daysVal}
                onClick={() => {
                  setSelectedDaysFilter(isActive ? "all" : daysVal);
                  setCurrentPage(1);
                }}
                className={cn(
                  "h-8 px-3.5 rounded-lg text-xs font-medium transition-all cursor-pointer",
                  isActive
                    ? "bg-gradient-to-r from-[#66859E] to-[#849EB2] text-white shadow-sm font-semibold"
                    : "bg-[#141C24] text-white hover:bg-white/10"
                )}
              >
                {daysVal}d
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. Anniversaries Data Table Container */}
      <div className="w-full bg-[#141C24] border border-[#0F1F3D]/20 rounded-xl overflow-hidden shadow-sm flex flex-col justify-between min-h-[420px]">
        <div className="overflow-x-auto w-full">
          <Table className="w-full border-collapse">
            <TableHeader className="bg-[#394A58] border-b border-white/10">
              <TableRow className="border-b border-white/10 hover:bg-transparent h-[40px]">
                <TableHead className="text-white font-medium text-xs sm:text-sm px-6 py-2 w-[25%]">
                  Client
                </TableHead>
                <TableHead className="text-white font-medium text-xs sm:text-sm px-6 py-2 w-[20%]">
                  Contract
                </TableHead>
                <TableHead className="text-white font-medium text-xs sm:text-sm px-6 py-2 w-[25%]">
                  Provider
                </TableHead>
                <TableHead className="text-white font-medium text-xs sm:text-sm px-6 py-2 w-[18%]">
                  Anniversary
                </TableHead>
                <TableHead className="text-white font-medium text-xs sm:text-sm px-6 py-2 w-[12%]">
                  Days
                </TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={`skeleton-${i}`} className="border-b border-white/[0.08] h-[62px]">
                    <TableCell className="px-6 py-3.5"><Skeleton className="h-4 w-[150px] bg-white/5 rounded-md" /></TableCell>
                    <TableCell className="px-6 py-3.5"><Skeleton className="h-4 w-[120px] bg-white/5 rounded-md" /></TableCell>
                    <TableCell className="px-6 py-3.5"><Skeleton className="h-4 w-[150px] bg-white/5 rounded-md" /></TableCell>
                    <TableCell className="px-6 py-3.5"><Skeleton className="h-4 w-[100px] bg-white/5 rounded-md" /></TableCell>
                    <TableCell className="px-6 py-3.5"><Skeleton className="h-4 w-[60px] bg-white/5 rounded-md" /></TableCell>
                  </TableRow>
                ))
              ) : rows.length > 0 ? (
                rows.map((row) => (
                  <TableRow
                    key={row.contractId}
                    className="border-b border-white/[0.08] hover:bg-white/[0.02] transition-colors h-[62px] cursor-pointer"
                  >
                    {/* Client */}
                    <TableCell className="px-6 py-3.5 text-xs sm:text-sm font-medium text-white whitespace-nowrap">
                      {row.client ? `${row.client.firstName} ${row.client.lastName}` : "No Client"}
                    </TableCell>

                    {/* Contract */}
                    <TableCell className="px-6 py-3.5 text-xs sm:text-sm text-white font-normal whitespace-nowrap">
                      {row.contractNumber}
                    </TableCell>

                    {/* Provider */}
                    <TableCell className="px-6 py-3.5 text-xs sm:text-sm text-white font-normal whitespace-nowrap">
                      {row.provider}
                    </TableCell>

                    {/* Anniversary Date */}
                    <TableCell className="px-6 py-3.5 text-xs sm:text-sm text-white font-normal whitespace-nowrap">
                      {new Date(row.anniversaryDate).toLocaleDateString("en-US", { year: 'numeric', month: '2-digit', day: '2-digit' })}
                    </TableCell>

                    {/* Days Countdown */}
                    <TableCell className="px-6 py-3.5 text-xs sm:text-sm text-white font-medium whitespace-nowrap">
                      {row.daysUntil} days
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="py-12 text-center text-xs text-[#919191]">
                    No anniversary records found matching your search or filter.
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
            itemLabel="anniversaries"
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
