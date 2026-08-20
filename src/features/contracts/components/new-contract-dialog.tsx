"use client";

import { useState, useEffect } from "react";
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

import { useCreateContract } from "@/features/contracts/api/contracts.service";
import { useClients } from "@/features/clients/api/clients.service";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import toast from "react-hot-toast";

const newContractSchema = z.object({
  client: z.string().min(1, "Client is required"),
  policyNumber: z.string().min(1, "Policy Number is required").max(50, "Policy Number must be less than 50 characters"),
  insuranceCompany: z.string().min(1, "Insurance Company is required").max(100, "Insurance Company must be less than 100 characters"),
  contractType: z.string().min(1, "Contract Type is required").max(50, "Contract Type must be less than 50 characters"),
  status: z.string().min(1, "Status is required").max(50, "Status must be less than 50 characters"),
  startDate: z.date({ message: "Start Date is required" }),
  anniversaryDate: z.date({ message: "Anniversary Date is required" }),
  premiumAmount: z.string().min(1, "Premium Amount is required").max(20, "Premium Amount must be less than 20 characters"),
  contractValue: z.string().min(1, "Contract Value is required").max(20, "Contract Value must be less than 20 characters"),
  beneficiaryInfo: z.string().max(200, "Beneficiary Info must be less than 200 characters").optional().or(z.literal("")),
  notes: z.string().max(500, "Notes must be less than 500 characters").optional().or(z.literal("")),
});

type NewContractFormData = z.infer<typeof newContractSchema>;

interface NewContractDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitSuccess: () => void;
  defaultClient?: string;
}

