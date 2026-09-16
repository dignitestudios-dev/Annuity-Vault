"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useDebounce } from "@/hooks/use-debounce";
import { Plus, Search, FileText, Download, X } from "lucide-react";
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
import NewContractDialog from "@/features/contracts/components/new-contract-dialog";
import SuccessModal from "@/components/shared/success-modal";
import TablePagination from "@/components/shared/table-pagination";
import { EmptyState } from "@/components/shared/empty-state";
import { cn } from "@/lib/utils";
import { useContracts, exportContracts } from "@/features/contracts/api/contracts.service";
import { Skeleton } from "@/components/ui/skeleton";
import { format, differenceInDays } from "date-fns";

const getStatusStyle = (status: string) => {
  switch (status?.toLowerCase()) {
    case "active":
      return "bg-[#42CD7F] text-white border-0";
    case "surrendered":
      return "bg-[#FF3E46] text-white border-0";
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

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value || 0);
};

const formatAnniversary = (dateString?: string) => {
  if (!dateString) return "N/A";
  const date = new Date(dateString);
  const now = new Date();
  
  // Create a date for this year's anniversary
  const thisYearAnniversary = new Date(date);
  thisYearAnniversary.setFullYear(now.getFullYear());
  
  // If anniversary already passed this year, look at next year's
  if (thisYearAnniversary < now) {
    thisYearAnniversary.setFullYear(now.getFullYear() + 1);
  }
  
  const daysDiff = differenceInDays(thisYearAnniversary, now);
  const formattedDate = format(thisYearAnniversary, "yyyy-MM-dd");
  
  return `${formattedDate} (${daysDiff}d)`;
};

export default function ContractsPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearch = useDebounce(searchQuery, 400);
  const [selectedType, setSelectedType] = useState("All Types");
  const [selectedStatus, setSelectedStatus] = useState("All Statuses");
  const [isNewContractOpen, setIsNewContractOpen] = useState(false);
  const [isSuccessOpen, setIsSuccessOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  const { data, isLoading } = useContracts({
    search: debouncedSearch || undefined,
    contractType: selectedType !== "All Types" ? selectedType : undefined,
    status: selectedStatus !== "All Statuses" ? selectedStatus : undefined,
    page: currentPage,
    limit: itemsPerPage,
  });

  const contracts = data?.data || [];
  const totalPages = data?.total ? Math.ceil(data.total / itemsPerPage) : 1;
  const totalItems = data?.total || 0;

  const handleExportPDF = async () => {
    try {
      await exportContracts("pdf", debouncedSearch || undefined, selectedType !== "All Types" ? selectedType : undefined, selectedStatus !== "All Statuses" ? selectedStatus : undefined);
      setIsSuccessOpen(true);
    } catch (error) {
      console.error("Export PDF failed:", error);
    }
  };

  const handleExportCSV = async () => {
    try {
      await exportContracts("csv", debouncedSearch || undefined, selectedType !== "All Types" ? selectedType : undefined, selectedStatus !== "All Statuses" ? selectedStatus : undefined);
      setIsSuccessOpen(true);
    } catch (error) {
      console.error("Export CSV failed:", error);
    }
  };

  return (
    <div className="w-full flex flex-col gap-6 max-w-[1440px] mx-auto pb-8 font-sans">
      {/* Top Header */}
      <div className="w-full flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h1 className="text-2xl lg:text-3xl font-semibold text-white tracking-tight">
          Contracts
        </h1>

        <div className="flex items-center gap-3">
          <button
            onClick={handleExportPDF}
            className="h-10 px-4 bg-[#141C24] hover:bg-white/10 text-white rounded-[12px] text-xs sm:text-sm font-medium transition-all flex items-center gap-2 border border-white/5 shadow-sm cursor-pointer"
          >
            <FileText className="w-4 h-4 text-[#919191]" />
            <span>Export PDF</span>
          </button>

          <button
            onClick={handleExportCSV}
            className="h-10 px-4 bg-[#141C24] hover:bg-white/10 text-white rounded-[12px] text-xs sm:text-sm font-medium transition-all flex items-center gap-2 border border-white/5 shadow-sm cursor-pointer"
          >
            <Download className="w-4 h-4 text-[#919191]" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={() => setIsNewContractOpen(true)}
            className="h-10 px-5 bg-gradient-to-r from-[#66859E] to-[#849EB2] text-white font-medium hover:opacity-90 rounded-[12px] text-sm transition-all shadow-sm flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4 text-white" />
            <span>New Contract</span>
          </button>
        </div>
      </div>

      {/* Filter Bar Container (#394A58) */}
      <div className="w-full bg-[#394A58] border border-white/5 rounded-[12px] p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Search Input Box */}
        <div className="relative w-full sm:w-[320px]">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8C8C8C]" />
          <input
            type="text"
            placeholder="Search contracts..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full h-10 pl-10 pr-9 bg-[#141C24] border border-white/5 text-white placeholder:text-[#8C8C8C] rounded-[12px] text-sm focus:outline-none focus:border-white/20 font-sans"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery("");
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
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
          {/* Type Select Filter */}
          <div className="w-full sm:w-[180px]">
            <Select
              value={selectedType}
              onValueChange={(val: string | null) => {
                if (val) setSelectedType(val);
                setCurrentPage(1);
              }}
            >
              <SelectTrigger className="w-full h-10 bg-[#141C24] border border-white/5 text-white rounded-[12px] text-sm focus:ring-0 font-sans">
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent
                side="bottom"
                alignItemWithTrigger={false}
                className="bg-[#141C24] border-white/10 text-white font-sans"
              >
                <SelectItem value="All Types">All Types</SelectItem>
                <SelectItem value="Fixed">Fixed</SelectItem>
                <SelectItem value="Immediate">Immediate</SelectItem>
                <SelectItem value="Deferred">Deferred</SelectItem>
                <SelectItem value="Variable">Variable</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Status Select Filter */}
          <div className="w-full sm:w-[180px]">
            <Select
              value={selectedStatus}
              onValueChange={(val: string | null) => {
                if (val) setSelectedStatus(val);
                setCurrentPage(1);
              }}
            >
              <SelectTrigger className="w-full h-10 bg-[#141C24] border border-white/5 text-white rounded-[12px] text-sm focus:ring-0 font-sans">
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent
                side="bottom"
                alignItemWithTrigger={false}
                className="bg-[#141C24] border-white/10 text-white font-sans"
              >
                <SelectItem value="All Statuses">All Statuses</SelectItem>
                <SelectItem value="Active">Active</SelectItem>
                <SelectItem value="Pending">Pending</SelectItem>
                <SelectItem value="Surrendered">Surrendered</SelectItem>
                <SelectItem value="Matured">Matured</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

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
                  Value
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
                          Policy: {contract.policyNumber}
                        </div>
                      ) : null}
                    </TableCell>
                    <TableCell className="px-6 py-3.5 text-sm text-white">
                      {contract.client ? `${contract.client.firstName} ${contract.client.lastName}` : 'Unknown Client'}
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
                      description="No contracts found matching your search."
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
        onSubmitSuccess={() => setIsSuccessOpen(true)}
      />

      {/* Contract Created / Export Success Popup */}
      <SuccessModal
        isOpen={isSuccessOpen}
        onClose={() => setIsSuccessOpen(false)}
        title="Success"
        description="Operation completed successfully."
      />
    </div>
  );
}
