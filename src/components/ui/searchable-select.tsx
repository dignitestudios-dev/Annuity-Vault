"use client";

import { useState } from "react";
import { ChevronDown, Check, Search, X } from "lucide-react";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface Option {
  label: string;
  value: string;
}

interface SearchableSelectProps {
  options: Option[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  className?: string;
}

export default function SearchableSelect({
  options,
  value,
  onChange,
  placeholder = "Select client...",
  searchPlaceholder = "Search client...",
  className,
}: SearchableSelectProps) {
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const selectedOption = options.find((opt) => opt.value === value);

  const filteredOptions = options.filter((opt) =>
    (opt.label || "").toLowerCase().includes((searchTerm || "").toLowerCase())
  );

  return (
    <div className="w-full relative">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger
          render={
            <button
              type="button"
              className={cn(
                "h-10 px-3.5 bg-[#141C24] border-0 text-white rounded-[12px] text-xs font-normal w-full flex items-center justify-between shadow-none outline-none focus:ring-1 focus:ring-[#6887A0]",
                className
              )}
            >
              <span className={selectedOption ? "text-white" : "text-[#919191]"}>
                {selectedOption ? selectedOption.label : placeholder}
              </span>
              <ChevronDown className="w-4 h-4 text-[#919191] opacity-70 flex-shrink-0" />
            </button>
          }
        />
        <PopoverContent
          align="start"
          sideOffset={4}
          className="w-[var(--radix-popover-trigger-width)] min-w-[var(--radix-popper-anchor-width)] w-full p-2 bg-[#141C24] border border-white/10 text-white rounded-[12px] shadow-2xl flex flex-col gap-2 z-[100]"
        >
        {/* Search Input */}
        <div className="flex items-center gap-2 px-2.5 h-9 bg-[#0C1116] rounded-[8px] border border-white/10">
          <Search className="w-3.5 h-3.5 text-[#919191] flex-shrink-0" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={searchPlaceholder}
            className="w-full bg-transparent text-xs text-white placeholder-[#919191] outline-none"
          />
          {searchTerm && (
            <button
              type="button"
              onClick={() => setSearchTerm("")}
              className="text-[#919191] hover:text-white transition-colors cursor-pointer p-0.5"
              title="Clear search"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Options List */}
        <div className="max-h-48 overflow-y-auto no-scrollbar flex flex-col gap-0.5 pt-1">
          {filteredOptions.length === 0 ? (
            <div className="py-3 px-2 text-center text-xs text-[#919191]">
              No clients found
            </div>
          ) : (
            filteredOptions.map((opt) => {
              const isSelected = opt.value === value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => {
                    onChange(opt.value);
                    setOpen(false);
                    setSearchTerm("");
                  }}
                  className={cn(
                    "w-full px-3 py-2 rounded-[8px] text-xs flex items-center justify-between text-left transition-colors cursor-pointer",
                    isSelected
                      ? "bg-white/10 text-white font-medium"
                      : "text-white/80 hover:bg-white/5 hover:text-white"
                  )}
                >
                  <span>{opt.label}</span>
                  {isSelected && <Check className="w-3.5 h-3.5 text-[#42CD7F]" />}
                </button>
              );
            })
          )}
        </div>
      </PopoverContent>
    </Popover>
    </div>
  );
}
