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
    type: "Indexed",
    value: "$165,258",
    anniversary: "2026-05-14 (-41d)",
    status: "Active",
    statusStyle: "bg-[#42CD7F] text-white border-0",
  },
  {
    contractNo: "IX-478706",
    client: "Charles Jackson",
    provider: "Equitable",
    type: "Indexed",
    value: "$653,243",
    anniversary: "2026-06-07 (-17d)",
    status: "Active",
    statusStyle: "bg-[#42CD7F] text-white border-0",
  },
  {
    contractNo: "AN-697414",
    client: "Jeffrey Adams",
    provider: "Lincoln Financial",
    type: "Deferred",
    value: "$222,863",
    anniversary: "2026-10-03 (101d)",
    status: "Surrendered",
    statusStyle: "bg-[#FF3E46] text-white border-0",
  },
  {
    contractNo: "IX-139314",
    client: "Jennifer Robinson",
    provider: "Jackson National",
    type: "Fixed",
    value: "$423,021",
    anniversary: "2026-09-09 (77d)",
    status: "Active",
    statusStyle: "bg-[#42CD7F] text-white border-0",
  },
  {
    contractNo: "AN-818202",
    client: "Andrew Wilson",
    provider: "Symetra",
    type: "Indexed",
    value: "$481,912",
    anniversary: "2026-10-17 (115d)",
    status: "Pending",
    statusStyle: "bg-[#FFE600] text-black border-0 font-semibold",
  },
];

