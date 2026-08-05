"use client";

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

interface AnniversaryItem {
  id: string;
  client: string;
  contract: string;
  provider: string;
  anniversary: string;
  days: number;
}

const INITIAL_ANNIVERSARIES: AnniversaryItem[] = [
  {
    id: "ann-1",
    client: "Edward Wright",
    contract: "VR-104342",
    provider: "Brighthouse",
    anniversary: "2026-06-24",
    days: 0,
  },
  {
    id: "ann-2",
    client: "Christopher Mitchell",
    contract: "IM-746162",
    provider: "Lincoln Financial",
    anniversary: "2026-06-24",
    days: 0,
  },
  {
    id: "ann-3",
    client: "Jessica Jones",
    contract: "FX-685256",
    provider: "New York Life",
    anniversary: "2026-06-24",
    days: 0,
  },
  {
    id: "ann-4",
    client: "Emma Robinson",
    contract: "FX-358047",
    provider: "Brighthouse",
    anniversary: "2026-06-25",
    days: 1,
  },
  {
    id: "ann-5",
    client: "Susan Anderson",
    contract: "AN-938671",
    provider: "Equitable",
    anniversary: "2026-06-26",
    days: 2,
  },
  {
    id: "ann-6",
    client: "Gary Young",
    contract: "IM-317261",
    provider: "Jackson National",
    anniversary: "2026-06-28",
    days: 4,
  },
  {
    id: "ann-7",
    client: "Shirley Lee",
    contract: "FX-335372",
    provider: "Allianz Life",
    anniversary: "2026-06-28",
    days: 4,
  },
  {
    id: "ann-8",
    client: "Patricia Williams",
    contract: "IM-512498",
    provider: "Symetra",
    anniversary: "2026-06-29",
    days: 5,
  },
  {
    id: "ann-9",
    client: "Sandra Thompson",
    contract: "IM-108731",
    provider: "Lincoln Financial",
    anniversary: "2026-07-01",
    days: 7,
  },
  {
    id: "ann-10",
    client: "Ronald Martinez",
    contract: "FX-908123",
    provider: "MassMutual",
    anniversary: "2026-07-10",
    days: 16,
  },
  {
    id: "ann-11",
    client: "Cynthia Lee",
    contract: "VR-451298",
    provider: "Pacific Life",
    anniversary: "2026-07-25",
    days: 31,
  },
  {
    id: "ann-12",
    client: "David Brooks",
    contract: "IX-238901",
    provider: "Prudential",
    anniversary: "2026-08-15",
    days: 52,
  },
];

export default function AnniversariesPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDaysFilter, setSelectedDaysFilter] = useState<number | "all">("all");
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

  // Calculate dynamic metric card counts
  const next30Count = INITIAL_ANNIVERSARIES.filter((item) => item.days <= 30).length;
  const next60Count = INITIAL_ANNIVERSARIES.filter((item) => item.days <= 60).length;
  const next90Count = INITIAL_ANNIVERSARIES.filter((item) => item.days <= 90).length;
  const next180Count = INITIAL_ANNIVERSARIES.filter((item) => item.days <= 180).length;

  // Filtered dataset
  const filteredAnniversaries = INITIAL_ANNIVERSARIES.filter((item) => {
    const matchesSearch =
      item.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.contract.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.provider.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesDays =
      selectedDaysFilter === "all" || item.days <= (selectedDaysFilter as number);

    return matchesSearch && matchesDays;
  });

  const totalPages = Math.ceil(filteredAnniversaries.length / itemsPerPage);
  const paginatedAnniversaries = filteredAnniversaries.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleExportPDF = () => {
    setFeedbackModal({
      isOpen: true,
      title: "PDF Export Started!",
      desc: "Your contract anniversaries report is being generated and will download automatically.",
    });
  };

  const handleExportCSV = () => {
    setFeedbackModal({
      isOpen: true,
      title: "CSV Export Started!",
      desc: "Your contract anniversaries CSV dataset is ready for download.",
    });
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
              {next30Count}
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
              {next60Count}
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
              {next90Count}
            </span>
            <span className="text-xs sm:text-sm text-[#919191] font-normal">
              In next 90 days
            </span>
          </div>
        </div>

        {/* Card 4: Next 180 Days */}
        <div className="bg-[#141C24] border border-[#0F1F3D]/20 rounded-xl p-5 flex items-center gap-4 shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-[#394A58]/50 flex items-center justify-center flex-shrink-0">
            <CalendarDays className="w-6 h-6 text-[#6887A0]" />
          </div>
          <div className="flex flex-col">
            <span className="text-2xl sm:text-[24px] font-semibold text-white leading-tight font-sans tracking-tight">
              {next180Count}
            </span>
            <span className="text-xs sm:text-sm text-[#919191] font-normal">
              In next 180 days
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

        {/* Time Horizon Preset Buttons (30d, 60d, 90d, 180d) */}
        <div className="flex items-center gap-1 bg-transparent p-0.5 rounded-lg">
          {[30, 60, 90, 180].map((daysVal) => {
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
              {paginatedAnniversaries.length > 0 ? (
                paginatedAnniversaries.map((row) => (
                  <TableRow
                    key={row.id}
                    className="border-b border-white/[0.08] hover:bg-white/[0.02] transition-colors h-[62px] cursor-pointer"
                  >
                    {/* Client */}
                    <TableCell className="px-6 py-3.5 text-xs sm:text-sm font-medium text-white whitespace-nowrap">
                      {row.client}
                    </TableCell>

                    {/* Contract */}
                    <TableCell className="px-6 py-3.5 text-xs sm:text-sm text-white font-normal whitespace-nowrap">
                      {row.contract}
                    </TableCell>

                    {/* Provider */}
                    <TableCell className="px-6 py-3.5 text-xs sm:text-sm text-white font-normal whitespace-nowrap">
                      {row.provider}
                    </TableCell>

                    {/* Anniversary Date */}
                    <TableCell className="px-6 py-3.5 text-xs sm:text-sm text-white font-normal whitespace-nowrap">
                      {row.anniversary}
                    </TableCell>

                    {/* Days Countdown */}
                    <TableCell className="px-6 py-3.5 text-xs sm:text-sm text-white font-medium whitespace-nowrap">
                      {row.days} days
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
            totalItems={filteredAnniversaries.length}
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
