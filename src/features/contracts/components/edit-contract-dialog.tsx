"use client";

import { useState } from "react";
import { Calendar as CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import SearchableSelect from "@/components/ui/searchable-select";

const CLIENT_OPTIONS = [
  { label: "Jacob Thompson", value: "Jacob Thompson" },
  { label: "Eleanor Vance", value: "Eleanor Vance" },
  { label: "Marcus Brody", value: "Marcus Brody" },
  { label: "Sophia Martinez", value: "Sophia Martinez" },
  { label: "Alexander Smith", value: "Alexander Smith" },
  { label: "Charlotte Davis", value: "Charlotte Davis" },
  { label: "Benjamin Wright", value: "Benjamin Wright" },
];

interface EditContractDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitSuccess: () => void;
  contract?: {
    contractNo: string;
    client: string;
    insuranceCompany: string;
    contractType: string;
    status: string;
    premiumAmount: string;
    contractValue: string;
    beneficiaryInfo: string;
    notes: string;
    startDate?: string;
    anniversaryDate?: string;
  };
}

export default function EditContractDialog({
  isOpen,
  onClose,
  onSubmitSuccess,
  contract,
}: EditContractDialogProps) {
  const [startDate, setStartDate] = useState<Date | undefined>(
    contract?.startDate ? new Date(contract.startDate) : new Date("2020-08-04")
  );
  const [anniversaryDate, setAnniversaryDate] = useState<Date | undefined>(
    contract?.anniversaryDate ? new Date(contract.anniversaryDate) : new Date("2027-03-06")
  );

  const [formData, setFormData] = useState({
    client: contract?.client || "Jacob Thompson",
    policyNumber: contract?.contractNo || "IX-239032",
    insuranceCompany: contract?.insuranceCompany || "Equitable",
    contractType: contract?.contractType || "Immediate",
    status: contract?.status || "Surrendered",
    premiumAmount: contract?.premiumAmount || "305000",
    contractValue: contract?.contractValue || "127416",
    beneficiaryInfo: contract?.beneficiaryInfo || "Stephanie Lewis (Sibling) — 100%",
    notes: contract?.notes || "Client requested allocation rebalance after market",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onClose();
    onSubmitSuccess();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[525px] border-white/10 shadow-2xl max-h-[90vh] overflow-y-auto no-scrollbar">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-white tracking-tight">
            Edit Contract
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 font-sans py-2">
          {/* Row 1: Searchable Client Select */}
          <div className="flex flex-col gap-1.5">
            <Label className="text-xs font-medium text-white">Client</Label>
            <SearchableSelect
              options={CLIENT_OPTIONS}
              value={formData.client}
              onChange={(val) => setFormData({ ...formData, client: val })}
              placeholder="Select Client"
              searchPlaceholder="Search client..."
            />
          </div>

          {/* Row 2: Policy Number & Insurance Company */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs font-medium text-white">Policy Number</Label>
              <Input
                type="text"
                value={formData.policyNumber}
                onChange={(e) =>
                  setFormData({ ...formData, policyNumber: e.target.value })
                }
                placeholder="IX-239032"
                className="h-10 bg-[#141C24] border-0 text-white placeholder-[#919191] text-xs rounded-[12px]"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs font-medium text-white">Insurance Company</Label>
              <Select
                value={formData.insuranceCompany}
                onValueChange={(val: string | null) =>
                  setFormData({ ...formData, insuranceCompany: val || "Equitable" })
                }
              >
                <SelectTrigger className="h-10 px-3.5 bg-[#141C24] border-0 text-white rounded-[12px] text-xs font-normal w-full justify-between shadow-none">
                  <SelectValue placeholder="Equitable" />
                </SelectTrigger>
                <SelectContent className="bg-[#141C24] border border-white/10 text-white rounded-[12px]">
                  <SelectItem value="Equitable" className="text-white hover:bg-white/10 cursor-pointer text-xs">
                    Equitable
                  </SelectItem>
                  <SelectItem value="Nationwide" className="text-white hover:bg-white/10 cursor-pointer text-xs">
                    Nationwide
                  </SelectItem>
                  <SelectItem value="Jackson National" className="text-white hover:bg-white/10 cursor-pointer text-xs">
                    Jackson National
                  </SelectItem>
                  <SelectItem value="Symetra" className="text-white hover:bg-white/10 cursor-pointer text-xs">
                    Symetra
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Row 3: Contract Type & Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs font-medium text-white">Contract Type</Label>
              <Select
                value={formData.contractType}
                onValueChange={(val: string | null) =>
                  setFormData({ ...formData, contractType: val || "Immediate" })
                }
              >
                <SelectTrigger className="h-10 px-3.5 bg-[#141C24] border-0 text-white rounded-[12px] text-xs font-normal w-full justify-between shadow-none">
                  <SelectValue placeholder="Immediate" />
                </SelectTrigger>
                <SelectContent className="bg-[#141C24] border border-white/10 text-white rounded-[12px]">
                  <SelectItem value="Immediate" className="text-white hover:bg-white/10 cursor-pointer text-xs">
                    Immediate
                  </SelectItem>
                  <SelectItem value="Fixed" className="text-white hover:bg-white/10 cursor-pointer text-xs">
                    Fixed
                  </SelectItem>
                  <SelectItem value="Deferred" className="text-white hover:bg-white/10 cursor-pointer text-xs">
                    Deferred
                  </SelectItem>
                  <SelectItem value="Variable" className="text-white hover:bg-white/10 cursor-pointer text-xs">
                    Variable
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label className="text-xs font-medium text-white">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(val: string | null) =>
                  setFormData({ ...formData, status: val || "Surrendered" })
                }
              >
                <SelectTrigger className="h-10 px-3.5 bg-[#141C24] border-0 text-white rounded-[12px] text-xs font-normal w-full justify-between shadow-none">
                  <SelectValue placeholder="Surrendered" />
                </SelectTrigger>
                <SelectContent className="bg-[#141C24] border border-white/10 text-white rounded-[12px]">
                  <SelectItem value="Surrendered" className="text-white hover:bg-white/10 cursor-pointer text-xs">
                    Surrendered
                  </SelectItem>
                  <SelectItem value="Active" className="text-white hover:bg-white/10 cursor-pointer text-xs">
                    Active
                  </SelectItem>
                  <SelectItem value="Pending" className="text-white hover:bg-white/10 cursor-pointer text-xs">
                    Pending
                  </SelectItem>
                  <SelectItem value="Matured" className="text-white hover:bg-white/10 cursor-pointer text-xs">
                    Matured
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Row 4: Start Date & Anniversary Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs font-medium text-white">Start Date</Label>
              <Popover>
                <PopoverTrigger
                  render={
                    <button
                      type="button"
                      className="h-10 w-full bg-[#141C24] border-0 text-white text-xs rounded-[12px] px-3.5 flex items-center justify-between font-sans outline-none focus:ring-1 focus:ring-[#6887A0]"
                    >
                      <span className={startDate ? "text-white" : "text-[#919191]"}>
                        {startDate ? format(startDate, "MM/dd/yyyy") : "mm/dd/yyyy"}
                      </span>
                      <CalendarIcon className="w-4 h-4 text-[#919191]" />
                    </button>
                  }
                />
                <PopoverContent className="w-auto p-0 bg-[#141C24] border border-white/10 text-white rounded-[12px]">
                  <Calendar
                    mode="single"
                    selected={startDate}
                    onSelect={setStartDate}
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label className="text-xs font-medium text-white">Anniversary Date</Label>
              <Popover>
                <PopoverTrigger
                  render={
                    <button
                      type="button"
                      className="h-10 w-full bg-[#141C24] border-0 text-white text-xs rounded-[12px] px-3.5 flex items-center justify-between font-sans outline-none focus:ring-1 focus:ring-[#6887A0]"
                    >
                      <span className={anniversaryDate ? "text-white" : "text-[#919191]"}>
                        {anniversaryDate ? format(anniversaryDate, "MM/dd/yyyy") : "mm/dd/yyyy"}
                      </span>
                      <CalendarIcon className="w-4 h-4 text-[#919191]" />
                    </button>
                  }
                />
                <PopoverContent className="w-auto p-0 bg-[#141C24] border border-white/10 text-white rounded-[12px]">
                  <Calendar
                    mode="single"
                    selected={anniversaryDate}
                    onSelect={setAnniversaryDate}
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {/* Row 5: Premium Amount & Contract Value */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs font-medium text-white">Premium Amount</Label>
              <Input
                type="number"
                value={formData.premiumAmount}
                onChange={(e) =>
                  setFormData({ ...formData, premiumAmount: e.target.value })
                }
                placeholder="305000"
                className="h-10 bg-[#141C24] border-0 text-white placeholder-[#919191] text-xs rounded-[12px]"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs font-medium text-white">Contract Value</Label>
              <Input
                type="number"
                value={formData.contractValue}
                onChange={(e) =>
                  setFormData({ ...formData, contractValue: e.target.value })
                }
                placeholder="127416"
                className="h-10 bg-[#141C24] border-0 text-white placeholder-[#919191] text-xs rounded-[12px]"
              />
            </div>
          </div>

          {/* Row 6: Beneficiary Information */}
          <div className="flex flex-col gap-1.5">
            <Label className="text-xs font-medium text-white">Beneficiary Information</Label>
            <Input
              type="text"
              value={formData.beneficiaryInfo}
              onChange={(e) =>
                setFormData({ ...formData, beneficiaryInfo: e.target.value })
              }
              placeholder="Enter beneficiary details"
              className="h-10 bg-[#141C24] border-0 text-white placeholder-[#919191] text-xs rounded-[12px]"
            />
          </div>

          {/* Row 7: Notes */}
          <div className="flex flex-col gap-1.5">
            <Label className="text-xs font-medium text-white">Notes</Label>
            <textarea
              value={formData.notes}
              onChange={(e) =>
                setFormData({ ...formData, notes: e.target.value })
              }
              placeholder="Type any notes here"
              rows={3}
              className="w-full bg-[#141C24] border-0 text-white placeholder-[#919191] text-xs rounded-[12px] p-3 outline-none resize-none"
            />
          </div>

          {/* Dialog Footer Actions */}
          <DialogFooter className="pt-4 flex flex-row items-center justify-center gap-3 sm:justify-center">
            <Button
              type="button"
              variant="secondary"
              onClick={onClose}
              className="w-[140px] h-10 bg-[#2B343D] text-white hover:bg-[#394551] rounded-[12px] text-sm font-medium border-0"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="w-[150px] h-10 bg-gradient-to-r from-[#66859E] to-[#849EB2] text-white hover:opacity-90 rounded-[12px] text-sm font-medium border-0 shadow-sm"
            >
              Update Contract
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
