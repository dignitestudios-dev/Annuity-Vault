"use client";

import { useState } from "react";
import { Search, RotateCcw, Trash2, Archive, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
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
import DeleteModal from "@/components/shared/delete-modal";
import SuccessModal from "@/components/shared/success-modal";

const INITIAL_ARCHIVED_ITEMS = [
  {
    id: "arc-1",
    name: "Jacob Thompson (Client Folder)",
    type: "Client Folder",
    archivedDate: "2026-08-03",
    expiresIn: "60 days left",
    archivedBy: "A. Smith",
  },
  {
    id: "arc-2",
    name: "Pacific Life Policy Contract.pdf",
    type: "Document",
    archivedDate: "2026-07-28",
    expiresIn: "54 days left",
    archivedBy: "A. Smith",
  },
  {
    id: "arc-3",
    name: "Note: Client requested allocation rebalance...",
    type: "Note",
    archivedDate: "2026-07-15",
    expiresIn: "41 days left",
    archivedBy: "A. Smith",
  },
  {
    id: "arc-4",
    name: "Contract IX-239032 (Surrendered)",
    type: "Contract",
    archivedDate: "2026-07-02",
    expiresIn: "28 days left",
    archivedBy: "A. Smith",
  },
];

export default function ArchivedPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [archivedList, setArchivedList] = useState(INITIAL_ARCHIVED_ITEMS);

  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isSuccessOpen, setIsSuccessOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState({ title: "", description: "" });

  const filteredItems = archivedList.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.archivedBy.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === "all" || item.type === typeFilter;
    return matchesSearch && matchesType;
  });

  const handleRestore = (id: string, name: string) => {
    setArchivedList(archivedList.filter((item) => item.id !== id));
    setSuccessMessage({
      title: "File Restored!",
      description: `"${name}" has been successfully restored to active records.`,
    });
    setIsSuccessOpen(true);
  };

  const handleConfirmPermanentDelete = () => {
    if (deletingId) {
      setArchivedList(archivedList.filter((item) => item.id !== deletingId));
      setDeletingId(null);
      setSuccessMessage({
        title: "Permanently Deleted",
        description: "The archived file has been permanently deleted from storage.",
      });
      setIsSuccessOpen(true);
    }
  };

  return (
    <div className="w-full flex flex-col gap-6 max-w-[1440px] mx-auto pb-12 font-sans">
      {/* Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-3">
            <Archive className="w-7 h-7 text-[#6887A0]" />
            <h1 className="text-2xl lg:text-[32px] font-semibold text-white tracking-tight leading-tight">
              Archived Items
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-[#919191]">
            Archived records are retained for 60 days before permanent deletion. You can restore items at any time.
          </p>
        </div>
      </div>

      {/* Info Warning Banner */}
      <div className="w-full bg-[#141C24] border border-[#6887A0]/30 rounded-[12px] p-4 flex items-center gap-3 text-xs sm:text-sm text-[#829CB0]">
        <AlertCircle className="w-5 h-5 text-[#6887A0] flex-shrink-0" />
        <span>
          Files moved to Archive remain available for 60 days. After 60 days, they will be automatically and permanently removed.
        </span>
      </div>

      {/* Search & Filter Header (#394A58) */}
      <div className="w-full bg-[#394A58] p-3 rounded-[12px] flex flex-wrap items-center justify-between gap-3 shadow-sm">
        {/* Search Bar */}
        <div className="flex items-center gap-2.5 px-3.5 h-10 bg-[#141C24] rounded-[12px] border-0 text-white text-xs w-full max-w-[400px]">
          <Search className="w-4 h-4 text-[#919191] flex-shrink-0" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search archived files..."
            className="w-full bg-transparent text-xs text-white placeholder-[#919191] outline-none"
          />
        </div>

        {/* Type Filter */}
        <Select value={typeFilter} onValueChange={(val: string | null) => setTypeFilter(val || "all")}>
          <SelectTrigger className="h-10 px-3.5 bg-[#141C24] border-0 text-white rounded-[12px] text-xs font-normal min-w-[140px] justify-between shadow-none">
            <SelectValue placeholder="All types" />
          </SelectTrigger>
          <SelectContent className="bg-[#141C24] border border-white/10 text-white rounded-[12px]">
            <SelectItem value="all" className="text-white hover:bg-white/10 cursor-pointer text-xs">
              All types
            </SelectItem>
            <SelectItem value="Client Folder" className="text-white hover:bg-white/10 cursor-pointer text-xs">
              Client Folder
            </SelectItem>
            <SelectItem value="Contract" className="text-white hover:bg-white/10 cursor-pointer text-xs">
              Contract
            </SelectItem>
            <SelectItem value="Document" className="text-white hover:bg-white/10 cursor-pointer text-xs">
              Document
            </SelectItem>
            <SelectItem value="Note" className="text-white hover:bg-white/10 cursor-pointer text-xs">
              Note
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Archived Table */}
      <div className="w-full bg-[#141C24] border border-[#0F1F3D]/12 rounded-[12px] overflow-hidden shadow-sm">
        <div className="overflow-x-auto w-full">
          <Table className="w-full">
            <TableHeader className="bg-[#394A58] border-b border-white/10">
              <TableRow className="border-b border-white/10 hover:bg-transparent h-10">
                <TableHead className="text-white font-medium text-xs sm:text-sm h-10 px-6">
                  Item Name
                </TableHead>
                <TableHead className="text-white font-medium text-xs sm:text-sm h-10 px-6">
                  Type
                </TableHead>
                <TableHead className="text-white font-medium text-xs sm:text-sm h-10 px-6">
                  Archived Date
                </TableHead>
                <TableHead className="text-white font-medium text-xs sm:text-sm h-10 px-6">
                  Retention Timer
                </TableHead>
                <TableHead className="text-white font-medium text-xs sm:text-sm h-10 px-6 text-right">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredItems.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-sm text-[#919191]">
                    No archived items found.
                  </TableCell>
                </TableRow>
              ) : (
                filteredItems.map((item) => (
                  <TableRow
                    key={item.id}
                    className="border-b border-white/10 hover:bg-white/[0.02] transition-colors h-14"
                  >
                    <TableCell className="px-6 py-3.5 text-sm font-medium text-white">
                      {item.name}
                    </TableCell>
                    <TableCell className="px-6 py-3.5 text-sm text-white">
                      <Badge className="bg-[#394A58] text-white border-0 px-2.5 py-0.5 rounded-[8px] text-xs font-normal">
                        {item.type}
                      </Badge>
                    </TableCell>
                    <TableCell className="px-6 py-3.5 text-sm text-white">
                      {item.archivedDate}
                    </TableCell>
                    <TableCell className="px-6 py-3.5 text-sm text-[#33BBFF] font-medium">
                      {item.expiresIn}
                    </TableCell>
                    <TableCell className="px-6 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleRestore(item.id, item.name)}
                          className="h-8 px-3 bg-[#42CD7F] hover:bg-emerald-600 text-white rounded-[8px] text-xs font-medium transition-all flex items-center gap-1.5 shadow-sm"
                        >
                          <RotateCcw className="w-3.5 h-3.5 text-white" />
                          <span>Restore</span>
                        </button>
                        <button
                          onClick={() => setDeletingId(item.id)}
                          className="h-8 px-3 bg-[#FF0000] hover:bg-red-600 text-white rounded-[8px] text-xs font-medium transition-all flex items-center gap-1.5 shadow-sm"
                        >
                          <Trash2 className="w-3.5 h-3.5 text-white" />
                          <span>Delete</span>
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <DeleteModal
        isOpen={!!deletingId}
        onClose={() => setDeletingId(null)}
        onConfirm={handleConfirmPermanentDelete}
        title="Permanently Delete Item"
        description="Are you sure you want to permanently delete this archived item? This action cannot be undone."
      />

      {/* Reusable Success Popup Modal */}
      <SuccessModal
        isOpen={isSuccessOpen}
        onClose={() => setIsSuccessOpen(false)}
        title={successMessage.title}
        description={successMessage.description}
      />
    </div>
  );
}
