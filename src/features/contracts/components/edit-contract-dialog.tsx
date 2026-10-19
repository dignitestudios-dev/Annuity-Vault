"use client";

import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { Calendar as CalendarIcon, AlertTriangle, X } from "lucide-react";
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
import DatePickerInput, { parseDateSafe } from "@/components/ui/date-picker-input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import SearchableSelect from "@/components/ui/searchable-select";
import InsuranceCompanyCombobox from "./insurance-company-combobox";

import { useUpdateContract } from "@/features/contracts/api/contracts.service";
import { useClients } from "@/features/clients/api/clients.service";
import { Contract, UpdateContractDTO } from "@/features/contracts/types/contracts.types";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import toast from "react-hot-toast";

const PRIMARY_CONTRACT_TYPES = [
  "FIA",
  "MYGA",
  "VA",
  "RILA",
  "SPIA",
  "Fixed",
  "Private Note",
  "Other",
  "Fixed Indexed",
  "Variable",
  "Indexed",
  "Immediate",
  "Deferred",
];

const OLDER_CONTRACT_TYPES = [
  "Fixed Indexed",
  "Variable",
  "Indexed",
  "Immediate",
  "Deferred",
];

const INCOME_MODES = [
  "Daily",
  "Monthly",
  "Quarterly",
  "Biannual",
  "Annual",
  "Other",
];

const STANDARD_LIQUIDITY_OPTIONS = ["0", "5", "10", "20"];

const moneyRegex = /^-?\d+(\.\d{1,2})?$/;
const positiveMoneyRegex = /^\d+(\.\d{1,2})?$/;

const validatePositiveMoney = (val?: string) => {
  if (!val || val.trim() === "") return true;
  return positiveMoneyRegex.test(val.trim());
};

const validateMoneyAllowNegative = (val?: string) => {
  if (!val || val.trim() === "") return true;
  return moneyRegex.test(val.trim());
};

const editContractSchema = z
  .object({
    client: z.string().min(1, "Client is required"),
    insuranceCompany: z.string().min(1, "Insurance Company is required"),
    contractType: z.string().min(1, "Contract Type is required"),
    status: z.string().min(1, "Status is required"),
    policyNumber: z.string().max(50, "Contract Number must be less than 50 characters").optional().or(z.literal("")),
    productName: z.string().max(100, "Product Name must be less than 100 characters").optional().or(z.literal("")),

    // Dates
    startDate: z.date().optional().nullable(),
    anniversaryDate: z.date().optional().nullable(),
    outOfSurrenderDate: z.date().optional().nullable(),

    // Financials
    premiumAmount: z.string().optional().refine(validatePositiveMoney, "Must be a number with max 2 decimals, ≥ 0"),
    contractValue: z.string().optional().refine(validatePositiveMoney, "Must be a number with max 2 decimals, ≥ 0"),
    deathBenefit: z.string().optional().refine(validatePositiveMoney, "Must be a number with max 2 decimals, ≥ 0"),
    income: z.string().optional().refine(validatePositiveMoney, "Must be a number with max 2 decimals, ≥ 0"),
    incomeMode: z.string().optional(),
    qualified: z.boolean(),
    rmd: z.string().optional().refine(validatePositiveMoney, "Must be a number with max 2 decimals, ≥ 0"),
    liquidityFeature: z.string().optional(),
    penaltyFreeAmount: z.string().optional().refine(validatePositiveMoney, "Must be a number with max 2 decimals, ≥ 0"),
    marketValueAdjustment: z.string().optional().refine(validateMoneyAllowNegative, "Must be a number with max 2 decimals"),
    currentSurrenderValue: z.string().optional().refine(validatePositiveMoney, "Must be a number with max 2 decimals, ≥ 0"),

    // Annuitant & others
    annuitantNotOwner: z.boolean(),
    annuitantDob: z.date().optional().nullable(),
    ridersOrFeatures: z.string().max(500, "Riders or Features must be less than 500 characters").optional().or(z.literal("")),
    beneficiaryInfo: z.string().max(200, "Beneficiary Info must be less than 200 characters").optional().or(z.literal("")),
    notes: z.string().max(500, "Notes must be less than 500 characters").optional().or(z.literal("")),
  })
  .superRefine((data, ctx) => {
    // Dependent rule 1: Income entered -> incomeMode required
    if (data.income && data.income.trim() !== "") {
      const incVal = parseFloat(data.income);
      if (!isNaN(incVal) && incVal > 0 && (!data.incomeMode || data.incomeMode === "none" || data.incomeMode.trim() === "")) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Income Mode is required when Income is entered",
          path: ["incomeMode"],
        });
      }
    }

    // Dependent rule 2: Annuitant Not Owner = Yes -> annuitantDob required and not in future
    if (data.annuitantNotOwner) {
      if (!data.annuitantDob) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Annuitant DOB is required when Annuitant Not Owner is Yes",
          path: ["annuitantDob"],
        });
      } else if (data.annuitantDob > new Date()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Annuitant DOB cannot be in the future",
          path: ["annuitantDob"],
        });
      }
    }
  });

