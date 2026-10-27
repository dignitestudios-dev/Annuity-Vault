"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useDebounce } from "@/hooks/use-debounce";
import {
  Plus,
  Search,
  FileText,
  Download,
  X,
  SlidersHorizontal,
  ChevronDown,
  ChevronUp,
  RotateCcw,
} from "lucide-react";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import DatePickerInput from "@/components/ui/date-picker-input";
import NewContractDialog from "@/features/contracts/components/new-contract-dialog";
import SuccessModal from "@/components/shared/success-modal";
import TablePagination from "@/components/shared/table-pagination";
import { EmptyState } from "@/components/shared/empty-state";
import { cn } from "@/lib/utils";
import { useContracts, exportContracts } from "@/features/contracts/api/contracts.service";
import { Skeleton } from "@/components/ui/skeleton";
import { format, differenceInDays } from "date-fns";
import toast from "react-hot-toast";

// The 8 current types in order, plus legacy Immediate & Deferred
const ALL_CONTRACT_TYPES = [
  "All Types",
  "Fixed Indexed",
  "Fixed",
  "MYGA",
  "Variable",
  "RILA",
  "SPIA",
  "Private Note",
  "Other",
  "Immediate",
  "Deferred",
];

const ALL_STATUSES = [
  "All Statuses",
  "Active",
  "Pending",
  "Matured",
  "Surrendered",
  "Out of Surrender",
];

const OPERATORS = [
  { label: "≥", value: "≥" },
  { label: ">", value: ">" },
  { label: "≤", value: "≤" },
  { label: "<", value: "<" },
  { label: "=", value: "=" },
];

const OPERATOR_SUFFIX: Record<string, string> = {
  ">": "Gt",
  "≥": "Gte",
  ">=": "Gte",
  "<": "Lt",
  "≤": "Lte",
  "<=": "Lte",
  "=": "Eq",
};

interface NumericFilter {
  op: string;
  value: string;
}

const getStatusStyle = (status: string) => {
  switch (status?.toLowerCase()) {
    case "active":
      return "bg-[#42CD7F] text-white border-0";
    case "surrendered":
      return "bg-[#FF3E46] text-white border-0";
    case "out of surrender":
      return "bg-[#A78BFA] text-black border-0 font-medium";
    case "matured":
      return "bg-[#39BDF6] text-white border-0";
    case "pending":
      return "bg-[#FFE600] text-black border-0 font-semibold";
    case "inactive":
      return "bg-[#828282] text-white border-0";
    default:
      return "bg-gray-600 text-white border-0";
  }
};

