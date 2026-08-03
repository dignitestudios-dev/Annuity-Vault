"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
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
import { cn } from "@/lib/utils";

interface ContractItem {
  contractNo: string;
  provider: string;
  type: string;
  value: string;
  anniversary: string;
  status: string;
  statusStyle: string;
}

interface ContractsTabProps {
  contracts: ContractItem[];
}

export default function ContractsTab({ contracts }: ContractsTabProps) {
  const router = useRouter();
  const [isNewContractOpen, setIsNewContractOpen] = useState(false);
  const [isSuccessOpen, setIsSuccessOpen] = useState(false);

  return (
    <div className="w-full bg-[#141C24] border border-[#0F1F3D]/12 rounded-[12px] overflow-hidden shadow-sm">
      {/* Table Header Action Bar (#394A58) */}
      <div className="h-[65px] bg-[#394A58] px-6 flex items-center justify-between border-b border-white/10">
        <h3 className="text-lg lg:text-xl font-semibold text-white tracking-tight">
          Annuity contracts
        </h3>
        <button
          onClick={() => setIsNewContractOpen(true)}
          className="h-8 px-3.5 bg-gradient-to-r from-[#66859E] to-[#849EB2] text-white font-medium hover:opacity-90 rounded-[12px] text-xs sm:text-sm transition-all flex items-center gap-2 shadow-sm"
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
              <TableHead className="text-[#8C8C8C] font-medium text-xs sm:text-sm h-10 px-6">
                Contract #
              </TableHead>
              <TableHead className="text-[#8C8C8C] font-medium text-xs sm:text-sm h-10 px-6">
                Provider
              </TableHead>
              <TableHead className="text-[#8C8C8C] font-medium text-xs sm:text-sm h-10 px-6">
                Type
              </TableHead>
              <TableHead className="text-[#8C8C8C] font-medium text-xs sm:text-sm h-10 px-6">
                Value
              </TableHead>
              <TableHead className="text-[#8C8C8C] font-medium text-xs sm:text-sm h-10 px-6">
                Anniversary
              </TableHead>
              <TableHead className="text-[#8C8C8C] font-medium text-xs sm:text-sm h-10 px-6">
                Status
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {contracts.map((contract) => (
              <TableRow
                key={contract.contractNo}
                onClick={() => router.push(`/dashboard/contracts/${contract.contractNo}`)}
                className="border-b border-white/10 hover:bg-white/[0.02] transition-colors h-14 cursor-pointer"
              >
                <TableCell className="px-6 py-3.5 text-sm font-medium text-white">
                  {contract.contractNo}
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

      {/* New Contract Modal */}
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