type EditContractFormData = z.infer<typeof editContractSchema>;

interface EditContractDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitSuccess: () => void;
  contract?: Contract;
}

export default function EditContractDialog({
  isOpen,
  onClose,
  onSubmitSuccess,
  contract,
}: EditContractDialogProps) {
  const [isStartDateOpen, setIsStartDateOpen] = useState(false);
  const [isAnniversaryDateOpen, setIsAnniversaryDateOpen] = useState(false);
  const [isOutOfSurrenderOpen, setIsOutOfSurrenderOpen] = useState(false);
  const [isAnnuitantDobOpen, setIsAnnuitantDobOpen] = useState(false);

  const { data: clientsData } = useClients({ limit: 100 });
  const clientOptions =
    clientsData?.data?.map((client) => ({
      label: `${client.firstName} ${client.lastName}`,
      value: client._id || client.id,
    })) || [];

  const contractId = contract?.id || (contract as any)?._id || "";
  const updateContract = useUpdateContract(contractId);

  const getClientId = () => {
    if (!contract) return "";
    if (typeof contract.client === "string") return contract.client;
    return (contract.client as any)?._id || (contract.client as any)?.id || "";
  };

  // Determine available contract types: 8 primary, plus the contract's type if it's one of older 5
  const availableContractTypes = useMemo(() => {
    const list = [...PRIMARY_CONTRACT_TYPES];
    if (contract?.contractType && !list.includes(contract.contractType)) {
      list.push(contract.contractType);
    }
    return list;
  }, [contract?.contractType]);

  // Determine available liquidity options: 0, 5, 10, 20, plus current value if different (e.g. 15)
  const liquidityOptions = useMemo(() => {
    const options = [
      { label: "None", value: "none" },
      { label: "0%", value: "0" },
      { label: "5%", value: "5" },
      { label: "10%", value: "10" },
      { label: "20%", value: "20" },
    ];
    if (
      contract?.liquidityFeature != null &&
      !STANDARD_LIQUIDITY_OPTIONS.includes(String(contract.liquidityFeature))
    ) {
      options.push({
        label: `${contract.liquidityFeature}%`,
        value: String(contract.liquidityFeature),
      });
    }
    return options;
  }, [contract?.liquidityFeature]);

  const {
    register,
    handleSubmit,
    control,
    reset,
    watch,
    setError,
    clearErrors,
    formState: { errors },
  } = useForm<EditContractFormData>({
    resolver: zodResolver(editContractSchema),
    defaultValues: {
      client: getClientId(),
      policyNumber: contract?.policyNumber || "",
      insuranceCompany: contract?.provider || "",
      contractType: contract?.contractType || "FIA",
      productName: contract?.productName || "",
      status: contract?.status || "Active",
      premiumAmount: contract?.premiumAmount != null ? String(contract.premiumAmount) : "",
      contractValue: contract?.contractValue != null ? String(contract.contractValue) : "",
      deathBenefit: contract?.deathBenefit != null ? String(contract.deathBenefit) : "",
      income: contract?.income != null ? String(contract.income) : "",
      incomeMode: contract?.incomeMode || "none",
      qualified: !!contract?.qualified,
      rmd: contract?.rmd != null ? String(contract.rmd) : "",
      liquidityFeature: contract?.liquidityFeature != null ? String(contract.liquidityFeature) : "none",
      outOfSurrenderDate: parseDateSafe(contract?.outOfSurrenderDate),
      penaltyFreeAmount: contract?.penaltyFreeAmount != null ? String(contract.penaltyFreeAmount) : "",
      marketValueAdjustment: contract?.marketValueAdjustment != null ? String(contract.marketValueAdjustment) : "",
      currentSurrenderValue: contract?.currentSurrenderValue != null ? String(contract.currentSurrenderValue) : "",
      ridersOrFeatures: contract?.ridersOrFeatures || "",
      annuitantNotOwner: !!contract?.annuitantNotOwner,
      annuitantDob: parseDateSafe(contract?.annuitantDob),
      beneficiaryInfo: contract?.beneficiaryInformation || "",
      notes: contract?.notes || "",
      startDate: parseDateSafe(contract?.startDate),
      anniversaryDate: parseDateSafe(contract?.anniversaryDate),
    },
  });

  const annuitantNotOwner = watch("annuitantNotOwner");
  const incomeValue = watch("income");
  const premiumAmount = watch("premiumAmount");
  const contractValue = watch("contractValue");

  const parseMonetaryValue = (val?: string) => {
    if (!val) return 0;
    const cleaned = String(val).replace(/[^0-9.-]+/g, "");
    return parseFloat(cleaned) || 0;
  };

  const isHighPremium = parseMonetaryValue(premiumAmount) > 1000000;
  const isHighContractValue = parseMonetaryValue(contractValue) > 1000000;

  useEffect(() => {
    if (contract && isOpen) {
      reset({
        client: getClientId(),
        policyNumber: contract.policyNumber || "",
        insuranceCompany: contract.provider || "",
        contractType: contract.contractType || "FIA",
        productName: contract.productName || "",
        status: contract.status || "Active",
        premiumAmount: contract.premiumAmount != null ? String(contract.premiumAmount) : "",
        contractValue: contract.contractValue != null ? String(contract.contractValue) : "",
        deathBenefit: contract.deathBenefit != null ? String(contract.deathBenefit) : "",
        income: contract.income != null ? String(contract.income) : "",
        incomeMode: contract.incomeMode || "none",
        qualified: !!contract.qualified,
        rmd: contract.rmd != null ? String(contract.rmd) : "",
        liquidityFeature: contract.liquidityFeature != null ? String(contract.liquidityFeature) : "none",
        outOfSurrenderDate: parseDateSafe(contract.outOfSurrenderDate),
        penaltyFreeAmount: contract.penaltyFreeAmount != null ? String(contract.penaltyFreeAmount) : "",
        marketValueAdjustment: contract.marketValueAdjustment != null ? String(contract.marketValueAdjustment) : "",
        currentSurrenderValue: contract.currentSurrenderValue != null ? String(contract.currentSurrenderValue) : "",
        ridersOrFeatures: contract.ridersOrFeatures || "",
        annuitantNotOwner: !!contract.annuitantNotOwner,
        annuitantDob: parseDateSafe(contract.annuitantDob),
        beneficiaryInfo: contract.beneficiaryInformation || "",
        notes: contract.notes || "",
        startDate: parseDateSafe(contract.startDate),
        anniversaryDate: parseDateSafe(contract.anniversaryDate),
      });
    }
  }, [contract, isOpen, reset]);

  const dateErrorsRef = useRef<Record<string, string | null>>({});

  const handleDateValidationError = useCallback(
    (fieldName: keyof EditContractFormData, err: string | null) => {
      dateErrorsRef.current[fieldName] = err;
      if (err) {
        setError(fieldName, { type: "manual", message: err });
      } else {
        clearErrors(fieldName);
      }
    },
    [setError, clearErrors]
  );

  const onSubmit = (data: EditContractFormData) => {
    const activeDateErrors = Object.entries(dateErrorsRef.current).filter(([_, err]) => Boolean(err));
    if (activeDateErrors.length > 0) {
      activeDateErrors.forEach(([fieldName, err]) => {
        if (err) {
          setError(fieldName as any, { type: "manual", message: err });
        }
      });
      return;
    }

    const targetId = contract?.id || (contract as any)?._id;
    if (!targetId) {
      toast.error("Contract ID not found");
      return;
    }

    // According to backend integration guide: send null to clear values in PATCH body!
    const patchPayload: UpdateContractDTO = {
      client: data.client,
      provider: data.insuranceCompany,
      contractType: data.contractType,
      status: data.status,
      policyNumber: data.policyNumber?.trim() ? data.policyNumber.trim() : null,
      productName: data.productName?.trim() ? data.productName.trim() : null,
      startDate: data.startDate ? format(data.startDate, "yyyy-MM-dd") : null,
      anniversaryDate: data.anniversaryDate ? format(data.anniversaryDate, "yyyy-MM-dd") : null,
      outOfSurrenderDate: data.outOfSurrenderDate ? format(data.outOfSurrenderDate, "yyyy-MM-dd") : null,
      premiumAmount: data.premiumAmount?.trim() ? parseFloat(data.premiumAmount) : null,
      contractValue: data.contractValue?.trim() ? parseFloat(data.contractValue) : null,
      deathBenefit: data.deathBenefit?.trim() ? parseFloat(data.deathBenefit) : null,
      income: data.income?.trim() ? parseFloat(data.income) : null,
      incomeMode: data.incomeMode && data.incomeMode !== "none" ? data.incomeMode : null,
      qualified: data.qualified,
      rmd: data.rmd?.trim() ? parseFloat(data.rmd) : null,
      liquidityFeature:
        data.liquidityFeature && data.liquidityFeature !== "none"
          ? Number(data.liquidityFeature)
          : null,
      penaltyFreeAmount: data.penaltyFreeAmount?.trim() ? parseFloat(data.penaltyFreeAmount) : null,
      marketValueAdjustment: data.marketValueAdjustment?.trim() ? parseFloat(data.marketValueAdjustment) : null,
      currentSurrenderValue: data.currentSurrenderValue?.trim() ? parseFloat(data.currentSurrenderValue) : null,
      ridersOrFeatures: data.ridersOrFeatures?.trim() ? data.ridersOrFeatures.trim() : null,
      annuitantNotOwner: data.annuitantNotOwner,
      annuitantDob: data.annuitantDob ? format(data.annuitantDob, "yyyy-MM-dd") : null,
      beneficiaryInformation: data.beneficiaryInfo?.trim() ? data.beneficiaryInfo.trim() : null,
      notes: data.notes?.trim() ? data.notes.trim() : null,
    };

    updateContract.mutate(patchPayload, {
      onSuccess: () => {
        toast.success("Contract updated successfully!");
        onClose();
        onSubmitSuccess();
      },
      onError: (err: any) => {
        const backendErrors = err?.response?.data?.error;
        if (Array.isArray(backendErrors) && backendErrors.length > 0) {
          backendErrors.forEach((e: any) => {
            toast.error(e.message || "Validation error");
          });
        } else {
          toast.error(err?.response?.data?.message || err?.message || "Failed to update contract");
        }
      },
    });
  };

  const handleClose = () => {
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-[720px] border-white/10 shadow-2xl max-h-[90vh] overflow-y-auto no-scrollbar bg-[#141C24] text-white font-sans">
        <DialogHeader>
          <DialogTitle className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            Edit Contract
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5 py-2 font-sans" noValidate>
          {/* SECTION 1: Client Selection */}
          <div className="flex flex-col gap-3 p-3.5 bg-[#0C1116] border border-white/5 rounded-xl">
            <Label className="text-xs font-semibold text-[#849EB2] uppercase tracking-wider">
              Client <span className="text-destructive">*</span>
            </Label>
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
            {errors.client && (
              <p className="text-[11px] font-medium text-[#FF3E46] mt-0.5">{errors.client.message}</p>
            )}
          </div>

          {/* SECTION 2: Core Contract Details */}
          <div className="flex flex-col gap-3 p-3.5 bg-[#0C1116] border border-white/5 rounded-xl">
            <Label className="text-xs font-semibold text-[#849EB2] uppercase tracking-wider">
              Core Contract Details
            </Label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {/* Insurance Company (Provider) - REQUIRED */}
              <div className="flex flex-col gap-1.5">
                <Label className="text-xs font-medium text-white">
                  Company / Carrier <span className="text-destructive">*</span>
                </Label>
                <Controller
                  name="insuranceCompany"
                  control={control}
                  render={({ field }) => (
                    <InsuranceCompanyCombobox
                      value={field.value}
                      onChange={field.onChange}
                      error={!!errors.insuranceCompany}
                    />
                  )}
                />
                {errors.insuranceCompany && (
                  <p className="text-[11px] font-medium text-[#FF3E46] mt-0.5">
                    {errors.insuranceCompany.message}
                  </p>
                )}
              </div>

              {/* Contract Type - REQUIRED (preserves older 5 types if currently held) */}
              <div className="flex flex-col gap-1.5">
                <Label className="text-xs font-medium text-white">
                  Contract Type <span className="text-destructive">*</span>
                </Label>
                <Controller
                  name="contractType"
                  control={control}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger className="h-10 px-3.5 bg-[#141C24] border-0 text-white rounded-[12px] text-xs font-normal w-full justify-between shadow-none focus:ring-1 focus:ring-[#6887A0]">
                        <SelectValue placeholder="Select Type" />
                      </SelectTrigger>
                      <SelectContent className="bg-[#141C24] border border-white/10 text-white rounded-[12px]">
                        {availableContractTypes.map((type) => (
                          <SelectItem
                            key={type}
                            value={type}
                            className="text-white hover:bg-white/10 cursor-pointer text-xs"
                          >
                            {type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.contractType && (
                  <p className="text-[11px] font-medium text-[#FF3E46] mt-0.5">
                    {errors.contractType.message}
                  </p>
                )}
              </div>

              {/* Status */}
              <div className="flex flex-col gap-1.5">
                <Label className="text-xs font-medium text-white">
                  Status <span className="text-destructive">*</span>
                </Label>
                <Controller
                  name="status"
                  control={control}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger className="h-10 px-3.5 bg-[#141C24] border-0 text-white rounded-[12px] text-xs font-normal w-full justify-between shadow-none focus:ring-1 focus:ring-[#6887A0]">
                        <SelectValue placeholder="Active" />
                      </SelectTrigger>
                      <SelectContent className="bg-[#141C24] border border-white/10 text-white rounded-[12px]">
                        <SelectItem value="Active" className="text-white hover:bg-white/10 cursor-pointer text-xs">Active</SelectItem>
                        <SelectItem value="Pending" className="text-white hover:bg-white/10 cursor-pointer text-xs">Pending</SelectItem>
                        <SelectItem value="Matured" className="text-white hover:bg-white/10 cursor-pointer text-xs">Matured</SelectItem>
                        <SelectItem value="Surrendered" className="text-white hover:bg-white/10 cursor-pointer text-xs">Surrendered</SelectItem>
                        <SelectItem value="Out of Surrender" className="text-white hover:bg-white/10 cursor-pointer text-xs">Out of Surrender</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>

              {/* Contract Number - OPTIONAL NOW */}
              <div className="flex flex-col gap-1.5">
                <Label className="text-xs font-medium text-white">Contract Number</Label>
                <Input
                  type="text"
                  {...register("policyNumber")}
                  placeholder="Contract Number (optional)"
                  className="h-10 bg-[#141C24] border-0 text-white placeholder-[#919191] text-xs rounded-[12px] focus-visible:ring-1 focus-visible:ring-[#6887A0]"
                />
                {errors.policyNumber && (
                  <p className="text-[11px] font-medium text-[#FF3E46] mt-0.5">
                    {errors.policyNumber.message}
                  </p>
                )}
              </div>

              {/* Product Name */}
              <div className="flex flex-col gap-1.5 sm:col-span-2">
                <Label className="text-xs font-medium text-white">Product Name</Label>
                <Input
                  type="text"
                  {...register("productName")}
                  placeholder="e.g. Gold Guard 5"
                  className="h-10 bg-[#141C24] border-0 text-white placeholder-[#919191] text-xs rounded-[12px] focus-visible:ring-1 focus-visible:ring-[#6887A0]"
                />
              </div>
            </div>
          </div>

          {/* SECTION 3: Financial Values & Amounts */}
          <div className="flex flex-col gap-3 p-3.5 bg-[#0C1116] border border-white/5 rounded-xl">
            <Label className="text-xs font-semibold text-[#849EB2] uppercase tracking-wider">
              Financial Values & Features
            </Label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {/* Accumulated Value (contractValue) */}
              <div className="flex flex-col gap-1.5">
                <Label className="text-xs font-medium text-white">Accumulated Value</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white text-xs pointer-events-none">$</span>
                  <Input
                    type="number"
                    step="0.01"
                    {...register("contractValue")}
                    placeholder="0.00"
                    className={`h-10 bg-[#141C24] border-0 text-white placeholder-[#919191] text-xs rounded-[12px] pl-7 focus-visible:ring-1 focus-visible:ring-[#6887A0] ${
                      errors.contractValue ? "ring-1 ring-[#FF3E46]" : isHighContractValue ? "ring-1 ring-[#F59E0B]" : ""
                    }`}
                  />
                </div>
                {errors.contractValue ? (
                  <p className="text-[11px] font-medium text-[#FF3E46] mt-0.5">{errors.contractValue.message}</p>
                ) : isHighContractValue ? (
                  <p className="text-[11px] font-medium text-[#F59E0B] flex items-center gap-1 mt-0.5 leading-snug">
                    <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" /> Value exceeds $1,000,000.
                  </p>
                ) : null}
              </div>

              {/* Initial Premium (premiumAmount) */}
              <div className="flex flex-col gap-1.5">
                <Label className="text-xs font-medium text-white">Initial Premium / Investment</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white text-xs pointer-events-none">$</span>
                  <Input
                    type="number"
                    step="0.01"
                    {...register("premiumAmount")}
                    placeholder="0.00"
                    className={`h-10 bg-[#141C24] border-0 text-white placeholder-[#919191] text-xs rounded-[12px] pl-7 focus-visible:ring-1 focus-visible:ring-[#6887A0] ${
                      errors.premiumAmount ? "ring-1 ring-[#FF3E46]" : isHighPremium ? "ring-1 ring-[#F59E0B]" : ""
                    }`}
                  />
                </div>
                {errors.premiumAmount ? (
                  <p className="text-[11px] font-medium text-[#FF3E46] mt-0.5">{errors.premiumAmount.message}</p>
                ) : isHighPremium ? (
                  <p className="text-[11px] font-medium text-[#F59E0B] flex items-center gap-1 mt-0.5 leading-snug">
                    <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" /> Value exceeds $1,000,000.
                  </p>
                ) : null}
              </div>

              {/* Death Benefit */}
              <div className="flex flex-col gap-1.5">
                <Label className="text-xs font-medium text-white">Death Benefit</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white text-xs pointer-events-none">$</span>
                  <Input
                    type="number"
                    step="0.01"
                    {...register("deathBenefit")}
                    placeholder="0.00"
                    className={`h-10 bg-[#141C24] border-0 text-white placeholder-[#919191] text-xs rounded-[12px] pl-7 focus-visible:ring-1 focus-visible:ring-[#6887A0] ${
                      errors.deathBenefit ? "ring-1 ring-[#FF3E46]" : ""
                    }`}
                  />
                </div>
                {errors.deathBenefit && (
                  <p className="text-[11px] font-medium text-[#FF3E46] mt-0.5">{errors.deathBenefit.message}</p>
                )}
              </div>

              {/* Current Surrender Value */}
              <div className="flex flex-col gap-1.5">
                <Label className="text-xs font-medium text-white">Current Surrender Value</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white text-xs pointer-events-none">$</span>
                  <Input
                    type="number"
                    step="0.01"
                    {...register("currentSurrenderValue")}
                    placeholder="0.00"
                    className="h-10 bg-[#141C24] border-0 text-white placeholder-[#919191] text-xs rounded-[12px] pl-7 focus-visible:ring-1 focus-visible:ring-[#6887A0]"
                  />
                </div>
              </div>

              {/* Penalty Free Amount */}
              <div className="flex flex-col gap-1.5">
                <Label className="text-xs font-medium text-white">Penalty Free Amount</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white text-xs pointer-events-none">$</span>
                  <Input
                    type="number"
                    step="0.01"
                    {...register("penaltyFreeAmount")}
                    placeholder="0.00"
                    className="h-10 bg-[#141C24] border-0 text-white placeholder-[#919191] text-xs rounded-[12px] pl-7 focus-visible:ring-1 focus-visible:ring-[#6887A0]"
                  />
                </div>
              </div>

              {/* Market Value Adjustment (May be negative) */}
              <div className="flex flex-col gap-1.5">
                <Label className="text-xs font-medium text-white">Market Value Adjustment (can be negative)</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white text-xs pointer-events-none">$</span>
                  <Input
                    type="number"
                    step="0.01"
                    {...register("marketValueAdjustment")}
                    placeholder="e.g. -350.75"
                    className={`h-10 bg-[#141C24] border-0 text-white placeholder-[#919191] text-xs rounded-[12px] pl-7 focus-visible:ring-1 focus-visible:ring-[#6887A0] ${
                      errors.marketValueAdjustment ? "ring-1 ring-[#FF3E46]" : ""
                    }`}
                  />
                </div>
                {errors.marketValueAdjustment && (
                  <p className="text-[11px] font-medium text-[#FF3E46] mt-0.5">{errors.marketValueAdjustment.message}</p>
                )}
              </div>

              {/* Income */}
              <div className="flex flex-col gap-1.5">
                <Label className="text-xs font-medium text-white">Income</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white text-xs pointer-events-none">$</span>
                  <Input
                    type="number"
                    step="0.01"
                    {...register("income")}
                    placeholder="0.00"
                    className="h-10 bg-[#141C24] border-0 text-white placeholder-[#919191] text-xs rounded-[12px] pl-7 focus-visible:ring-1 focus-visible:ring-[#6887A0]"
                  />
                </div>
              </div>

              {/* Income Mode (Required if Income entered) */}
              <div className="flex flex-col gap-1.5">
                <Label className="text-xs font-medium text-white">
                  Income Mode {incomeValue && parseFloat(incomeValue) > 0 && <span className="text-destructive">*</span>}
                </Label>
                <Controller
                  name="incomeMode"
                  control={control}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger className={`h-10 px-3.5 bg-[#141C24] border-0 text-white rounded-[12px] text-xs font-normal w-full justify-between shadow-none focus:ring-1 focus:ring-[#6887A0] ${
                        errors.incomeMode ? "ring-1 ring-[#FF3E46]" : ""
                      }`}>
                        <SelectValue placeholder="Select mode" />
                      </SelectTrigger>
                      <SelectContent className="bg-[#141C24] border border-white/10 text-white rounded-[12px]">
                        <SelectItem value="none" className="text-[#919191] hover:bg-white/10 cursor-pointer text-xs">None</SelectItem>
                        {INCOME_MODES.map((mode) => (
                          <SelectItem key={mode} value={mode} className="text-white hover:bg-white/10 cursor-pointer text-xs">
                            {mode}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.incomeMode && (
                  <p className="text-[11px] font-medium text-[#FF3E46] mt-0.5">{errors.incomeMode.message}</p>
                )}
              </div>

              {/* Qualified */}
              <div className="flex flex-col gap-1.5">
                <Label className="text-xs font-medium text-white">Qualified</Label>
                <Controller
                  name="qualified"
                  control={control}
                  render={({ field }) => (
                    <Select
                      value={field.value ? "true" : "false"}
                      onValueChange={(val) => field.onChange(val === "true")}
                    >
                      <SelectTrigger className="h-10 px-3.5 bg-[#141C24] border-0 text-white rounded-[12px] text-xs font-normal w-full justify-between shadow-none focus:ring-1 focus:ring-[#6887A0]">
                        <SelectValue placeholder="No" />
                      </SelectTrigger>
                      <SelectContent className="bg-[#141C24] border border-white/10 text-white rounded-[12px]">
                        <SelectItem value="false" className="text-white hover:bg-white/10 cursor-pointer text-xs">No</SelectItem>
                        <SelectItem value="true" className="text-white hover:bg-white/10 cursor-pointer text-xs">Yes</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>

              {/* RMD */}
              <div className="flex flex-col gap-1.5">
                <Label className="text-xs font-medium text-white">RMD</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white text-xs pointer-events-none">$</span>
                  <Input
                    type="number"
                    step="0.01"
                    {...register("rmd")}
                    placeholder="0.00"
                    className="h-10 bg-[#141C24] border-0 text-white placeholder-[#919191] text-xs rounded-[12px] pl-7 focus-visible:ring-1 focus-visible:ring-[#6887A0]"
                  />
                </div>
              </div>

              {/* Liquidity Feature */}
              <div className="flex flex-col gap-1.5">
                <Label className="text-xs font-medium text-white">Liquidity Feature</Label>
                <Controller
                  name="liquidityFeature"
                  control={control}
                  render={({ field }) => (
                    <Select value={field.value || "none"} onValueChange={field.onChange}>
                      <SelectTrigger className="h-10 px-3.5 bg-[#141C24] border-0 text-white rounded-[12px] text-xs font-normal w-full justify-between shadow-none focus:ring-1 focus:ring-[#6887A0]">
                        <SelectValue placeholder="Select %" />
                      </SelectTrigger>
                      <SelectContent className="bg-[#141C24] border border-white/10 text-white rounded-[12px]">
                        {liquidityOptions.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value} className="text-white hover:bg-white/10 cursor-pointer text-xs">
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
            </div>
          </div>

          {/* SECTION 4: Key Dates */}
          <div className="flex flex-col gap-3 p-3.5 bg-[#0C1116] border border-white/5 rounded-xl">
            <Label className="text-xs font-semibold text-[#849EB2] uppercase tracking-wider">
              Key Dates (All Optional)
            </Label>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              {/* Issue Date */}
              <div className="flex flex-col gap-1.5">
                <Label className="text-xs font-medium text-white">Issue Date</Label>
                <Controller
                  name="startDate"
                  control={control}
                  render={({ field, fieldState }) => (
                    <DatePickerInput
                      value={field.value}
                      onChange={field.onChange}
                      onBlur={field.onBlur}
                      onValidationError={(err) => handleDateValidationError("startDate", err)}
                      error={fieldState.error?.message}
                      placeholder="MM/DD/YYYY"
                    />
                  )}
                />
              </div>

              {/* Next Anniversary Date */}
              <div className="flex flex-col gap-1.5">
                <Label className="text-xs font-medium text-white">Next Anniversary Date</Label>
                <Controller
                  name="anniversaryDate"
                  control={control}
                  render={({ field, fieldState }) => (
                    <DatePickerInput
                      value={field.value}
                      onChange={field.onChange}
                      onBlur={field.onBlur}
                      onValidationError={(err) => handleDateValidationError("anniversaryDate", err)}
                      error={fieldState.error?.message}
                      placeholder="MM/DD/YYYY"
                    />
                  )}
                />
              </div>

              {/* Out of Surrender Date */}
              <div className="flex flex-col gap-1.5">
                <Label className="text-xs font-medium text-white">Out of Surrender Date</Label>
                <Controller
                  name="outOfSurrenderDate"
                  control={control}
                  render={({ field, fieldState }) => (
                    <DatePickerInput
                      value={field.value}
                      onChange={field.onChange}
                      onBlur={field.onBlur}
                      onValidationError={(err) => handleDateValidationError("outOfSurrenderDate", err)}
                      error={fieldState.error?.message}
                      placeholder="MM/DD/YYYY"
                    />
                  )}
                />
              </div>
            </div>
          </div>

          {/* SECTION 5: Annuitant Details */}
          <div className="flex flex-col gap-3 p-3.5 bg-[#0C1116] border border-white/5 rounded-xl">
            <Label className="text-xs font-semibold text-[#849EB2] uppercase tracking-wider">
              Annuitant Details
            </Label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {/* Annuitant Not Owner */}
              <div className="flex flex-col gap-1.5">
                <Label className="text-xs font-medium text-white">Annuitant Not Owner</Label>
                <Controller
                  name="annuitantNotOwner"
                  control={control}
                  render={({ field }) => (
                    <Select
                      value={field.value ? "true" : "false"}
                      onValueChange={(val) => field.onChange(val === "true")}
                    >
                      <SelectTrigger className="h-10 px-3.5 bg-[#141C24] border-0 text-white rounded-[12px] text-xs font-normal w-full justify-between shadow-none focus:ring-1 focus:ring-[#6887A0]">
                        <SelectValue placeholder="No" />
                      </SelectTrigger>
                      <SelectContent className="bg-[#141C24] border border-white/10 text-white rounded-[12px]">
                        <SelectItem value="false" className="text-white hover:bg-white/10 cursor-pointer text-xs">No</SelectItem>
                        <SelectItem value="true" className="text-white hover:bg-white/10 cursor-pointer text-xs">Yes</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>

              {/* Annuitant DOB */}
              <div className="flex flex-col gap-1.5">
                <Label className="text-xs font-medium text-white">
                  Annuitant DOB {annuitantNotOwner && <span className="text-destructive">*</span>}
                </Label>
                <Controller
                  name="annuitantDob"
                  control={control}
                  render={({ field, fieldState }) => (
                    <DatePickerInput
                      value={field.value}
                      onChange={field.onChange}
                      onBlur={field.onBlur}
                      onValidationError={(err) => handleDateValidationError("annuitantDob", err)}
                      error={fieldState.error?.message}
                      isDob
                      label="Annuitant DOB"
                      placeholder="MM/DD/YYYY"
                    />
                  )}
                />
              </div>
            </div>
          </div>

          {/* SECTION 6: Additional Information */}
          <div className="flex flex-col gap-3 p-3.5 bg-[#0C1116] border border-white/5 rounded-xl">
            <Label className="text-xs font-semibold text-[#849EB2] uppercase tracking-wider">
              Additional Information
            </Label>

            {/* Riders or Features */}
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs font-medium text-white">Riders or Features</Label>
              <Input
                type="text"
                {...register("ridersOrFeatures")}
                placeholder="e.g. Guaranteed lifetime income rider, LTC"
                className="h-10 bg-[#141C24] border-0 text-white placeholder-[#919191] text-xs rounded-[12px] focus-visible:ring-1 focus-visible:ring-[#6887A0]"
              />
            </div>

            {/* Beneficiary Information */}
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs font-medium text-white">Beneficiary Information</Label>
              <Input
                type="text"
                {...register("beneficiaryInfo")}
                placeholder="Enter beneficiary details"
                className="h-10 bg-[#141C24] border-0 text-white placeholder-[#919191] text-xs rounded-[12px] focus-visible:ring-1 focus-visible:ring-[#6887A0]"
              />
            </div>

            {/* Notes */}
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs font-medium text-white">Notes</Label>
              <textarea
                {...register("notes")}
                placeholder="Type any contract notes here"
                rows={3}
                className="w-full bg-[#141C24] border-0 text-white placeholder-[#919191] text-xs rounded-[12px] p-3 outline-none resize-none focus-visible:ring-1 focus-visible:ring-[#6887A0]"
              />
            </div>
          </div>

          {/* Dialog Footer Actions */}
          <DialogFooter className="pt-2 flex flex-row items-center justify-center gap-3 sm:justify-center">
            <Button
              type="button"
              variant="secondary"
              onClick={handleClose}
              disabled={updateContract.isPending}
              className="w-[140px] h-10 bg-[#2B343D] text-white hover:bg-[#394551] rounded-[12px] text-sm font-medium border-0 cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="w-[160px] h-10 bg-gradient-to-r from-[#66859E] to-[#849EB2] text-white hover:opacity-90 rounded-[12px] text-sm font-medium border-0 shadow-sm cursor-pointer"
              disabled={updateContract.isPending}
            >
              {updateContract.isPending ? "Updating..." : "Update Contract"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
