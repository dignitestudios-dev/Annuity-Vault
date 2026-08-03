"use client";

import { useState } from "react";
import { Calendar as CalendarIcon, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

const ANNIVERSARIES_LIST = [
  {
    contractNo: "IX-239032",
    client: "Jacob Thompson",
    provider: "Equitable",
    type: "Immediate",
    anniversaryDate: "2027-03-06",
    daysRemaining: "256 days left",
    status: "Surrendered",
    statusStyle: "bg-[#FF3E46] text-white border-0",
  },
  {
    contractNo: "VR-601714",
    client: "Jacob Thompson",
    provider: "Equitable",
    type: "Fixed",
    anniversaryDate: "2026-10-15",
    daysRemaining: "114 days left",
    status: "Matured",
    statusStyle: "bg-[#39BDF6] text-white border-0",
  },
  {
    contractNo: "FX-323530",
    client: "Eleanor Vance",
    provider: "Jackson National",
    type: "Deferred",
    anniversaryDate: "2027-02-01",
    daysRemaining: "223 days left",
    status: "Active",
    statusStyle: "bg-[#42CD7F] text-white border-0",
  },
];

export default function AnniversariesPage() {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredAnniversaries = ANNIVERSARIES_LIST.filter(
    (item) =>
      item.contractNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.provider.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="w-full flex flex-col gap-6 max-w-[1440px] mx-auto pb-12 font-sans">
      {/* Header Row */}
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-3">
          <CalendarIcon className="w-7 h-7 text-[#6887A0]" />
          <h1 className="text-2xl lg:text-[32px] font-semibold text-white tracking-tight leading-tight">
            Anniversaries
          </h1>
        </div>
        <p className="text-xs sm:text-sm text-[#919191]">
          Track upcoming contract anniversary dates and policy review timelines across all client portfolios.
        </p>
      </div>

      {/* Filter & Search Header */}
      <div className="w-full bg-[#394A58] p-3 rounded-[12px] flex items-center justify-between gap-3 shadow-sm">
        <div className="flex items-center gap-2.5 px-3.5 h-10 bg-[#141C24] rounded-[12px] border-0 text-white text-xs w-full max-w-[400px]">
          <Search className="w-4 h-4 text-[#919191] flex-shrink-0" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search anniversaries..."
            className="w-full bg-transparent text-xs text-white placeholder-[#919191] outline-none"
          />
        </div>
      </div>

      {/* Anniversaries Table */}
      <div className="w-full bg-[#141C24] border border-[#0F1F3D]/12 rounded-[12px] overflow-hidden shadow-sm">
        <div className="overflow-x-auto w-full">
          <Table className="w-full">
            <TableHeader className="bg-[#394A58] border-b border-white/10">
              <TableRow className="border-b border-white/10 hover:bg-transparent h-10">
                <TableHead className="text-white font-medium text-xs sm:text-sm h-10 px-6">
                  Contract #
                </TableHead>
                <TableHead className="text-white font-medium text-xs sm:text-sm h-10 px-6">
                  Client
                </TableHead>
                <TableHead className="text-white font-medium text-xs sm:text-sm h-10 px-6">
                  Provider
                </TableHead>
                <TableHead className="text-white font-medium text-xs sm:text-sm h-10 px-6">
                  Type
                </TableHead>
                <TableHead className="text-white font-medium text-xs sm:text-sm h-10 px-6">
                  Anniversary Date
                </TableHead>
                <TableHead className="text-white font-medium text-xs sm:text-sm h-10 px-6">
                  Countdown
                </TableHead>
                <TableHead className="text-white font-medium text-xs sm:text-sm h-10 px-6">
                  Status
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAnniversaries.map((ann) => (
                <TableRow
                  key={ann.contractNo}
                  className="border-b border-white/10 hover:bg-white/[0.02] transition-colors h-14"
                >
                  <TableCell className="px-6 py-3.5 text-sm font-medium text-white">
                    {ann.contractNo}
                  </TableCell>
                  <TableCell className="px-6 py-3.5 text-sm text-white">
                    {ann.client}
                  </TableCell>
                  <TableCell className="px-6 py-3.5 text-sm text-white">
                    {ann.provider}
                  </TableCell>
                  <TableCell className="px-6 py-3.5 text-sm text-white">
                    {ann.type}
                  </TableCell>
                  <TableCell className="px-6 py-3.5 text-sm text-white">
                    {ann.anniversaryDate}
                  </TableCell>
                  <TableCell className="px-6 py-3.5 text-sm text-[#33BBFF] font-medium">
                    {ann.daysRemaining}
                  </TableCell>
                  <TableCell className="px-6 py-3.5">
                    <Badge
                      className={cn(
                        "px-2.5 py-0.5 rounded-[8px] text-xs font-medium capitalize",
                        ann.statusStyle
                      )}
                    >
                      {ann.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
