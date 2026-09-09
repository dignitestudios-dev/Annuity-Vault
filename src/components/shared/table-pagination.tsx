"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface TablePaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  totalItems?: number;
  itemsPerPage?: number;
  itemLabel?: string;
  className?: string;
}

export default function TablePagination({
  currentPage,
  totalPages,
  onPageChange,
  totalItems,
  itemsPerPage = 20,
  itemLabel,
  className,
}: TablePaginationProps) {
  if (totalPages <= 1 && !totalItems) return null;

  const startItem = totalItems ? Math.min((currentPage - 1) * itemsPerPage + 1, totalItems) : 0;
  const endItem = totalItems ? Math.min(currentPage * itemsPerPage, totalItems) : 0;

  // Generate visible page numbers
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (currentPage > 3) pages.push("...");

      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);

      for (let i = start; i <= end; i++) {
        if (!pages.includes(i)) pages.push(i);
      }

      if (currentPage < totalPages - 2) pages.push("...");
      if (!pages.includes(totalPages)) pages.push(totalPages);
    }

    return pages;
  };

  return (
    <div
      className={cn(
        "w-full flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 pb-2 border-t border-white/10 font-sans",
        className
      )}
    >
      {/* Entries Info text */}
      <div className="text-xs sm:text-sm text-[#919191] font-normal">
        {totalItems ? (
          <>
            Showing{" "}
            <span className="text-white font-medium">
              {startItem}–{endItem}
            </span>{" "}
            of <span className="text-white font-medium">{totalItems}</span>{" "}
            {itemLabel || "entries"}
          </>
        ) : (
          <>
            Page <span className="text-white font-medium">{currentPage}</span> of{" "}
            <span className="text-white font-medium">{totalPages}</span>
          </>
        )}
      </div>

      {/* Pagination Nav Buttons */}
      <div className="flex items-center gap-1.5">
        {/* Previous Button */}
        <button
          type="button"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="h-8 px-2.5 sm:px-3 rounded-lg bg-[#0C1116] border border-white/10 text-[#919191] hover:text-white hover:border-white/20 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 text-xs sm:text-sm font-medium cursor-pointer"
        >
          <ChevronLeft className="w-4 h-4" />
          <span className="hidden sm:inline">Previous</span>
        </button>

        {/* Page Numbers */}
        <div className="flex items-center gap-1">
          {getPageNumbers().map((page, index) => {
            if (typeof page === "string") {
              return (
                <span
                  key={`ellipsis-${index}`}
                  className="h-8 px-2 flex items-center justify-center text-xs text-[#919191]"
                >
                  ...
                </span>
              );
            }

            const isActive = page === currentPage;
            return (
              <button
                key={`page-${page}`}
                type="button"
                onClick={() => onPageChange(page)}
                className={cn(
                  "h-8 min-w-[32px] px-2 rounded-lg text-xs sm:text-sm font-medium transition-all cursor-pointer flex items-center justify-center",
                  isActive
                    ? "bg-gradient-to-r from-[#66859E] to-[#849EB2] text-white shadow-sm font-semibold"
                    : "bg-[#0C1116] border border-white/10 text-[#919191] hover:text-white hover:border-white/20"
                )}
              >
                {page}
              </button>
            );
          })}
        </div>

        {/* Next Button */}
        <button
          type="button"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="h-8 px-2.5 sm:px-3 rounded-lg bg-[#0C1116] border border-white/10 text-[#919191] hover:text-white hover:border-white/20 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 text-xs sm:text-sm font-medium cursor-pointer"
        >
          <span className="hidden sm:inline">Next</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
