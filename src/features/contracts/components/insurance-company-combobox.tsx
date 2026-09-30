"use client";

import { useState, useMemo } from "react";
import { Check, ChevronDown, Plus, Search, X, Loader2, Building2 } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  useInsuranceProviders,
  useCreateInsuranceProvider,
} from "@/features/contracts/api/insurance-providers.service";
import toast from "react-hot-toast";

const SEEDED_COMPANIES = [
 "Nationwide",
  "New York Life",
  "Pacific Life",
  "Prudential",
  "Symetra",
  "Transamerica",
  
];

interface InsuranceCompanyComboboxProps {
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  error?: boolean;
}

export default function InsuranceCompanyCombobox({
  value = "",
  onChange,
  placeholder = "Select or enter insurance company",
  className,
  error = false,
}: InsuranceCompanyComboboxProps) {
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddingMode, setIsAddingMode] = useState(false);
  const [newCompanyName, setNewCompanyName] = useState("");

  const { data: apiProviders = [], isLoading } = useInsuranceProviders();
  const createProviderMutation = useCreateInsuranceProvider();

  // Combine API providers with seeded defaults (preventing case-insensitive duplicates)
 const allProviders = useMemo(() => {
  const list: { id: string; name: string }[] = [];
  const seen = new Set<string>();

  // API providers only
  for (const p of apiProviders) {
    const lower = p.name.trim().toLowerCase();

    if (lower && !seen.has(lower)) {
      seen.add(lower);
      list.push({
        id: p._id || p.name,
        name: p.name.trim(),
      });
    }
  }

  // Keep currently selected value if it isn't in API results
  if (value && !seen.has(value.trim().toLowerCase())) {
    list.push({
      id: `current-${value}`,
      name: value.trim(),
    });
  }

  return list.sort((a, b) => a.name.localeCompare(b.name));
}, [apiProviders, value]);
  // Normalize search for comparison
  const trimmedSearch = searchTerm.trim();
  const lowerSearch = trimmedSearch.toLowerCase();

  // Filter list by search term
  const filteredProviders = useMemo(() => {
    if (!trimmedSearch) return allProviders;
    return allProviders.filter((p) =>
      p.name.toLowerCase().includes(lowerSearch)
    );
  }, [allProviders, trimmedSearch, lowerSearch]);

  // Check if current search matches an existing item exactly
  const exactMatch = useMemo(() => {
    if (!trimmedSearch) return null;
    return allProviders.find(
      (p) => p.name.toLowerCase() === lowerSearch
    );
  }, [allProviders, trimmedSearch, lowerSearch]);

  const handleSelect = (name: string) => {
    onChange(name);
    setSearchTerm("");
    setIsAddingMode(false);
    setOpen(false);
  };

  const handleCreateAndSelect = async (nameToAdd?: string) => {
    const targetName = (nameToAdd || newCompanyName || searchTerm).trim();
    if (!targetName) {
      toast.error("Please enter a company name");
      return;
    }

    try {
      await createProviderMutation.mutateAsync(targetName);
      toast.success(`"${targetName}" added successfully!`);
    } catch (err: any) {
      // If 409, it already exists on server, which is fine
      if (err?.response?.status === 409) {
        toast.success(`"${targetName}" selected`);
      } else {
        // Backend also silently registers new company strings on contract submit
        toast.success(`"${targetName}" selected for contract`);
      }
    } finally {
      handleSelect(targetName);
      setNewCompanyName("");
    }
  };

  return (
    <div className="w-full relative">
      <Popover
        open={open}
        onOpenChange={(nextOpen) => {
          setOpen(nextOpen);
          if (!nextOpen) {
            setIsAddingMode(false);
            setSearchTerm("");
          }
        }}
      >
        <PopoverTrigger
          render={
            <button
              type="button"
              className={cn(
                "h-10 px-3.5 bg-[#141C24] border-0 text-white rounded-[12px] text-xs font-normal w-full flex items-center justify-between shadow-none outline-none focus:ring-1 focus:ring-[#6887A0] transition-colors cursor-pointer text-left",
                error && "ring-1 ring-[#FF3E46]",
                className
              )}
            >
              <span className={cn("truncate mr-2", value ? "text-white" : "text-[#919191]")}>
                {value || placeholder}
              </span>
              <ChevronDown className="w-4 h-4 text-[#919191] opacity-70 flex-shrink-0" />
            </button>
          }
        />

        <PopoverContent
          align="end"
          sideOffset={4}
          className="w-[var(--anchor-width)] min-w-[var(--anchor-width)] max-w-[var(--anchor-width)] p-2.5 bg-[#141C24] border border-white/10 text-white rounded-[14px] shadow-2xl flex flex-col gap-2.5 z-[100]"
        >
          {isAddingMode ? (
            /* Explicit Add New Company Mode */
            <div className="flex flex-col gap-3 p-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-white flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-[#6887A0]" />
                  Add New Insurance Company
                </span>
                <button
                  type="button"
                  onClick={() => setIsAddingMode(false)}
                  className="text-[#919191] hover:text-white p-1 rounded-md"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="flex items-center gap-2 px-3 h-10 bg-[#0C1116] rounded-[10px] border border-white/15 focus-within:border-[#6887A0]">
                <Building2 className="w-4 h-4 text-[#919191] flex-shrink-0" />
                <input
                  type="text"
                  value={newCompanyName}
                  onChange={(e) => setNewCompanyName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleCreateAndSelect();
                    }
                  }}
                  maxLength={100}
                  placeholder="e.g. "
                  className="w-full bg-transparent text-xs text-white placeholder-[#919191] outline-none"
                  autoFocus
                />
              </div>

              <div className="flex items-center gap-2 justify-end pt-1">
                <button
                  type="button"
                  onClick={() => setIsAddingMode(false)}
                  className="px-3 h-8 text-xs text-[#919191] hover:text-white rounded-lg transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={!newCompanyName.trim() || createProviderMutation.isPending}
                  onClick={() => handleCreateAndSelect()}
                  className="px-3.5 h-8 text-xs font-medium text-white bg-[#6887A0] hover:bg-[#577288] disabled:opacity-50 disabled:cursor-not-allowed rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  {createProviderMutation.isPending ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Adding...</span>
                    </>
                  ) : (
                    <>
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add & Select</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          ) : (
            /* Normal Search & Select Mode */
            <>
              {/* Search Input */}
              <div className="flex items-center gap-2 px-2.5 h-9 bg-[#0C1116] rounded-[8px] border border-white/10">
                <Search className="w-3.5 h-3.5 text-[#919191] flex-shrink-0" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && trimmedSearch) {
                      e.preventDefault();
                      if (exactMatch) {
                        handleSelect(exactMatch.name);
                      } else {
                        handleCreateAndSelect(trimmedSearch);
                      }
                    }
                  }}
                  maxLength={100}
                  placeholder="Search or type new company..."
                  className="w-full bg-transparent text-xs text-white placeholder-[#919191] outline-none"
                  autoFocus
                />
                {searchTerm && (
                  <button
                    type="button"
                    onClick={() => setSearchTerm("")}
                    className="text-[#919191] hover:text-white transition-colors cursor-pointer p-0.5"
                    title="Clear"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Company List */}
              <div className="max-h-52 overflow-y-auto no-scrollbar flex flex-col gap-1 py-0.5">
                {isLoading && allProviders.length === 0 ? (
                  <div className="py-4 px-2 flex items-center justify-center gap-2 text-xs text-[#919191]">
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Loading insurance companies...</span>
                  </div>
                ) : (
                  <>
                    {/* Single Clean Creatable Item when searching a new name */}
                    {trimmedSearch && !exactMatch && (
                      <button
                        type="button"
                        disabled={createProviderMutation.isPending}
                        onClick={() => handleCreateAndSelect(trimmedSearch)}
                        className="w-full text-left px-2.5 py-2 text-xs rounded-[8px] bg-[#6887A0]/15 hover:bg-[#6887A0]/25 text-white flex items-center justify-between gap-2 transition-colors cursor-pointer group"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <Plus className="w-3.5 h-3.5 text-[#6887A0] flex-shrink-0" />
                          <span className="truncate">
                            Create &ldquo;<span className="text-[#8bb4d4] font-medium">{trimmedSearch}</span>&rdquo;
                          </span>
                        </div>
                        <span className="text-[10px] text-[#919191] bg-white/5 px-1.5 py-0.5 rounded flex-shrink-0">
                          ↵ Enter
                        </span>
                      </button>
                    )}

                    {/* Filtered Existing Companies */}
                    {filteredProviders.map((provider) => {
                      const isSelected = provider.name.toLowerCase() === value.toLowerCase();
                      return (
                        <button
                          key={provider.id}
                          type="button"
                          onClick={() => handleSelect(provider.name)}
                          className={cn(
                            "w-full text-left px-2.5 py-2 text-xs rounded-[8px] transition-colors flex items-center justify-between cursor-pointer group",
                            isSelected
                              ? "bg-[#6887A0]/20 text-white font-medium"
                              : "text-[#D1D5DB] hover:bg-white/5 hover:text-white"
                          )}
                        >
                          <span className="truncate">{provider.name}</span>
                          {isSelected && (
                            <Check className="w-3.5 h-3.5 text-[#6887A0] flex-shrink-0" />
                          )}
                        </button>
                      );
                    })}

                    {/* Empty state when no companies exist at all */}
                    {filteredProviders.length === 0 && !trimmedSearch && (
                      <div className="py-4 px-2 text-center text-xs text-[#919191]">
                        No insurance companies added yet.
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Bottom Action: Only shown when not searching to prevent clutter */}
              {!trimmedSearch && (
                <div className="pt-2 border-t border-white/10">
                  <button
                    type="button"
                    onClick={() => {
                      setNewCompanyName("");
                      setIsAddingMode(true);
                    }}
                    className="w-full h-8 px-2.5 rounded-[8px] bg-white/5 hover:bg-[#6887A0]/20 text-[#8bb4d4] hover:text-white text-xs text-nowrap font-medium flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add New Insurance Company</span>
                  </button>
                </div>
              )}
            </>
          )}
        </PopoverContent>
      </Popover>
    </div>
  );
}