export default function NewContractDialog({
  isOpen,
  onClose,
  onSubmitSuccess,
  defaultClient,
}: NewContractDialogProps) {
  const { data: clientsData } = useClients({ limit: 100 });
  const clientOptions = clientsData?.data?.map(client => ({
    label: `${client.firstName} ${client.lastName}`,
    value: client._id || client.id
  })) || [];

  const createContract = useCreateContract();

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<NewContractFormData>({
    resolver: zodResolver(newContractSchema),
    defaultValues: {
      client: defaultClient || "",
      policyNumber: "",
      insuranceCompany: "Nationwide",
      contractType: "Fixed",
      status: "Active",
      premiumAmount: "",
      contractValue: "",
      beneficiaryInfo: "",
      notes: "",
      startDate: new Date(),
      anniversaryDate: new Date(),
    },
  });

  useEffect(() => {
    if (isOpen) {
      reset({
        client: defaultClient || "",
        policyNumber: "",
        insuranceCompany: "Nationwide",
        contractType: "Fixed",
        status: "Active",
        premiumAmount: "",
        contractValue: "",
        beneficiaryInfo: "",
        notes: "",
        startDate: new Date(),
        anniversaryDate: new Date(),
      });
    }
  }, [isOpen, defaultClient, reset]);

  const onSubmit = (data: NewContractFormData) => {
    createContract.mutate({
      client: data.client,
      policyNumber: data.policyNumber,
      provider: data.insuranceCompany,
      contractType: data.contractType,
      status: data.status,
      premiumAmount: Number(data.premiumAmount) || 0,
      contractValue: Number(data.contractValue) || 0,
      beneficiaryInformation: data.beneficiaryInfo,
      notes: data.notes,
      startDate: data.startDate ? data.startDate.toISOString() : undefined,
      anniversaryDate: data.anniversaryDate ? data.anniversaryDate.toISOString() : undefined,
    }, {
      onSuccess: () => {
        toast.success("Contract created successfully!");
        reset();
        onClose();
        onSubmitSuccess();
      }
    });
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-[525px] border-white/10 shadow-2xl max-h-[90vh] overflow-y-auto no-scrollbar">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-white tracking-tight">
            New Contract
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4 font-sans py-2" noValidate>
          {/* Row 1: Searchable Client Select */}
          <div className="flex flex-col gap-1.5">
            <Label className="text-xs font-medium text-white">Client <span className="text-destructive">*</span></Label>
            <Controller
              name="client"
              control={control}
              render={({ field }) => (
                <div className={errors.client ? "rounded-xl ring-1 ring-[#FF3E46]" : ""}>
                  <SearchableSelect
                    options={clientOptions}
                    value={field.value}
                    onChange={field.onChange}
                    placeholder="Select Client"
                    searchPlaceholder="Search client..."
                  />
                </div>
              )}
            />
            {errors.client && <p className="text-[11px] font-medium text-[#FF3E46] mt-0.5">{errors.client.message}</p>}
          </div>

          {/* Row 2: Policy Number & Insurance Company */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs font-medium text-white">Policy Number <span className="text-destructive">*</span></Label>
              <Input
                type="text"
                {...register("policyNumber")}
                placeholder="Policy Number"
                className={`h-10 bg-[#141C24] border-0 text-white placeholder-[#919191] text-xs rounded-[12px] focus-visible:ring-1 focus-visible:ring-[#6887A0] ${errors.policyNumber ? "ring-1 ring-[#FF3E46]" : ""}`}
              />
              {errors.policyNumber && <p className="text-[11px] font-medium text-[#FF3E46] mt-0.5">{errors.policyNumber.message}</p>}
            </div>
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs font-medium text-white">Insurance Company <span className="text-destructive">*</span></Label>
              <Controller
                name="insuranceCompany"
                control={control}
                render={({ field }) => (
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                  >
                    <SelectTrigger className={`h-10 px-3.5 bg-[#141C24] border-0 text-white rounded-[12px] text-xs font-normal w-full justify-between shadow-none focus:ring-1 focus:ring-[#6887A0] ${errors.insuranceCompany ? "ring-1 ring-[#FF3E46]" : ""}`}>
                      <SelectValue placeholder="Nationwide" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#141C24] border border-white/10 text-white rounded-[12px]">
                      <SelectItem value="Nationwide" className="text-white hover:bg-white/10 cursor-pointer text-xs">
                        Nationwide
                      </SelectItem>
                      <SelectItem value="Equitable" className="text-white hover:bg-white/10 cursor-pointer text-xs">
                        Equitable
                      </SelectItem>
                      <SelectItem value="Jackson National" className="text-white hover:bg-white/10 cursor-pointer text-xs">
                        Jackson National
                      </SelectItem>
                      <SelectItem value="Symetra" className="text-white hover:bg-white/10 cursor-pointer text-xs">
                        Symetra
                      </SelectItem>
                      <SelectItem value="Athene" className="text-white hover:bg-white/10 cursor-pointer text-xs">
                        Athene
                      </SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.insuranceCompany && <p className="text-[11px] font-medium text-[#FF3E46] mt-0.5">{errors.insuranceCompany.message}</p>}
            </div>
          </div>

          {/* Row 3: Contract Type & Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs font-medium text-white">Contract Type <span className="text-destructive">*</span></Label>
              <Controller
                name="contractType"
                control={control}
                render={({ field }) => (
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                  >
                    <SelectTrigger className={`h-10 px-3.5 bg-[#141C24] border-0 text-white rounded-[12px] text-xs font-normal w-full justify-between shadow-none focus:ring-1 focus:ring-[#6887A0] ${errors.contractType ? "ring-1 ring-[#FF3E46]" : ""}`}>
                      <SelectValue placeholder="Fixed" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#141C24] border border-white/10 text-white rounded-[12px]">
                      <SelectItem value="Fixed" className="text-white hover:bg-white/10 cursor-pointer text-xs">
                        Fixed
                      </SelectItem>
                      <SelectItem value="Immediate" className="text-white hover:bg-white/10 cursor-pointer text-xs">
                        Immediate
                      </SelectItem>
                      <SelectItem value="Deferred" className="text-white hover:bg-white/10 cursor-pointer text-xs">
                        Deferred
                      </SelectItem>
                      <SelectItem value="Variable" className="text-white hover:bg-white/10 cursor-pointer text-xs">
                        Variable
                      </SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.contractType && <p className="text-[11px] font-medium text-[#FF3E46] mt-0.5">{errors.contractType.message}</p>}
            </div>

            <div className="flex flex-col gap-1.5">
              <Label className="text-xs font-medium text-white">Status <span className="text-destructive">*</span></Label>
              <Controller
                name="status"
                control={control}
                render={({ field }) => (
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                  >
                    <SelectTrigger className={`h-10 px-3.5 bg-[#141C24] border-0 text-white rounded-[12px] text-xs font-normal w-full justify-between shadow-none focus:ring-1 focus:ring-[#6887A0] ${errors.status ? "ring-1 ring-[#FF3E46]" : ""}`}>
                      <SelectValue placeholder="Active" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#141C24] border border-white/10 text-white rounded-[12px]">
                      <SelectItem value="Active" className="text-white hover:bg-white/10 cursor-pointer text-xs">
                        Active
                      </SelectItem>
                      <SelectItem value="Pending" className="text-white hover:bg-white/10 cursor-pointer text-xs">
                        Pending
                      </SelectItem>
                      <SelectItem value="Surrendered" className="text-white hover:bg-white/10 cursor-pointer text-xs">
                        Surrendered
                      </SelectItem>
                      <SelectItem value="Matured" className="text-white hover:bg-white/10 cursor-pointer text-xs">
                        Matured
                      </SelectItem>
                      <SelectItem value="Inactive" className="text-white hover:bg-white/10 cursor-pointer text-xs">
                        Inactive
                      </SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.status && <p className="text-[11px] font-medium text-[#FF3E46] mt-0.5">{errors.status.message}</p>}
            </div>
          </div>

          {/* Row 4: Start Date & Anniversary Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {/* Start Date */}
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs font-medium text-white">Start Date <span className="text-destructive">*</span></Label>
              <Controller
                name="startDate"
                control={control}
                render={({ field }) => (
                  <Popover>
                    <PopoverTrigger
                      render={
                        <button
                          type="button"
                          className="h-10 w-full bg-[#141C24] border-0 text-white text-xs rounded-[12px] px-3.5 flex items-center justify-between font-sans outline-none focus:ring-1 focus:ring-[#6887A0]"
                        >
                          <span className={field.value ? "text-white" : "text-[#919191]"}>
                            {field.value ? format(field.value, "MM/dd/yyyy") : "mm/dd/yyyy"}
                          </span>
                          <CalendarIcon className="w-4 h-4 text-[#919191]" />
                        </button>
                      }
                    />
                    <PopoverContent className="w-auto p-0 bg-[#141C24] border border-white/10 text-white rounded-[12px]">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                      />
                    </PopoverContent>
                  </Popover>
                )}
              />
              {errors.startDate && <p className="text-[11px] font-medium text-[#FF3E46] mt-0.5">{errors.startDate.message}</p>}
            </div>

            {/* Anniversary Date */}
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs font-medium text-white">Anniversary Date <span className="text-destructive">*</span></Label>
              <Controller
                name="anniversaryDate"
                control={control}
                render={({ field }) => (
                  <Popover>
                    <PopoverTrigger
                      render={
                        <button
                          type="button"
                          className="h-10 w-full bg-[#141C24] border-0 text-white text-xs rounded-[12px] px-3.5 flex items-center justify-between font-sans outline-none focus:ring-1 focus:ring-[#6887A0]"
                        >
                          <span className={field.value ? "text-white" : "text-[#919191]"}>
                            {field.value ? format(field.value, "MM/dd/yyyy") : "mm/dd/yyyy"}
                          </span>
                          <CalendarIcon className="w-4 h-4 text-[#919191]" />
                        </button>
                      }
                    />
                    <PopoverContent className="w-auto p-0 bg-[#141C24] border border-white/10 text-white rounded-[12px]">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                      />
                    </PopoverContent>
                  </Popover>
                )}
              />
              {errors.anniversaryDate && <p className="text-[11px] font-medium text-[#FF3E46] mt-0.5">{errors.anniversaryDate.message}</p>}
            </div>
          </div>

          {/* Row 5: Premium Amount & Contract Value */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs font-medium text-white">Premium Amount <span className="text-destructive">*</span></Label>
              <Input
                type="number"
                {...register("premiumAmount")}
                placeholder="100000"
                className={`h-10 bg-[#141C24] border-0 text-white placeholder-[#919191] text-xs rounded-[12px] focus-visible:ring-1 focus-visible:ring-[#6887A0] ${errors.premiumAmount ? "ring-1 ring-[#FF3E46]" : ""}`}
              />
              {errors.premiumAmount && <p className="text-[11px] font-medium text-[#FF3E46] mt-0.5">{errors.premiumAmount.message}</p>}
            </div>
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs font-medium text-white">Contract Value <span className="text-destructive">*</span></Label>
              <Input
                type="number"
                {...register("contractValue")}
                placeholder="100000"
                className={`h-10 bg-[#141C24] border-0 text-white placeholder-[#919191] text-xs rounded-[12px] focus-visible:ring-1 focus-visible:ring-[#6887A0] ${errors.contractValue ? "ring-1 ring-[#FF3E46]" : ""}`}
              />
              {errors.contractValue && <p className="text-[11px] font-medium text-[#FF3E46] mt-0.5">{errors.contractValue.message}</p>}
            </div>
          </div>

          {/* Row 6: Beneficiary Information */}
          <div className="flex flex-col gap-1.5">
            <Label className="text-xs font-medium text-white">Beneficiary Information</Label>
            <Input
              type="text"
              {...register("beneficiaryInfo")}
              placeholder="Enter beneficiary details"
              className={`h-10 bg-[#141C24] border-0 text-white placeholder-[#919191] text-xs rounded-[12px] focus-visible:ring-1 focus-visible:ring-[#6887A0] ${errors.beneficiaryInfo ? "ring-1 ring-[#FF3E46]" : ""}`}
            />
            {errors.beneficiaryInfo && <p className="text-[11px] font-medium text-[#FF3E46] mt-0.5">{errors.beneficiaryInfo.message}</p>}
          </div>

          {/* Row 7: Notes */}
          <div className="flex flex-col gap-1.5">
            <Label className="text-xs font-medium text-white">Notes</Label>
            <textarea
              {...register("notes")}
              placeholder="Type any notes here"
              rows={3}
              className={`w-full bg-[#141C24] border-0 text-white placeholder-[#919191] text-xs rounded-[12px] p-3 outline-none resize-none focus-visible:ring-1 focus-visible:ring-[#6887A0] ${errors.notes ? "ring-1 ring-[#FF3E46]" : ""}`}
            />
            {errors.notes && <p className="text-[11px] font-medium text-[#FF3E46] mt-0.5">{errors.notes.message}</p>}
          </div>

          {/* Dialog Footer Actions */}
          <DialogFooter className="pt-4 flex flex-row items-center justify-center gap-3 sm:justify-center">
            <Button
              type="button"
              variant="secondary"
              onClick={handleClose}
              className="w-[140px] h-10 bg-[#2B343D] text-white hover:bg-[#394551] rounded-[12px] text-sm font-medium border-0"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="w-[150px] h-10 bg-gradient-to-r from-[#66859E] to-[#849EB2] text-white hover:opacity-90 rounded-[12px] text-sm font-medium border-0 shadow-sm"
              disabled={createContract.isPending}
            >
              {createContract.isPending ? "Creating..." : "Create Contract"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
