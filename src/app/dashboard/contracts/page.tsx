"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Search } from "lucide-react";
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
import { cn } from "@/lib/utils";

const CONTRACTS_LIST = [
  {
    contractNo: "IX-239032",
    client: "Jacob Thompson",
    provider: "Equitable",
    type: "Immediate",
    value: "$205,617",
    anniversary: "2026-08-25 (62d)",
    status: "Surrendered",
    statusStyle: "bg-[#FF3E46] text-white border-0",
  },
  {
    contractNo: "IX-842169",
    client: "Jeffrey Clark",
    provider: "MassMutual",
    type: "Immediate",
    value: "$318,599",
    anniversary: "2026-11-20 (149d)",
    status: "Active",
    statusStyle: "bg-[#42CD7F] text-white border-0",
  },
  {
    contractNo: "IM-742846",
    client: "Jerry Anderson",
    provider: "Allianz Life",
    type: "Indexed",
    value: "$126,597",
    anniversary: "2026-12-19 (178d)",
    status: "Matured",
    statusStyle: "bg-[#39BDF6] text-white border-0",
  },
  {
    contractNo: "IM-310621",
    client: "George Nguyen",
    provider: "MassMutual",
    type: "Fixed",
    value: "$375,788",
    anniversary: "2027-03-13 (262d)",
    status: "Surrendered",
    statusStyle: "bg-[#FF3E46] text-white border-0",
  },
  {
    contractNo: "IX-815811",
    client: "Steven Jackson",
    provider: "Pacific Life",
    type: "Immediate",
    value: "$252,648",
    anniversary: "2027-04-03 (283d)",
    status: "Active",
    statusStyle: "bg-[#42CD7F] text-white border-0",
  },
  {
    contractNo: "VR-357824",
    client: "Joseph Mitchell",
    provider: "New York Life",
    type: "Fixed",
    value: "$484,208",
    anniversary: "2026-11-17 (146d)",
    status: "Active",
    statusStyle: "bg-[#42CD7F] text-white border-0",
  },
  {
    contractNo: "IM-531720",
    client: "Sandra Thompson",
    provider: "Prudential",
    type: "Indexed",
    value: "$252,917",
    anniversary: "2026-10-25 (123d)",
    status: "Pending",
    statusStyle: "bg-[#FFE600] text-black border-0 font-semibold",
  },
  {
    contractNo: "FX-289078",
    client: "Justin Williams",
    provider: "Prudential",
    type: "Fixed",
    value: "$198,400",
    anniversary: "2026-09-14 (82d)",
    status: "Active",
    statusStyle: "bg-[#42CD7F] text-white border-0",
  },
  {
    contractNo: "AN-491024",
    client: "Emma Robinson",
    provider: "Lincoln Financial",
    type: "Indexed",
    value: "$412,000",
    anniversary: "2026-10-01 (99d)",
    status: "Active",
    statusStyle: "bg-[#42CD7F] text-white border-0",
  },
  {
    contractNo: "IX-908123",
    client: "Cynthia Lee",
    provider: "Jackson National",
    type: "Immediate",
    value: "$289,350",
    anniversary: "2026-12-05 (164d)",
    status: "Pending",
    statusStyle: "bg-[#FFE600] text-black border-0 font-semibold",
  },
  {
    contractNo: "VR-671290",
    client: "David Brooks",
    provider: "Allianz Life",
    type: "Fixed",
    value: "$530,100",
    anniversary: "2027-01-20 (210d)",
    status: "Active",
    statusStyle: "bg-[#42CD7F] text-white border-0",
  },
  {
    contractNo: "IM-823411",
    client: "Samantha Nguyen",
    provider: "MassMutual",
    type: "Indexed",
    value: "$340,750",
    anniversary: "2027-02-15 (236d)",
    status: "Matured",
    statusStyle: "bg-[#39BDF6] text-white border-0",
  },
];

