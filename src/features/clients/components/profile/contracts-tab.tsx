"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, FileText } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/shared/empty-state";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import NewContractDialog from "@/features/contracts/components/new-contract-dialog";
import SuccessModal from "@/components/shared/success-modal";
import TablePagination from "@/components/shared/table-pagination";
import { cn } from "@/lib/utils";

interface ContractItem {
  id: string;
  contractNo: string;
  provider: string;
  type: string;
  value: string;
  anniversary: string;
  status: string;
  statusStyle: string;
}

interface ContractsTabProps {
  clientId?: string;
  contracts: ContractItem[];
  isLoading?: boolean;
}

export default function ContractsTab({ clientId, contracts = [], isLoading = false }: ContractsTabProps) {
  const router = useRouter();
  const [isNewContractOpen, setIsNewContractOpen] = useState(false);
  const [isSuccessOpen, setIsSuccessOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  const safeContracts = Array.isArray(contracts) ? contracts : [];
  const totalPages = Math.ceil(safeContracts.length / itemsPerPage);
  const paginatedContracts = safeContracts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  if (isLoading) {
    return (
      <div className="w-full bg-[#141C24] border border-[#0F1F3D]/12 rounded-[12px] overflow-hidden shadow-sm flex flex-col">
        <div className="h-[65px] bg-[#394A58] px-6 flex items-center justify-between border-b border-white/10">
          <div className="w-[180px] h-6 bg-[#4A5D6E] animate-pulse rounded-[6px]"></div>
          <div className="w-[130px] h-8 bg-[#4A5D6E] animate-pulse rounded-[12px]"></div>
        </div>
        <div className="flex flex-col w-full">
          <div className="h-10 border-b border-white/10 w-full px-6 flex items-center gap-6">
            <div className="w-24 h-4 bg-[#192430] animate-pulse rounded-[4px]"></div>
            <div className="w-24 h-4 bg-[#192430] animate-pulse rounded-[4px]"></div>
            <div className="w-24 h-4 bg-[#192430] animate-pulse rounded-[4px]"></div>
            <div className="w-24 h-4 bg-[#192430] animate-pulse rounded-[4px]"></div>
          </div>
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-14 border-b border-white/10 w-full px-6 flex items-center gap-6">
              <div className="w-full h-5 bg-[#192430] animate-pulse rounded-[6px]"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-[#141C24] border border-[#0F1F3D]/12 rounded-[12px] overflow-hidden shadow-sm flex flex-col justify-between">
      {/* Table Header Action Bar (#394A58) */}
      <div className="h-[65px] bg-[#394A58] px-6 flex items-center justify-between border-b border-white/10">
        <h3 className="text-lg lg:text-xl font-semibold text-white tracking-tight font-sans">
          Annuity contracts
        </h3>
        <button
          onClick={() => setIsNewContractOpen(true)}
          className="h-8 px-3.5 bg-gradient-to-r from-[#66859E] to-[#849EB2] text-white font-medium hover:opacity-90 rounded-[12px] text-xs sm:text-sm transition-all flex items-center gap-2 shadow-sm cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5 text-white" />
          <span>Add contract</span>
        </button>
      </div>

      {/* Contracts Table */}
      <div className="overflow-x-auto w-full">
        <Table className="w-full">
          <TableHeader className="bg-transparent border-b border-white/10">
            <TableRow className="border-b border-white/10 hover:bg-transparent h-10">
              <TableHead className="text-[#8C8C8C] font-medium text-xs sm:text-sm h-10 px-6 font-sans">
                Contract #
              </TableHead>
              <TableHead className="text-[#8C8C8C] font-medium text-xs sm:text-sm h-10 px-6 font-sans">
                Provider
              </TableHead>
              <TableHead className="text-[#8C8C8C] font-medium text-xs sm:text-sm h-10 px-6 font-sans">
                Type
              </TableHead>
              <TableHead className="text-[#8C8C8C] font-medium text-xs sm:text-sm h-10 px-6 font-sans">
                Value
              </TableHead>
              <TableHead className="text-[#8C8C8C] font-medium text-xs sm:text-sm h-10 px-6 font-sans">
                Anniversary
              </TableHead>
              <TableHead className="text-[#8C8C8C] font-medium text-xs sm:text-sm h-10 px-6 font-sans">
                Status
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedContracts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="py-12">
                  <EmptyState 
                    icon={FileText}
                    title="No contracts found"
                    className="py-6 border-0 bg-transparent min-h-0"
                  />
                </TableCell>
              </TableRow>
            ) : (
              paginatedContracts.map((contract) => (
                <TableRow
                  key={contract.id}
                  onClick={() => router.push(`/dashboard/contracts/${contract.id}`)}
                  className="border-b border-white/10 hover:bg-white/[0.02] transition-colors h-14 cursor-pointer"
                >
                  <TableCell className="px-6 py-3.5 text-sm font-medium text-white font-sans">
                    {contract.contractNo}
                  </TableCell>
                  <TableCell className="px-6 py-3.5 text-sm text-white font-sans">
                    {contract.provider}
                  </TableCell>
                  <TableCell className="px-6 py-3.5 text-sm text-white font-sans">
                    {contract.type}
                  </TableCell>
                  <TableCell className="px-6 py-3.5 text-sm text-white font-sans">
                    {contract.value}
                  </TableCell>
                  <TableCell className="px-6 py-3.5 text-sm text-white font-sans">
                    {contract.anniversary}
                  </TableCell>
                  <TableCell className="px-6 py-3.5">
                    <Badge
                      className={cn(
                        "px-2.5 py-0.5 rounded-[8px] text-xs font-medium capitalize font-sans",
                        contract.statusStyle
                      )}
                    >
                      {contract.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Reusable Pagination */}
      <div className="px-6 pb-4 pt-2">
        <TablePagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          totalItems={contracts.length}
          itemsPerPage={itemsPerPage}
          itemLabel="contracts"
        />
      </div>

      {/* New Contract Modal */}
      <NewContractDialog
        isOpen={isNewContractOpen}
        onClose={() => setIsNewContractOpen(false)}
        onSubmitSuccess={() => setIsSuccessOpen(true)}
        defaultClient={clientId}
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