export default function ContractsPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [providerFilter, setProviderFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const [isNewContractOpen, setIsNewContractOpen] = useState(false);
  const [isSuccessOpen, setIsSuccessOpen] = useState(false);

  const filteredContracts = CONTRACTS_LIST.filter((contract) => {
    const matchesSearch =
      contract.contractNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contract.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contract.provider.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesProvider =
      providerFilter === "all" || contract.provider === providerFilter;
    const matchesType =
      typeFilter === "all" || contract.type === typeFilter;
    const matchesStatus =
      statusFilter === "all" || contract.status === statusFilter;

    return matchesSearch && matchesProvider && matchesType && matchesStatus;
  });

  return (
    <div className="w-full flex flex-col gap-6 max-w-[1440px] mx-auto pb-12 font-sans">
      {/* Top Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl lg:text-[32px] font-semibold text-white tracking-tight leading-tight">
          Contracts
        </h1>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          <button className="h-9 px-4 bg-[#141C24] border border-white/10 text-white rounded-[12px] text-xs font-medium hover:bg-white/5 transition-colors">
            Export PDF
          </button>
          <button className="h-9 px-4 bg-[#141C24] border border-white/10 text-white rounded-[12px] text-xs font-medium hover:bg-white/5 transition-colors">
            Export CSV
          </button>
          <button
            onClick={() => setIsNewContractOpen(true)}
            className="h-9 px-4 bg-gradient-to-r from-[#66859E] to-[#849EB2] text-white hover:opacity-90 rounded-[12px] text-xs font-medium transition-all flex items-center gap-2 shadow-sm"
          >
            <Plus className="w-3.5 h-3.5 text-white" />
            <span>New Contract</span>
          </button>
        </div>
      </div>

      {/* Filter & Search Bar (#394A58) */}
      <div className="w-full bg-[#394A58] p-3 rounded-[12px] flex flex-wrap items-center justify-between gap-3 shadow-sm">
        {/* Left Search Bar */}
        <div className="flex items-center gap-2.5 px-3.5 h-10 bg-[#141C24] rounded-[12px] border-0 text-white text-xs w-full max-w-[400px]">
          <Search className="w-4 h-4 text-[#919191] flex-shrink-0" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search..."
            className="w-full bg-transparent text-xs text-white placeholder-[#919191] outline-none"
          />
        </div>

        {/* Right Filter Dropdowns */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Provider Filter */}
          <Select value={providerFilter} onValueChange={(val: string | null) => setProviderFilter(val || "all")}>
            <SelectTrigger className="h-10 px-3.5 bg-[#141C24] border-0 text-white rounded-[12px] text-xs font-normal min-w-[140px] justify-between shadow-none">
              <SelectValue placeholder="All providers" />
            </SelectTrigger>
            <SelectContent className="bg-[#141C24] border border-white/10 text-white rounded-[12px]">
              <SelectItem value="all" className="text-white hover:bg-white/10 cursor-pointer text-xs">
                All providers
              </SelectItem>
              <SelectItem value="Equitable" className="text-white hover:bg-white/10 cursor-pointer text-xs">
                Equitable
              </SelectItem>
              <SelectItem value="MassMutual" className="text-white hover:bg-white/10 cursor-pointer text-xs">
                MassMutual
              </SelectItem>
              <SelectItem value="Allianz Life" className="text-white hover:bg-white/10 cursor-pointer text-xs">
                Allianz Life
              </SelectItem>
              <SelectItem value="Pacific Life" className="text-white hover:bg-white/10 cursor-pointer text-xs">
                Pacific Life
              </SelectItem>
              <SelectItem value="Prudential" className="text-white hover:bg-white/10 cursor-pointer text-xs">
                Prudential
              </SelectItem>
            </SelectContent>
          </Select>

          {/* Type Filter */}
          <Select value={typeFilter} onValueChange={(val: string | null) => setTypeFilter(val || "all")}>
            <SelectTrigger className="h-10 px-3.5 bg-[#141C24] border-0 text-white rounded-[12px] text-xs font-normal min-w-[120px] justify-between shadow-none">
              <SelectValue placeholder="All types" />
            </SelectTrigger>
            <SelectContent className="bg-[#141C24] border border-white/10 text-white rounded-[12px]">
              <SelectItem value="all" className="text-white hover:bg-white/10 cursor-pointer text-xs">
                All types
              </SelectItem>
              <SelectItem value="Immediate" className="text-white hover:bg-white/10 cursor-pointer text-xs">
                Immediate
              </SelectItem>
              <SelectItem value="Indexed" className="text-white hover:bg-white/10 cursor-pointer text-xs">
                Indexed
              </SelectItem>
              <SelectItem value="Fixed" className="text-white hover:bg-white/10 cursor-pointer text-xs">
                Fixed
              </SelectItem>
              <SelectItem value="Deferred" className="text-white hover:bg-white/10 cursor-pointer text-xs">
                Deferred
              </SelectItem>
            </SelectContent>
          </Select>

          {/* Status Filter */}
          <Select value={statusFilter} onValueChange={(val: string | null) => setStatusFilter(val || "all")}>
            <SelectTrigger className="h-10 px-3.5 bg-[#141C24] border-0 text-white rounded-[12px] text-xs font-normal min-w-[130px] justify-between shadow-none">
              <SelectValue placeholder="All statuses" />
            </SelectTrigger>
            <SelectContent className="bg-[#141C24] border border-white/10 text-white rounded-[12px]">
              <SelectItem value="all" className="text-white hover:bg-white/10 cursor-pointer text-xs">
                All statuses
              </SelectItem>
              <SelectItem value="Active" className="text-white hover:bg-white/10 cursor-pointer text-xs">
                Active
              </SelectItem>
              <SelectItem value="Surrendered" className="text-white hover:bg-white/10 cursor-pointer text-xs">
                Surrendered
              </SelectItem>
              <SelectItem value="Matured" className="text-white hover:bg-white/10 cursor-pointer text-xs">
                Matured
              </SelectItem>
              <SelectItem value="Pending" className="text-white hover:bg-white/10 cursor-pointer text-xs">
                Pending
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Contracts Table */}
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
              {filteredContracts.map((contract) => (
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
              ))}
            </TableBody>
          </Table>
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