export default function ContractsPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState("All Types");
  const [selectedStatus, setSelectedStatus] = useState("All Statuses");
  const [isNewContractOpen, setIsNewContractOpen] = useState(false);
  const [isSuccessOpen, setIsSuccessOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 7;

  const filteredContracts = CONTRACTS_LIST.filter((contract) => {
    const matchesSearch =
      contract.contractNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contract.client.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contract.provider.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesType =
      selectedType === "All Types" || contract.type === selectedType;

    const matchesStatus =
      selectedStatus === "All Statuses" || contract.status === selectedStatus;

    return matchesSearch && matchesType && matchesStatus;
  });

  const totalPages = Math.ceil(filteredContracts.length / itemsPerPage);
  const paginatedContracts = filteredContracts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="w-full flex flex-col gap-6 max-w-[1440px] mx-auto pb-8 font-sans">
      {/* Top Header */}
      <div className="w-full flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h1 className="text-2xl lg:text-3xl font-semibold text-white tracking-tight">
          Contracts
        </h1>

        <button
          onClick={() => setIsNewContractOpen(true)}
          className="h-10 px-5 bg-gradient-to-r from-[#66859E] to-[#849EB2] text-white font-medium hover:opacity-90 rounded-[12px] text-sm transition-all shadow-sm flex items-center gap-2 cursor-pointer"
        >
          <Plus className="w-4 h-4 text-white" />
          <span>New Contract</span>
        </button>
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
            className="w-full h-10 pl-10 pr-4 bg-[#141C24] border border-white/5 text-white placeholder:text-[#8C8C8C] rounded-[12px] text-sm focus:outline-none focus:border-white/20 font-sans"
          />
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
                <SelectItem value="Indexed">Indexed</SelectItem>
                <SelectItem value="Immediate">Immediate</SelectItem>
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
                <SelectItem value="Matured">Matured</SelectItem>
                <SelectItem value="Surrendered">Surrendered</SelectItem>
                <SelectItem value="Pending">Pending</SelectItem>
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
              {paginatedContracts.length > 0 ? (
                paginatedContracts.map((contract) => (
                  <TableRow
                    key={contract.contractNo}
                    onClick={() =>
                      router.push(`/dashboard/contracts/${contract.contractNo}`)
                    }
                    className="border-b border-white/10 hover:bg-white/[0.02] transition-colors h-14 cursor-pointer"
                  >
                    <TableCell className="px-6 py-3.5 text-sm font-medium text-white">
                      {contract.contractNo}
                    </TableCell>
                    <TableCell className="px-6 py-3.5 text-sm text-white">
                      {contract.client}
                    </TableCell>
                    <TableCell className="px-6 py-3.5 text-sm text-white">
                      {contract.provider}
                    </TableCell>
                    <TableCell className="px-6 py-3.5 text-sm text-white">
                      {contract.type}
                    </TableCell>
                    <TableCell className="px-6 py-3.5 text-sm text-white">
                      {contract.value}
                    </TableCell>
                    <TableCell className="px-6 py-3.5 text-sm text-white">
                      {contract.anniversary}
                    </TableCell>
                    <TableCell className="px-6 py-3.5">
                      <Badge
                        className={cn(
                          "px-2.5 py-0.5 rounded-[8px] text-xs font-medium capitalize",
                          contract.statusStyle
                        )}
                      >
                        {contract.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="h-32 text-center text-sm text-[#919191] font-sans"
                  >
                    No contracts found matching your search.
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
            totalItems={filteredContracts.length}
            itemsPerPage={itemsPerPage}
          />
        </div>
      </div>

      {/* New Contract Dialog */}
      <NewContractDialog
        isOpen={isNewContractOpen}
        onClose={() => setIsNewContractOpen(false)}
        onSubmitSuccess={() => setIsSuccessOpen(true)}
      />

      {/* Contract Created Success Popup */}
      <SuccessModal
        isOpen={isSuccessOpen}
        onClose={() => setIsSuccessOpen(false)}
        title="Contract created!"
        description="You have successfully created new contract!"
      />
    </div>
  );
}