const formatCurrency = (value?: number | null) => {
  if (value === null || value === undefined || isNaN(value)) return "N/A";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

const formatAnniversary = (dateString?: string | null) => {
  if (!dateString) return "N/A";
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return "N/A";
  const now = new Date();

  const thisYearAnniversary = new Date(date);
  thisYearAnniversary.setFullYear(now.getFullYear());

  if (thisYearAnniversary < now) {
    thisYearAnniversary.setFullYear(now.getFullYear() + 1);
  }

  const daysDiff = differenceInDays(thisYearAnniversary, now);
  const formattedDate = format(thisYearAnniversary, "yyyy-MM-dd");

  return `${formattedDate} (${daysDiff}d)`;
};

export default function ContractsPage() {
  const router = useRouter();

  // Top Bar Search & Quick Filters
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearch = useDebounce(searchQuery, 400);
  const [selectedType, setSelectedType] = useState("All Types");
  const [selectedStatus, setSelectedStatus] = useState("All Statuses");

  // Filter panel open state - COLLAPSED BY DEFAULT
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);

  // Collapsible section states inside the panel
  const [openSections, setOpenSections] = useState({
    basic: true,
    details: true,
    dates: true,
    financial: true,
  });

  const toggleSection = (section: keyof typeof openSections) => {
    setOpenSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  // Draft Filter States
  const [lastName, setLastName] = useState("");
  const [provider, setProvider] = useState("");
  const [productName, setProductName] = useState("");
  const [taxTreatment, setTaxTreatment] = useState<"all" | "Pre-Tax" | "Roth" | "Non-Qualified">("all");
  const [annuitantNotOwner, setAnnuitantNotOwner] = useState<"all" | "yes" | "no">("all");
  const [incomeMode, setIncomeMode] = useState("all");
  const [ridersOrFeatures, setRidersOrFeatures] = useState("");

  // Dates
  const [anniversaryFrom, setAnniversaryFrom] = useState("");
  const [anniversaryTo, setAnniversaryTo] = useState("");
  const [outOfSurrenderFrom, setOutOfSurrenderFrom] = useState("");
  const [outOfSurrenderTo, setOutOfSurrenderTo] = useState("");
  const [maturityFrom, setMaturityFrom] = useState("");
  const [maturityTo, setMaturityTo] = useState("");
  const [annuitantDobFrom, setAnnuitantDobFrom] = useState("");
  const [annuitantDobTo, setAnnuitantDobTo] = useState("");

  // Numeric and Boolean filters
  const [contractValueFilter, setContractValueFilter] = useState<NumericFilter>({ op: ">", value: "" });
  const [deathBenefitFilter, setDeathBenefitFilter] = useState<NumericFilter>({ op: "≥", value: "" });
  const [incomeFilter, setIncomeFilter] = useState<NumericFilter>({ op: "≥", value: "" });
  const [rmd, setRmd] = useState<"all" | "yes" | "no">("all");
  const [liquidityFilter, setLiquidityFilter] = useState<NumericFilter>({ op: "=", value: "" });
  const [penaltyFreeFilter, setPenaltyFreeFilter] = useState<NumericFilter>({ op: "≥", value: "" });
  const [surrenderValueFilter, setSurrenderValueFilter] = useState<NumericFilter>({ op: "≥", value: "" });
  const [mvaFilter, setMvaFilter] = useState<NumericFilter>({ op: "≤", value: "" });

  // Applied Advanced Filters snapshot
  const [appliedAdvanced, setAppliedAdvanced] = useState({
    lastName: "",
    provider: "",
    productName: "",
    taxTreatment: "all" as "all" | "Pre-Tax" | "Roth" | "Non-Qualified",
    annuitantNotOwner: "all" as "all" | "yes" | "no",
    incomeMode: "all",
    ridersOrFeatures: "",
    anniversaryFrom: "",
    anniversaryTo: "",
    outOfSurrenderFrom: "",
    outOfSurrenderTo: "",
    maturityFrom: "",
    maturityTo: "",
    annuitantDobFrom: "",
    annuitantDobTo: "",
    contractValueFilter: { op: ">", value: "" },
    deathBenefitFilter: { op: "≥", value: "" },
    incomeFilter: { op: "≥", value: "" },
    rmd: "all" as "all" | "yes" | "no",
    liquidityFilter: { op: "=", value: "" },
    penaltyFreeFilter: { op: "≥", value: "" },
    surrenderValueFilter: { op: "≥", value: "" },
    mvaFilter: { op: "≤", value: "" },
  });

  const [isNewContractOpen, setIsNewContractOpen] = useState(false);
  const [isSuccessOpen, setIsSuccessOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState("Operation completed successfully.");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  // Apply filters action
  const handleApplyFilters = useCallback(() => {
    setAppliedAdvanced({
      lastName,
      provider,
      productName,
      taxTreatment,
      annuitantNotOwner,
      incomeMode,
      ridersOrFeatures,
      anniversaryFrom,
      anniversaryTo,
      outOfSurrenderFrom,
      outOfSurrenderTo,
      maturityFrom,
      maturityTo,
      annuitantDobFrom,
      annuitantDobTo,
      contractValueFilter: { ...contractValueFilter },
      deathBenefitFilter: { ...deathBenefitFilter },
      incomeFilter: { ...incomeFilter },
      rmd,
      liquidityFilter: { ...liquidityFilter },
      penaltyFreeFilter: { ...penaltyFreeFilter },
      surrenderValueFilter: { ...surrenderValueFilter },
      mvaFilter: { ...mvaFilter },
    });
    setCurrentPage(1);
  }, [
    lastName,
    provider,
    productName,
    taxTreatment,
    annuitantNotOwner,
    incomeMode,
    ridersOrFeatures,
    anniversaryFrom,
    anniversaryTo,
    outOfSurrenderFrom,
    outOfSurrenderTo,
    maturityFrom,
    maturityTo,
    annuitantDobFrom,
    annuitantDobTo,
    contractValueFilter,
    deathBenefitFilter,
    incomeFilter,
    rmd,
    liquidityFilter,
    penaltyFreeFilter,
    surrenderValueFilter,
    mvaFilter,
  ]);

  // Reset all filters action
  const handleResetFilters = useCallback(() => {
    setSearchQuery("");
    setSelectedType("All Types");
    setSelectedStatus("All Statuses");

    setLastName("");
    setProvider("");
    setProductName("");
    setTaxTreatment("all");
    setAnnuitantNotOwner("all");
    setIncomeMode("all");
    setRidersOrFeatures("");

    setAnniversaryFrom("");
    setAnniversaryTo("");
    setOutOfSurrenderFrom("");
    setOutOfSurrenderTo("");
    setMaturityFrom("");
    setMaturityTo("");
    setAnnuitantDobFrom("");
    setAnnuitantDobTo("");

    setContractValueFilter({ op: ">", value: "" });
    setDeathBenefitFilter({ op: "≥", value: "" });
    setIncomeFilter({ op: "≥", value: "" });
    setRmd("all");
    setLiquidityFilter({ op: "=", value: "" });
    setPenaltyFreeFilter({ op: "≥", value: "" });
    setSurrenderValueFilter({ op: "≥", value: "" });
    setMvaFilter({ op: "≤", value: "" });

    setAppliedAdvanced({
      lastName: "",
      provider: "",
      productName: "",
      taxTreatment: "all",
      annuitantNotOwner: "all",
      incomeMode: "all",
      ridersOrFeatures: "",
      anniversaryFrom: "",
      anniversaryTo: "",
      outOfSurrenderFrom: "",
      outOfSurrenderTo: "",
      maturityFrom: "",
      maturityTo: "",
      annuitantDobFrom: "",
      annuitantDobTo: "",
      contractValueFilter: { op: ">", value: "" },
      deathBenefitFilter: { op: "≥", value: "" },
      incomeFilter: { op: "≥", value: "" },
      rmd: "all",
      liquidityFilter: { op: "=", value: "" },
      penaltyFreeFilter: { op: "≥", value: "" },
      surrenderValueFilter: { op: "≥", value: "" },
      mvaFilter: { op: "≤", value: "" },
    });
    setCurrentPage(1);
  }, []);

  // Compute query parameters from currently applied filters
  const queryParams = useMemo(() => {
    const params: Record<string, any> = {};

    if (debouncedSearch?.trim()) params.search = debouncedSearch.trim();
    if (selectedType !== "All Types") params.contractType = selectedType;
    if (selectedStatus !== "All Statuses") params.status = selectedStatus;

    if (appliedAdvanced.lastName.trim()) params.lastName = appliedAdvanced.lastName.trim();
    if (appliedAdvanced.provider.trim()) params.provider = appliedAdvanced.provider.trim();
    if (appliedAdvanced.productName.trim()) params.productName = appliedAdvanced.productName.trim();
    if (appliedAdvanced.taxTreatment !== "all") params.taxTreatment = appliedAdvanced.taxTreatment;
    if (appliedAdvanced.annuitantNotOwner !== "all") params.annuitantNotOwner = appliedAdvanced.annuitantNotOwner === "yes";
    if (appliedAdvanced.incomeMode !== "all") params.incomeMode = appliedAdvanced.incomeMode;
    if (appliedAdvanced.ridersOrFeatures.trim()) params.ridersOrFeatures = appliedAdvanced.ridersOrFeatures.trim();

    if (appliedAdvanced.anniversaryFrom) params.anniversaryFrom = appliedAdvanced.anniversaryFrom;
    if (appliedAdvanced.anniversaryTo) params.anniversaryTo = appliedAdvanced.anniversaryTo;
    if (appliedAdvanced.outOfSurrenderFrom) params.outOfSurrenderFrom = appliedAdvanced.outOfSurrenderFrom;
    if (appliedAdvanced.outOfSurrenderTo) params.outOfSurrenderTo = appliedAdvanced.outOfSurrenderTo;
    if (appliedAdvanced.maturityFrom) params.maturityFrom = appliedAdvanced.maturityFrom;
    if (appliedAdvanced.maturityTo) params.maturityTo = appliedAdvanced.maturityTo;
    if (appliedAdvanced.annuitantDobFrom) params.annuitantDobFrom = appliedAdvanced.annuitantDobFrom;
    if (appliedAdvanced.annuitantDobTo) params.annuitantDobTo = appliedAdvanced.annuitantDobTo;

    // RMD boolean filter (rmd=true or rmd=false)
    if (appliedAdvanced.rmd !== "all") {
      params.rmd = appliedAdvanced.rmd === "yes";
    }

    // Numeric operators
    const numericList: { key: string; filter: NumericFilter }[] = [
      { key: "contractValue", filter: appliedAdvanced.contractValueFilter },
      { key: "deathBenefit", filter: appliedAdvanced.deathBenefitFilter },
      { key: "income", filter: appliedAdvanced.incomeFilter },
      { key: "liquidityFeature", filter: appliedAdvanced.liquidityFilter },
      { key: "penaltyFreeAmount", filter: appliedAdvanced.penaltyFreeFilter },
      { key: "currentSurrenderValue", filter: appliedAdvanced.surrenderValueFilter },
      { key: "marketValueAdjustment", filter: appliedAdvanced.mvaFilter },
    ];

    numericList.forEach(({ key, filter }) => {
      if (filter.value?.trim()) {
        const valNum = Number(filter.value.trim());
        if (!isNaN(valNum)) {
          const suffix = OPERATOR_SUFFIX[filter.op] || "Eq";
          params[`${key}${suffix}`] = valNum;
        }
      }
    });

    return params;
  }, [debouncedSearch, selectedType, selectedStatus, appliedAdvanced]);

  // Active filter count for the badge
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (debouncedSearch?.trim()) count++;
    if (selectedType !== "All Types") count++;
    if (selectedStatus !== "All Statuses") count++;
    if (appliedAdvanced.lastName.trim()) count++;
    if (appliedAdvanced.provider.trim()) count++;
    if (appliedAdvanced.productName.trim()) count++;
    if (appliedAdvanced.taxTreatment !== "all") count++;
    if (appliedAdvanced.annuitantNotOwner !== "all") count++;
    if (appliedAdvanced.incomeMode !== "all") count++;
    if (appliedAdvanced.ridersOrFeatures.trim()) count++;
    if (appliedAdvanced.anniversaryFrom || appliedAdvanced.anniversaryTo) count++;
    if (appliedAdvanced.outOfSurrenderFrom || appliedAdvanced.outOfSurrenderTo) count++;
    if (appliedAdvanced.maturityFrom || appliedAdvanced.maturityTo) count++;
    if (appliedAdvanced.annuitantDobFrom || appliedAdvanced.annuitantDobTo) count++;
    if (appliedAdvanced.contractValueFilter.value.trim()) count++;
    if (appliedAdvanced.deathBenefitFilter.value.trim()) count++;
    if (appliedAdvanced.incomeFilter.value.trim()) count++;
    if (appliedAdvanced.rmd !== "all") count++;
    if (appliedAdvanced.liquidityFilter.value.trim()) count++;
    if (appliedAdvanced.penaltyFreeFilter.value.trim()) count++;
    if (appliedAdvanced.surrenderValueFilter.value.trim()) count++;
    if (appliedAdvanced.mvaFilter.value.trim()) count++;
    return count;
  }, [debouncedSearch, selectedType, selectedStatus, appliedAdvanced]);

  const { data, isLoading, error } = useContracts({
    ...queryParams,
    page: currentPage,
    limit: itemsPerPage,
  });

  useEffect(() => {
    if (error) {
      const errObj = error as any;
      const backendError = errObj?.response?.data?.error;
      if (Array.isArray(backendError) && backendError.length > 0) {
        toast.error(backendError[0].message || "Validation error");
      } else {
        toast.error(errObj?.response?.data?.message || errObj?.message || "Failed to load contracts");
      }
    }
  }, [error]);

  const contracts = data?.data || [];
  const totalPages = data?.total ? Math.ceil(data.total / itemsPerPage) : 1;
  const totalItems = data?.total || 0;

  const handleExportPDF = async () => {
    try {
      await exportContracts("pdf", queryParams);
      setSuccessMessage("PDF export downloaded successfully.");
      setIsSuccessOpen(true);
    } catch (err: any) {
      toast.error(err.message || "Export PDF failed");
    }
  };

  const handleExportCSV = async () => {
    try {
      await exportContracts("csv", queryParams);
      setSuccessMessage("CSV export downloaded successfully.");
      setIsSuccessOpen(true);
    } catch (err: any) {
      toast.error(err.message || "Export CSV failed");
    }
  };

  return (
    <div className="w-full flex flex-col gap-5 max-w-[1440px] mx-auto pb-8 font-sans">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            Contracts
          </h1>
          <p className="text-xs text-[#919191] mt-0.5">
            Manage, filter, and track all client annuity contracts and policies.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={handleExportPDF}
            className="h-10 px-3.5 bg-[#141C24] hover:bg-white/10 text-white border border-white/10 rounded-[10px] text-xs font-medium transition-all flex items-center gap-2 cursor-pointer shadow-sm"
          >
            <Download className="w-4 h-4 text-[#919191]" />
            <span>PDF</span>
          </button>

          <button
            type="button"
            onClick={handleExportCSV}
            className="h-10 px-3.5 bg-[#141C24] hover:bg-white/10 text-white border border-white/10 rounded-[10px] text-xs font-medium transition-all flex items-center gap-2 cursor-pointer shadow-sm"
          >
            <Download className="w-4 h-4 text-[#919191]" />
            <span>CSV</span>
          </button>

          <button
            type="button"
            onClick={() => setIsNewContractOpen(true)}
            className="h-10 px-4 bg-gradient-to-r from-[#66859E] to-[#849EB2] text-white hover:opacity-90 rounded-[10px] text-xs font-medium transition-all shadow-md flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>New Contract</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="w-full bg-[#141C24] border border-white/5 rounded-[12px] p-3 sm:p-4 shadow-sm flex flex-col gap-3 font-sans">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Main Search Input */}
          <div className="relative w-full">
            <Search className="w-4 h-4 text-[#919191] absolute left-3 top-1/2 -translate-y-1/2" />
            <Input
              type="text"
              placeholder="Search contracts, client, policy..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="h-10 bg-[#0F1722] border border-white/10 text-white placeholder-[#8C8C8C] text-xs rounded-[10px] pl-9 pr-8 focus-visible:ring-1 focus-visible:ring-[#6887A0]"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#8C8C8C] hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Quick Contract Type */}
          <div>
            <Select
              value={selectedType}
              onValueChange={(val: string | null) => {
                if (val) {
                  setSelectedType(val);
                  setCurrentPage(1);
                }
              }}
            >
              <SelectTrigger className="w-full h-10 bg-[#0F1722] border border-white/10 text-white rounded-[10px] text-xs focus:ring-0 font-sans">
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent
                side="bottom"
                alignItemWithTrigger={false}
                className="bg-[#0F1722] border-white/10 text-white font-sans max-h-60"
              >
                {ALL_CONTRACT_TYPES.map((type) => (
                  <SelectItem key={type} value={type} className="text-xs">
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Quick Status Filter */}
          <div>
            <Select
              value={selectedStatus}
              onValueChange={(val: string | null) => {
                if (val) {
                  setSelectedStatus(val);
                  setCurrentPage(1);
                }
              }}
            >
              <SelectTrigger className="w-full h-10 bg-[#0F1722] border border-white/10 text-white rounded-[10px] text-xs focus:ring-0 font-sans">
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent
                side="bottom"
                alignItemWithTrigger={false}
                className="bg-[#0F1722] border-white/10 text-white font-sans"
              >
                {ALL_STATUSES.map((status) => (
                  <SelectItem key={status} value={status} className="text-xs">
                    {status}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Filters Toggle Button */}
          <button
            type="button"
            onClick={() => setIsAdvancedOpen((prev) => !prev)}
            className={`h-10 px-4 rounded-[10px] text-xs sm:text-sm font-medium transition-all flex items-center gap-2 border cursor-pointer select-none ${
              isAdvancedOpen
                ? "bg-[#25384B] text-white border-white/20 shadow-sm"
                : "bg-[#0F1722] hover:bg-white/10 text-white border-white/10"
            }`}
          >
            <SlidersHorizontal className="w-4 h-4 text-[#919191]" />
            <span>Filters</span>
            {activeFilterCount > 0 && (
              <span className="min-w-[20px] h-5 px-1 rounded-full bg-[#42CD7F] text-black font-bold text-[11px] flex items-center justify-center">
                {activeFilterCount}
              </span>
            )}
            {isAdvancedOpen ? (
              <ChevronUp className="w-3.5 h-3.5 text-[#919191]" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5 text-[#919191]" />
            )}
          </button>
        </div>
      </div>

      {/* Redesigned Collapsible Advanced Filter Panel */}
      {isAdvancedOpen && (
        <div className="w-full bg-[#15202B] border border-white/10 rounded-[14px] p-4 sm:p-5 flex flex-col gap-4 shadow-xl font-sans">
          {/* Header Row */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/10">
            <div className="flex flex-col">
              <h2 className="text-base font-semibold text-white tracking-tight">Filter Contracts</h2>
              <p className="text-xs text-[#919191] mt-0.5">
                Use the filters below to find specific contracts. All filters are optional and combined with AND logic.
              </p>
            </div>

            <div className="flex items-center gap-2.5 self-end sm:self-auto">
              <button
                type="button"
                onClick={handleResetFilters}
                className="h-9 px-3.5 bg-white/5 hover:bg-white/10 text-white/90 hover:text-white border border-white/10 rounded-[10px] text-xs font-medium transition-all flex items-center gap-2 cursor-pointer shadow-sm"
              >
                <RotateCcw className="w-3.5 h-3.5 text-[#919191]" />
                <span>Reset All</span>
              </button>

              <button
                type="button"
                onClick={handleApplyFilters}
                className="h-9 px-5 bg-[#3B82F6] hover:bg-[#2563EB] text-white rounded-[10px] text-xs font-medium transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
              >
                <span>Apply Filters</span>
              </button>
            </div>
          </div>

          {/* Group 1: Basic Filters */}
          <div className="bg-[#0C1116] border border-white/5 rounded-[12px] overflow-hidden transition-all">
            <button
              type="button"
              onClick={() => toggleSection("basic")}
              className="w-full px-4 py-3 flex items-center justify-between hover:bg-white/[0.02] transition-colors cursor-pointer text-left"
            >
              <div className="flex items-center gap-2.5">
                <span className="w-5 h-5 rounded-full bg-[#1F2C39] text-[#60A5FA] border border-[#3B82F6]/30 flex items-center justify-center font-bold text-[11px]">
                  1
                </span>
                <span className="text-xs font-semibold text-white tracking-wide">Basic Filters</span>
              </div>
              {openSections.basic ? (
                <ChevronUp className="w-4 h-4 text-[#8C8C8C]" />
              ) : (
                <ChevronDown className="w-4 h-4 text-[#8C8C8C]" />
              )}
            </button>

            {openSections.basic && (
              <div className="p-4 pt-1 border-t border-white/5">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
                  <div className="flex flex-col gap-1.5">
                    <Label className="text-[11px] font-medium text-[#919191]">Client Last Name</Label>
                    <Input
                      type="text"
                      placeholder="e.g. Thompson"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleApplyFilters();
                      }}
                      className="h-10 bg-[#141C24] border border-white/10 text-white placeholder-[#8C8C8C] text-xs rounded-[10px] px-3 focus-visible:ring-1 focus-visible:ring-[#3B82F6]"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <Label className="text-[11px] font-medium text-[#919191]">Company / Carrier</Label>
                    <Input
                      type="text"
                      placeholder="e.g. Athene, Nationwide"
                      value={provider}
                      onChange={(e) => setProvider(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleApplyFilters();
                      }}
                      className="h-10 bg-[#141C24] border border-white/10 text-white placeholder-[#8C8C8C] text-xs rounded-[10px] px-3 focus-visible:ring-1 focus-visible:ring-[#3B82F6]"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <Label className="text-[11px] font-medium text-[#919191]">Product Name</Label>
                    <Input
                      type="text"
                      placeholder="e.g. Gold Guard"
                      value={productName}
                      onChange={(e) => setProductName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleApplyFilters();
                      }}
                      className="h-10 bg-[#141C24] border border-white/10 text-white placeholder-[#8C8C8C] text-xs rounded-[10px] px-3 focus-visible:ring-1 focus-visible:ring-[#3B82F6]"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <Label className="text-[11px] font-medium text-[#919191]">Contract Type</Label>
                    <Select
                      value={selectedType}
                      onValueChange={(val: string | null) => {
                        if (val) setSelectedType(val);
                      }}
                    >
                      <SelectTrigger className="h-10 bg-[#141C24] border border-white/10 text-white rounded-[10px] text-xs focus:ring-0">
                        <SelectValue placeholder="All Types" />
                      </SelectTrigger>
                      <SelectContent className="bg-[#141C24] border-white/10 text-white max-h-60">
                        {ALL_CONTRACT_TYPES.map((type) => (
                          <SelectItem key={type} value={type} className="text-xs">
                            {type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <Label className="text-[11px] font-medium text-[#919191]">Contract Status</Label>
                    <Select
                      value={selectedStatus}
                      onValueChange={(val: string | null) => {
                        if (val) setSelectedStatus(val);
                      }}
                    >
                      <SelectTrigger className="h-10 bg-[#141C24] border border-white/10 text-white rounded-[10px] text-xs focus:ring-0">
                        <SelectValue placeholder="All Statuses" />
                      </SelectTrigger>
                      <SelectContent className="bg-[#141C24] border-white/10 text-white">
                        {ALL_STATUSES.map((status) => (
                          <SelectItem key={status} value={status} className="text-xs">
                            {status}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Group 2: Contract Details */}
          <div className="bg-[#0C1116] border border-white/5 rounded-[12px] overflow-hidden transition-all">
            <button
              type="button"
              onClick={() => toggleSection("details")}
              className="w-full px-4 py-3 flex items-center justify-between hover:bg-white/[0.02] transition-colors cursor-pointer text-left"
            >
              <div className="flex items-center gap-2.5">
                <span className="w-5 h-5 rounded-full bg-[#1F2C39] text-[#60A5FA] border border-[#3B82F6]/30 flex items-center justify-center font-bold text-[11px]">
                  2
                </span>
                <span className="text-xs font-semibold text-white tracking-wide">Contract Details</span>
              </div>
              {openSections.details ? (
                <ChevronUp className="w-4 h-4 text-[#8C8C8C]" />
              ) : (
                <ChevronDown className="w-4 h-4 text-[#8C8C8C]" />
              )}
            </button>

            {openSections.details && (
              <div className="p-4 pt-1 border-t border-white/5">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
                  {/* Tax Treatment replaces Qualified */}
                  <div className="flex flex-col gap-1.5">
                    <Label className="text-[11px] font-medium text-[#919191]">Tax Treatment</Label>
                    <Select
                      value={taxTreatment}
                      onValueChange={(val: any) => {
                        if (val) setTaxTreatment(val);
                      }}
                    >
                      <SelectTrigger className="h-10 bg-[#141C24] border border-white/10 text-white rounded-[10px] text-xs focus:ring-0">
                        <SelectValue placeholder="All" />
                      </SelectTrigger>
                      <SelectContent className="bg-[#141C24] border-white/10 text-white">
                        <SelectItem value="all" className="text-xs">All</SelectItem>
                        <SelectItem value="Pre-Tax" className="text-xs">Pre-Tax</SelectItem>
                        <SelectItem value="Roth" className="text-xs">Roth</SelectItem>
                        <SelectItem value="Non-Qualified" className="text-xs">Non-Qualified</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <Label className="text-[11px] font-medium text-[#919191]">Annuitant Not Owner</Label>
                    <Select
                      value={annuitantNotOwner}
                      onValueChange={(val: any) => {
                        if (val) setAnnuitantNotOwner(val);
                      }}
                    >
                      <SelectTrigger className="h-10 bg-[#141C24] border border-white/10 text-white rounded-[10px] text-xs focus:ring-0">
                        <SelectValue placeholder="All" />
                      </SelectTrigger>
                      <SelectContent className="bg-[#141C24] border-white/10 text-white">
                        <SelectItem value="all" className="text-xs">All</SelectItem>
                        <SelectItem value="yes" className="text-xs">Yes</SelectItem>
                        <SelectItem value="no" className="text-xs">No</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <Label className="text-[11px] font-medium text-[#919191]">Riders or Features (contains)</Label>
                    <Input
                      type="text"
                      placeholder="e.g. LTC, Lifetime Income"
                      value={ridersOrFeatures}
                      onChange={(e) => setRidersOrFeatures(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleApplyFilters();
                      }}
                      className="h-10 bg-[#141C24] border border-white/10 text-white placeholder-[#8C8C8C] text-xs rounded-[10px] px-3 focus-visible:ring-1 focus-visible:ring-[#3B82F6]"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <Label className="text-[11px] font-medium text-[#919191]">Income Mode</Label>
                    <Select
                      value={incomeMode}
                      onValueChange={(val: string | null) => {
                        if (val) setIncomeMode(val);
                      }}
                    >
                      <SelectTrigger className="h-10 bg-[#141C24] border border-white/10 text-white rounded-[10px] text-xs focus:ring-0">
                        <SelectValue placeholder="All" />
                      </SelectTrigger>
                      <SelectContent className="bg-[#141C24] border-white/10 text-white">
                        <SelectItem value="all" className="text-xs">All</SelectItem>
                        <SelectItem value="Daily" className="text-xs">Daily</SelectItem>
                        <SelectItem value="Monthly" className="text-xs">Monthly</SelectItem>
                        <SelectItem value="Quarterly" className="text-xs">Quarterly</SelectItem>
                        <SelectItem value="Biannual" className="text-xs">Biannual</SelectItem>
                        <SelectItem value="Annual" className="text-xs">Annual</SelectItem>
                        <SelectItem value="Other" className="text-xs">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Group 3: Date Ranges */}
          <div className="bg-[#0C1116] border border-white/5 rounded-[12px] overflow-hidden transition-all">
            <button
              type="button"
              onClick={() => toggleSection("dates")}
              className="w-full px-4 py-3 flex items-center justify-between hover:bg-white/[0.02] transition-colors cursor-pointer text-left"
            >
              <div className="flex items-center gap-2.5">
                <span className="w-5 h-5 rounded-full bg-[#1F2C39] text-[#60A5FA] border border-[#3B82F6]/30 flex items-center justify-center font-bold text-[11px]">
                  3
                </span>
                <span className="text-xs font-semibold text-white tracking-wide">Date Ranges</span>
              </div>
              {openSections.dates ? (
                <ChevronUp className="w-4 h-4 text-[#8C8C8C]" />
              ) : (
                <ChevronDown className="w-4 h-4 text-[#8C8C8C]" />
              )}
            </button>

            {openSections.dates && (
              <div className="p-4 pt-1 border-t border-white/5">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Anniversary Date Range */}
                  <div className="flex flex-col gap-1.5">
                    <Label className="text-[11px] font-medium text-[#919191]">Anniversary Date Range</Label>
                    <div className="grid grid-cols-2 gap-2">
                      <DatePickerInput
                        value={anniversaryFrom}
                        onChangeString={(val) => setAnniversaryFrom(val)}
                        placeholder="From: MM/DD/YYYY"
                        className="rounded-[10px]"
                        showErrorText={false}
                      />
                      <DatePickerInput
                        value={anniversaryTo}
                        onChangeString={(val) => setAnniversaryTo(val)}
                        placeholder="To: MM/DD/YYYY"
                        className="rounded-[10px]"
                        showErrorText={false}
                      />
                    </div>
                  </div>

                  {/* Out of Surrender Range */}
                  <div className="flex flex-col gap-1.5">
                    <Label className="text-[11px] font-medium text-[#919191]">Out of Surrender Range</Label>
                    <div className="grid grid-cols-2 gap-2">
                      <DatePickerInput
                        value={outOfSurrenderFrom}
                        onChangeString={(val) => setOutOfSurrenderFrom(val)}
                        placeholder="From: MM/DD/YYYY"
                        className="rounded-[10px]"
                        showErrorText={false}
                      />
                      <DatePickerInput
                        value={outOfSurrenderTo}
                        onChangeString={(val) => setOutOfSurrenderTo(val)}
                        placeholder="To: MM/DD/YYYY"
                        className="rounded-[10px]"
                        showErrorText={false}
                      />
                    </div>
                  </div>

                  {/* Maturity Date Range (New) */}
                  <div className="flex flex-col gap-1.5">
                    <Label className="text-[11px] font-medium text-[#919191]">Maturity Date Range</Label>
                    <div className="grid grid-cols-2 gap-2">
                      <DatePickerInput
                        value={maturityFrom}
                        onChangeString={(val) => setMaturityFrom(val)}
                        placeholder="From: MM/DD/YYYY"
                        className="rounded-[10px]"
                        showErrorText={false}
                      />
                      <DatePickerInput
                        value={maturityTo}
                        onChangeString={(val) => setMaturityTo(val)}
                        placeholder="To: MM/DD/YYYY"
                        className="rounded-[10px]"
                        showErrorText={false}
                      />
                    </div>
                  </div>

                  {/* Annuitant DOB Range */}
                  <div className="flex flex-col gap-1.5">
                    <Label className="text-[11px] font-medium text-[#919191]">Annuitant DOB Range</Label>
                    <div className="grid grid-cols-2 gap-2">
                      <DatePickerInput
                        value={annuitantDobFrom}
                        onChangeString={(val) => setAnnuitantDobFrom(val)}
                        placeholder="From: MM/DD/YYYY"
                        className="rounded-[10px]"
                        showErrorText={false}
                        isDob
                        label="Annuitant DOB"
                      />
                      <DatePickerInput
                        value={annuitantDobTo}
                        onChangeString={(val) => setAnnuitantDobTo(val)}
                        placeholder="To: MM/DD/YYYY"
                        className="rounded-[10px]"
                        showErrorText={false}
                        isDob
                        label="Annuitant DOB"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Group 4: Financial Criteria */}
          <div className="bg-[#0C1116] border border-white/5 rounded-[12px] overflow-hidden transition-all">
            <button
              type="button"
              onClick={() => toggleSection("financial")}
              className="w-full px-4 py-3 flex items-center justify-between hover:bg-white/[0.02] transition-colors cursor-pointer text-left"
            >
              <div className="flex items-center gap-2.5">
                <span className="w-5 h-5 rounded-full bg-[#1F2C39] text-[#60A5FA] border border-[#3B82F6]/30 flex items-center justify-center font-bold text-[11px]">
                  4
                </span>
                <span className="text-xs font-semibold text-white tracking-wide">Financial Criteria</span>
              </div>
              {openSections.financial ? (
                <ChevronUp className="w-4 h-4 text-[#8C8C8C]" />
              ) : (
                <ChevronDown className="w-4 h-4 text-[#8C8C8C]" />
              )}
            </button>

            {openSections.financial && (
              <div className="p-4 pt-1 border-t border-white/5">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
                  {/* Accumulated Value */}
                  <div className="flex flex-col gap-1.5">
                    <Label className="text-[11px] font-medium text-[#919191]">Accumulated Value</Label>
                    <div className="flex items-center h-10 w-full rounded-[10px] bg-[#141C24] border border-white/10 focus-within:border-[#3B82F6]/60 transition-colors overflow-hidden">
                      <Select
                        value={contractValueFilter.op}
                        onValueChange={(val: string | null) => {
                          if (val) setContractValueFilter((prev) => ({ ...prev, op: val }));
                        }}
                      >
                        <SelectTrigger className="w-[58px] h-full bg-[#182430] border-0 border-r border-white/10 rounded-none text-white text-xs font-mono px-2.5 focus:ring-0 shadow-none justify-between">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-[#141C24] border-white/10 text-white font-mono min-w-[70px]">
                          {OPERATORS.map((o) => (
                            <SelectItem key={o.value} value={o.value} className="text-xs font-mono">{o.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <input
                        type="number"
                        placeholder="e.g. 100000"
                        value={contractValueFilter.value}
                        onChange={(e) => setContractValueFilter((prev) => ({ ...prev, value: e.target.value }))}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleApplyFilters();
                        }}
                        className="flex-1 h-full bg-transparent border-0 text-white placeholder-[#8C8C8C] text-xs px-3 focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Death Benefit */}
                  <div className="flex flex-col gap-1.5">
                    <Label className="text-[11px] font-medium text-[#919191]">Death Benefit</Label>
                    <div className="flex items-center h-10 w-full rounded-[10px] bg-[#141C24] border border-white/10 focus-within:border-[#3B82F6]/60 transition-colors overflow-hidden">
                      <Select
                        value={deathBenefitFilter.op}
                        onValueChange={(val: string | null) => {
                          if (val) setDeathBenefitFilter((prev) => ({ ...prev, op: val }));
                        }}
                      >
                        <SelectTrigger className="w-[58px] h-full bg-[#182430] border-0 border-r border-white/10 rounded-none text-white text-xs font-mono px-2.5 focus:ring-0 shadow-none justify-between">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-[#141C24] border-white/10 text-white font-mono min-w-[70px]">
                          {OPERATORS.map((o) => (
                            <SelectItem key={o.value} value={o.value} className="text-xs font-mono">{o.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <input
                        type="number"
                        placeholder="e.g. 500000"
                        value={deathBenefitFilter.value}
                        onChange={(e) => setDeathBenefitFilter((prev) => ({ ...prev, value: e.target.value }))}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleApplyFilters();
                        }}
                        className="flex-1 h-full bg-transparent border-0 text-white placeholder-[#8C8C8C] text-xs px-3 focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Income */}
                  <div className="flex flex-col gap-1.5">
                    <Label className="text-[11px] font-medium text-[#919191]">Income</Label>
                    <div className="flex items-center h-10 w-full rounded-[10px] bg-[#141C24] border border-white/10 focus-within:border-[#3B82F6]/60 transition-colors overflow-hidden">
                      <Select
                        value={incomeFilter.op}
                        onValueChange={(val: string | null) => {
                          if (val) setIncomeFilter((prev) => ({ ...prev, op: val }));
                        }}
                      >
                        <SelectTrigger className="w-[58px] h-full bg-[#182430] border-0 border-r border-white/10 rounded-none text-white text-xs font-mono px-2.5 focus:ring-0 shadow-none justify-between">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-[#141C24] border-white/10 text-white font-mono min-w-[70px]">
                          {OPERATORS.map((o) => (
                            <SelectItem key={o.value} value={o.value} className="text-xs font-mono">{o.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <input
                        type="number"
                        placeholder="e.g. 1000"
                        value={incomeFilter.value}
                        onChange={(e) => setIncomeFilter((prev) => ({ ...prev, value: e.target.value }))}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleApplyFilters();
                        }}
                        className="flex-1 h-full bg-transparent border-0 text-white placeholder-[#8C8C8C] text-xs px-3 focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* RMD - Yes / No Filter (Replaced numeric operator) */}
                  <div className="flex flex-col gap-1.5">
                    <Label className="text-[11px] font-medium text-[#919191]">RMD (Yes / No)</Label>
                    <Select
                      value={rmd}
                      onValueChange={(val: any) => {
                        if (val) setRmd(val);
                      }}
                    >
                      <SelectTrigger className="h-10 bg-[#141C24] border border-white/10 text-white rounded-[10px] text-xs focus:ring-0">
                        <SelectValue placeholder="All" />
                      </SelectTrigger>
                      <SelectContent className="bg-[#141C24] border-white/10 text-white">
                        <SelectItem value="all" className="text-xs">All</SelectItem>
                        <SelectItem value="yes" className="text-xs">Yes</SelectItem>
                        <SelectItem value="no" className="text-xs">No</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Liquidity % */}
                  <div className="flex flex-col gap-1.5">
                    <Label className="text-[11px] font-medium text-[#919191]">Liquidity %</Label>
                    <div className="flex items-center h-10 w-full rounded-[10px] bg-[#141C24] border border-white/10 focus-within:border-[#3B82F6]/60 transition-colors overflow-hidden">
                      <Select
                        value={liquidityFilter.op}
                        onValueChange={(val: string | null) => {
                          if (val) setLiquidityFilter((prev) => ({ ...prev, op: val }));
                        }}
                      >
                        <SelectTrigger className="w-[58px] h-full bg-[#182430] border-0 border-r border-white/10 rounded-none text-white text-xs font-mono px-2.5 focus:ring-0 shadow-none justify-between">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-[#141C24] border-white/10 text-white font-mono min-w-[70px]">
                          {OPERATORS.map((o) => (
                            <SelectItem key={o.value} value={o.value} className="text-xs font-mono">{o.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <input
                        type="number"
                        placeholder="e.g. 10"
                        value={liquidityFilter.value}
                        onChange={(e) => setLiquidityFilter((prev) => ({ ...prev, value: e.target.value }))}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleApplyFilters();
                        }}
                        className="flex-1 h-full bg-transparent border-0 text-white placeholder-[#8C8C8C] text-xs px-3 focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Penalty Free Amount */}
                  <div className="flex flex-col gap-1.5">
                    <Label className="text-[11px] font-medium text-[#919191]">Penalty Free Amount</Label>
                    <div className="flex items-center h-10 w-full rounded-[10px] bg-[#141C24] border border-white/10 focus-within:border-[#3B82F6]/60 transition-colors overflow-hidden">
                      <Select
                        value={penaltyFreeFilter.op}
                        onValueChange={(val: string | null) => {
                          if (val) setPenaltyFreeFilter((prev) => ({ ...prev, op: val }));
                        }}
                      >
                        <SelectTrigger className="w-[58px] h-full bg-[#182430] border-0 border-r border-white/10 rounded-none text-white text-xs font-mono px-2.5 focus:ring-0 shadow-none justify-between">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-[#141C24] border-white/10 text-white font-mono min-w-[70px]">
                          {OPERATORS.map((o) => (
                            <SelectItem key={o.value} value={o.value} className="text-xs font-mono">{o.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <input
                        type="number"
                        placeholder="e.g. 10000"
                        value={penaltyFreeFilter.value}
                        onChange={(e) => setPenaltyFreeFilter((prev) => ({ ...prev, value: e.target.value }))}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleApplyFilters();
                        }}
                        className="flex-1 h-full bg-transparent border-0 text-white placeholder-[#8C8C8C] text-xs px-3 focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Surrender Value */}
                  <div className="flex flex-col gap-1.5">
                    <Label className="text-[11px] font-medium text-[#919191]">Surrender Value</Label>
                    <div className="flex items-center h-10 w-full rounded-[10px] bg-[#141C24] border border-white/10 focus-within:border-[#3B82F6]/60 transition-colors overflow-hidden">
                      <Select
                        value={surrenderValueFilter.op}
                        onValueChange={(val: string | null) => {
                          if (val) setSurrenderValueFilter((prev) => ({ ...prev, op: val }));
                        }}
                      >
                        <SelectTrigger className="w-[58px] h-full bg-[#182430] border-0 border-r border-white/10 rounded-none text-white text-xs font-mono px-2.5 focus:ring-0 shadow-none justify-between">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-[#141C24] border-white/10 text-white font-mono min-w-[70px]">
                          {OPERATORS.map((o) => (
                            <SelectItem key={o.value} value={o.value} className="text-xs font-mono">{o.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <input
                        type="number"
                        placeholder="e.g. 90000"
                        value={surrenderValueFilter.value}
                        onChange={(e) => setSurrenderValueFilter((prev) => ({ ...prev, value: e.target.value }))}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleApplyFilters();
                        }}
                        className="flex-1 h-full bg-transparent border-0 text-white placeholder-[#8C8C8C] text-xs px-3 focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Market Value Adjustment */}
                  <div className="flex flex-col gap-1.5">
                    <Label className="text-[11px] font-medium text-[#919191]">Market Value Adjustment</Label>
                    <div className="flex items-center h-10 w-full rounded-[10px] bg-[#141C24] border border-white/10 focus-within:border-[#3B82F6]/60 transition-colors overflow-hidden">
                      <Select
                        value={mvaFilter.op}
                        onValueChange={(val: string | null) => {
                          if (val) setMvaFilter((prev) => ({ ...prev, op: val }));
                        }}
                      >
                        <SelectTrigger className="w-[58px] h-full bg-[#182430] border-0 border-r border-white/10 rounded-none text-white text-xs font-mono px-2.5 focus:ring-0 shadow-none justify-between">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-[#141C24] border-white/10 text-white font-mono min-w-[70px]">
                          {OPERATORS.map((o) => (
                            <SelectItem key={o.value} value={o.value} className="text-xs font-mono">{o.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <input
                        type="number"
                        placeholder="e.g. 0 (can be -)"
                        value={mvaFilter.value}
                        onChange={(e) => setMvaFilter((prev) => ({ ...prev, value: e.target.value }))}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleApplyFilters();
                        }}
                        className="flex-1 h-full bg-transparent border-0 text-white placeholder-[#8C8C8C] text-xs px-3 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Main Contracts Table Container */}
      <div className="w-full bg-[#141C24] border border-white/5 rounded-[12px] overflow-hidden shadow-sm flex flex-col justify-between min-h-[420px]">
        <div className="w-full overflow-x-auto">
          <Table>
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
                  Accumulated Value
                </TableHead>
                <TableHead className="text-white font-medium text-xs sm:text-sm h-10 px-6">
                  Anniversary
                </TableHead>
                <TableHead className="text-white font-medium text-xs sm:text-sm h-10 px-6">
                  Status
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: itemsPerPage }).map((_, i) => (
                  <TableRow key={i} className="border-b border-white/10 h-14">
                    <TableCell colSpan={7}>
                      <Skeleton className="h-6 w-full bg-white/5" />
                    </TableCell>
                  </TableRow>
                ))
              ) : contracts.length > 0 ? (
                contracts.map((contract) => (
                  <TableRow
                    key={contract.id}
                    onClick={() =>
                      router.push(`/dashboard/contracts/${contract.id}`)
                    }
                    className="border-b border-white/10 hover:bg-white/[0.02] transition-colors h-14 cursor-pointer"
                  >
                    <TableCell className="px-6 py-3.5 text-sm font-medium text-white">
                      <div>{contract.contractNumber}</div>
                      {contract.policyNumber ? (
                        <div className="text-xs text-[#919191] font-normal">
                          Contract: {contract.policyNumber}
                        </div>
                      ) : null}
                    </TableCell>
                    <TableCell className="px-6 py-3.5 text-sm text-white">
                      {contract.client ? `${contract.client.firstName} ${contract.client.lastName}` : "Unknown Client"}
                    </TableCell>
                    <TableCell className="px-6 py-3.5 text-sm text-white">
                      {contract.provider}
                    </TableCell>
                    <TableCell className="px-6 py-3.5 text-sm text-white">
                      {contract.contractType}
                    </TableCell>
                    <TableCell className="px-6 py-3.5 text-sm text-white">
                      {formatCurrency(contract.contractValue)}
                    </TableCell>
                    <TableCell className="px-6 py-3.5 text-sm text-white">
                      {formatAnniversary(contract.anniversaryDate)}
                    </TableCell>
                    <TableCell className="px-6 py-3.5">
                      <Badge
                        className={cn(
                          "px-2.5 py-0.5 rounded-[8px] text-xs font-medium capitalize",
                          getStatusStyle(contract.status)
                        )}
                      >
                        {contract.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="h-48 text-center">
                    <EmptyState
                      icon={FileText}
                      title="No Contracts Found"
                      description="No contracts found matching your search or filters."
                    />
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
            itemLabel="contracts"
          />
        </div>
      </div>

      {/* New Contract Dialog */}
      <NewContractDialog
        isOpen={isNewContractOpen}
        onClose={() => setIsNewContractOpen(false)}
        onSubmitSuccess={() => {
          setSuccessMessage("Contract created successfully.");
          setIsSuccessOpen(true);
        }}
      />

      {/* Contract Created / Export Success Popup */}
      <SuccessModal
        isOpen={isSuccessOpen}
        onClose={() => setIsSuccessOpen(false)}
        title="Success"
        description={successMessage}
      />
    </div>
  );
}
