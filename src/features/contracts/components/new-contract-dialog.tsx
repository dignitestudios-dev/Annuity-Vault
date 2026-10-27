"use client";

import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { AlertTriangle, UserPlus, Users } from "lucide-react";
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

import { useCreateContract } from "@/features/contracts/api/contracts.service";
import { useClients, useCreateClient } from "@/features/clients/api/clients.service";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import toast from "react-hot-toast";
import { handleFormServerErrors } from "@/lib/server-errors";

export const PRIMARY_CONTRACT_TYPES = [
  "Fixed Indexed",
  "Fixed",
  "MYGA",
  "Variable",
  "RILA",
  "SPIA",
  "Private Note",
  "Other",
] as const;

export const TAX_TREATMENTS = ["Pre-Tax", "Roth", "Non-Qualified"] as const;

const INCOME_MODES = [
  "Daily",
  "Monthly",
  "Quarterly",
  "Biannual",
  "Annual",
  "Other",
];

const LIQUIDITY_OPTIONS = [
  { label: "None", value: "none" },
  { label: "0%", value: "0" },
  { label: "5%", value: "5" },
  { label: "10%", value: "10" },
  { label: "20%", value: "20" },
];

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

const newContractSchema = z
  .object({
    clientMode: z.enum(["existing", "new"]),
    client: z.string().optional(),
    newClientFirstName: z.string().optional(),
    newClientLastName: z.string().optional(),
    newClientEmail: z.string().optional(),
    newClientPhone: z.string().optional(),
    newClientDob: z.date().optional().nullable(),

    // Core
    insuranceCompany: z.string().min(1, "Company / Carrier is required"),
    contractType: z.enum(PRIMARY_CONTRACT_TYPES),
    taxTreatment: z.enum(TAX_TREATMENTS),
    status: z.string().min(1, "Status is required"),
    policyNumber: z.string().max(50, "Contract Number must be less than 50 characters").optional().or(z.literal("")),
    productName: z.string().max(100, "Product Name must be less than 100 characters").optional().or(z.literal("")),

    // Dates
    startDate: z.date().optional().nullable(),
    anniversaryDate: z.date().optional().nullable(),
    outOfSurrenderDate: z.date().optional().nullable(),
    maturityDate: z.date().optional().nullable(),

    // Financials
    premiumAmount: z.string().optional().refine(validatePositiveMoney, "Must be a number with max 2 decimals, ≥ 0"),
    contractValue: z.string().optional().refine(validatePositiveMoney, "Must be a number with max 2 decimals, ≥ 0"),
    deathBenefit: z.string().optional().refine(validatePositiveMoney, "Must be a number with max 2 decimals, ≥ 0"),
    income: z.string().optional().refine(validatePositiveMoney, "Must be a number with max 2 decimals, ≥ 0"),
    incomeMode: z.string().optional(),
    rmd: z.enum(["none", "yes", "no"]),
    liquidityFeature: z.string().optional(),
    penaltyFreeAmount: z.string().optional().refine(validatePositiveMoney, "Must be a number with max 2 decimals, ≥ 0"),
    marketValueAdjustment: z.string().optional().refine(validateMoneyAllowNegative, "Must be a number with max 2 decimals"),
    currentSurrenderValue: z.string().optional().refine(validatePositiveMoney, "Must be a number with max 2 decimals, ≥ 0"),

    // Annuitant & others
    annuitantNotOwner: z.enum(["unselected", "yes", "no"]),
    annuitantDob: z.date().optional().nullable(),
    ridersOrFeatures: z.string().max(500, "Riders or Features must be less than 500 characters").optional().or(z.literal("")),
    beneficiaryInfo: z.string().max(200, "Beneficiary Info must be less than 200 characters").optional().or(z.literal("")),
    notes: z.string().max(500, "Notes must be less than 500 characters").optional().or(z.literal("")),
  })
  .superRefine((data, ctx) => {
    if (data.clientMode === "existing") {
      if (!data.client) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Client is required",
          path: ["client"],
        });
      }
    } else {
      if (!data.newClientFirstName?.trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "First Name is required",
          path: ["newClientFirstName"],
        });
      }
      if (!data.newClientLastName?.trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Last Name is required",
          path: ["newClientLastName"],
        });
      }
      if (data.newClientDob && data.newClientDob > new Date()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Date of Birth cannot be in the future",
          path: ["newClientDob"],
        });
      }
    }

    const isOther = data.contractType === "Other";
    const isPrivateNote = data.contractType === "Private Note";
    const isAnnuity = !isOther && !isPrivateNote;

    // Product Name required unless Other
    if (!isOther && (!data.productName || !data.productName.trim())) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: isPrivateNote
          ? "Product name is required for Private Note contracts"
          : "Product Name is required",
        path: ["productName"],
      });
    }

    // Annuity types require Death Benefit and explicit Annuitant Not Owner
    if (isAnnuity) {
      if (!data.deathBenefit || data.deathBenefit.trim() === "") {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Death Benefit is required",
          path: ["deathBenefit"],
        });
      }

      if (data.annuitantNotOwner === "unselected") {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Please specify whether Annuitant is not owner",
          path: ["annuitantNotOwner"],
        });
      }

      if (data.annuitantNotOwner === "yes") {
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
    }

    // Dependent rule: Income entered -> incomeMode required
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
  const clientOptions =
    clientsData?.data?.map((client) => ({
      label: `${client.firstName} ${client.lastName}`,
      value: client._id || client.id,
    })) || [];

  const createContract = useCreateContract();
  const createClientMutation = useCreateClient();

  const {
    register,
    handleSubmit,
    control,
    reset,
    watch,
    setValue,
    setError,
    clearErrors,
    formState: { errors, isSubmitting },
  } = useForm<NewContractFormData>({
    resolver: zodResolver(newContractSchema),
    defaultValues: {
      clientMode: "existing",
      client: defaultClient || "",
      newClientFirstName: "",
      newClientLastName: "",
      newClientEmail: "",
      newClientPhone: "",
      newClientDob: null,
      policyNumber: "",
      insuranceCompany: "",
      contractType: "Fixed Indexed",
      taxTreatment: undefined as any,
      productName: "",
      status: "Active",
      premiumAmount: "",
      contractValue: "",
      deathBenefit: "",
      income: "",
      incomeMode: "none",
      rmd: "none",
      liquidityFeature: "none",
      outOfSurrenderDate: null,
      maturityDate: null,
      penaltyFreeAmount: "",
      marketValueAdjustment: "",
      currentSurrenderValue: "",
      ridersOrFeatures: "",
      annuitantNotOwner: "unselected",
      annuitantDob: null,
      beneficiaryInfo: "",
      notes: "",
      startDate: null,
      anniversaryDate: null,
    },
  });

  const clientMode = watch("clientMode");
  const selectedClientId = watch("client");
  const newClientDob = watch("newClientDob");
  const contractType = watch("contractType");
  const annuitantNotOwner = watch("annuitantNotOwner");
  const incomeValue = watch("income");
  const premiumAmount = watch("premiumAmount");
  const contractValue = watch("contractValue");

  const isOther = contractType === "Other";
  const isPrivateNote = contractType === "Private Note";
  const isAnnuity = !isOther && !isPrivateNote;

  const selectedClientObj = useMemo(() => {
    return clientsData?.data?.find((c) => (c._id || c.id) === selectedClientId);
  }, [clientsData, selectedClientId]);

  const ownerDob = useMemo(() => {
    if (clientMode === "new") {
      return newClientDob || null;
    }
    return selectedClientObj?.dateOfBirth ? parseDateSafe(selectedClientObj.dateOfBirth) : null;
  }, [clientMode, newClientDob, selectedClientObj]);

  // Handle auto-fill of Annuitant DOB when Annuitant Not Owner is No
  useEffect(() => {
    if (isAnnuity && annuitantNotOwner === "no") {
      setValue("annuitantDob", ownerDob);
      clearErrors("annuitantDob");
    }
  }, [isAnnuity, annuitantNotOwner, ownerDob, setValue, clearErrors]);

  const parseMonetaryValue = (val?: string) => {
    if (!val) return 0;
    const cleaned = String(val).replace(/[^0-9.-]+/g, "");
    return parseFloat(cleaned) || 0;
  };

  const isHighPremium = parseMonetaryValue(premiumAmount) > 1000000;
  const isHighContractValue = parseMonetaryValue(contractValue) > 1000000;

  useEffect(() => {
    if (isOpen) {
      reset({
        clientMode: "existing",
        client: defaultClient || "",
        newClientFirstName: "",
        newClientLastName: "",
        newClientEmail: "",
        newClientPhone: "",
        newClientDob: null,
        policyNumber: "",
        insuranceCompany: "",
        contractType: "Fixed Indexed",
        taxTreatment: undefined as any,
        productName: "",
        status: "Active",
        premiumAmount: "",
        contractValue: "",
        deathBenefit: "",
        income: "",
        incomeMode: "none",
        rmd: "none",
        liquidityFeature: "none",
        outOfSurrenderDate: null,
        maturityDate: null,
        penaltyFreeAmount: "",
        marketValueAdjustment: "",
        currentSurrenderValue: "",
        ridersOrFeatures: "",
        annuitantNotOwner: "unselected",
        annuitantDob: null,
        beneficiaryInfo: "",
        notes: "",
        startDate: null,
        anniversaryDate: null,
      });
    }
  }, [isOpen, defaultClient, reset]);

  const dateErrorsRef = useRef<Record<string, string | null>>({});

  const handleDateValidationError = useCallback(
    (fieldName: keyof NewContractFormData, err: string | null) => {
      dateErrorsRef.current[fieldName] = err;
      if (err) {
        setError(fieldName, { type: "manual", message: err });
      } else {
        clearErrors(fieldName);
      }
    },
    [setError, clearErrors]
  );

  const onSubmit = async (data: NewContractFormData) => {
    try {
      const activeDateErrors = Object.entries(dateErrorsRef.current).filter(([_, err]) => Boolean(err));
      if (activeDateErrors.length > 0) {
        activeDateErrors.forEach(([fieldName, err]) => {
          if (err) {
            setError(fieldName as any, { type: "manual", message: err });
          }
        });
        return;
      }

      let finalClientId = data.client;

      // If creating new client inline
      if (data.clientMode === "new") {
        const newClient = await createClientMutation.mutateAsync({
          firstName: data.newClientFirstName!.trim(),
          lastName: data.newClientLastName!.trim(),
          email: data.newClientEmail?.trim() || `client-${Date.now()}@example.com`,
          phone: data.newClientPhone?.trim() || "",
          address: "N/A",
          status: "Active",
          dateOfBirth: data.newClientDob ? format(data.newClientDob, "yyyy-MM-dd") : undefined,
        });
        finalClientId = (newClient as any)?._id || newClient.id;
      }

      if (!finalClientId) {
        toast.error("Please select or create a client.");
        return;
      }

      const payload = {
        client: finalClientId,
        provider: data.insuranceCompany,
        contractType: data.contractType,
        taxTreatment: data.taxTreatment,
        status: data.status,
        policyNumber: data.policyNumber?.trim() || undefined,
        productName: !isOther && data.productName?.trim() ? data.productName.trim() : undefined,
        startDate: data.startDate ? format(data.startDate, "yyyy-MM-dd") : undefined,
        anniversaryDate: data.anniversaryDate ? format(data.anniversaryDate, "yyyy-MM-dd") : undefined,
        outOfSurrenderDate: data.outOfSurrenderDate ? format(data.outOfSurrenderDate, "yyyy-MM-dd") : undefined,
        maturityDate: data.maturityDate ? format(data.maturityDate, "yyyy-MM-dd") : undefined,
        premiumAmount: data.premiumAmount?.trim() ? parseFloat(data.premiumAmount) : undefined,
        contractValue: data.contractValue?.trim() ? parseFloat(data.contractValue) : undefined,
        deathBenefit: isAnnuity && data.deathBenefit?.trim() ? parseFloat(data.deathBenefit) : undefined,
        income: data.income?.trim() ? parseFloat(data.income) : undefined,
        incomeMode: data.incomeMode && data.incomeMode !== "none" ? data.incomeMode : undefined,
        rmd: data.rmd === "yes" ? true : data.rmd === "no" ? false : undefined,
        liquidityFeature:
          data.liquidityFeature && data.liquidityFeature !== "none"
            ? Number(data.liquidityFeature)
            : undefined,
        penaltyFreeAmount: data.penaltyFreeAmount?.trim() ? parseFloat(data.penaltyFreeAmount) : undefined,
        marketValueAdjustment: data.marketValueAdjustment?.trim() ? parseFloat(data.marketValueAdjustment) : undefined,
        currentSurrenderValue: data.currentSurrenderValue?.trim() ? parseFloat(data.currentSurrenderValue) : undefined,
        ridersOrFeatures: data.ridersOrFeatures?.trim() || undefined,
        annuitantNotOwner: isAnnuity ? data.annuitantNotOwner === "yes" : undefined,
        annuitantDob:
          isAnnuity && data.annuitantNotOwner === "yes" && data.annuitantDob
            ? format(data.annuitantDob, "yyyy-MM-dd")
            : undefined,
        beneficiaryInformation: data.beneficiaryInfo?.trim() || undefined,
        notes: data.notes?.trim() || undefined,
      };

      await createContract.mutateAsync(payload);
      toast.success("Contract created successfully!");
      reset();
      onClose();
      onSubmitSuccess();
    } catch (err: any) {
      handleFormServerErrors(err, setError, "Failed to create contract");
    }
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const isPending = createContract.isPending || createClientMutation.isPending || isSubmitting;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-[720px] border-white/10 shadow-2xl max-h-[90vh] overflow-y-auto no-scrollbar bg-[#141C24] text-white font-sans">
        <DialogHeader>
          <DialogTitle className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            New Contract
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5 py-2 font-sans" noValidate>
          {/* SECTION 1: Client Information */}
          <div className="flex flex-col gap-3 p-3.5 bg-[#0C1116] border border-white/5 rounded-xl">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-semibold text-[#849EB2] uppercase tracking-wider">
                Client Information <span className="text-destructive">*</span>
              </Label>
              {!defaultClient && (
                <div className="flex items-center bg-[#141C24] p-0.5 rounded-lg border border-white/5 text-xs">
                  <button
                    type="button"
                    onClick={() => setValue("clientMode", "existing")}
                    className={`px-2.5 py-1 rounded-md transition-all flex items-center gap-1.5 cursor-pointer ${
                      clientMode === "existing"
                        ? "bg-[#394A58] text-white font-medium"
                        : "text-[#919191] hover:text-white"
                    }`}
                  >
                    <Users className="w-3.5 h-3.5" />
                    <span>Select Client</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setValue("clientMode", "new")}
                    className={`px-2.5 py-1 rounded-md transition-all flex items-center gap-1.5 cursor-pointer ${
                      clientMode === "new"
                        ? "bg-[#394A58] text-white font-medium"
                        : "text-[#919191] hover:text-white"
                    }`}
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>New Client</span>
                  </button>
                </div>
              )}
            </div>

            {clientMode === "existing" ? (
              <div className="flex flex-col gap-1.5">
                <Controller
                  name="client"
                  control={control}
                  render={({ field }) => (
                    <div
                      className={`
                        ${errors.client ? "rounded-xl ring-1 ring-[#FF3E46]" : ""}
                        ${defaultClient ? "opacity-70 pointer-events-none" : ""}
                      `}
                    >
                      <SearchableSelect
                        options={clientOptions}
                        value={field.value || ""}
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
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <Label className="text-xs text-white">First Name <span className="text-destructive">*</span></Label>
                  <Input
                    type="text"
                    {...register("newClientFirstName")}
                    placeholder="First Name"
                    className={`h-10 bg-[#141C24] border-0 text-white placeholder-[#919191] text-xs rounded-[12px] focus-visible:ring-1 focus-visible:ring-[#6887A0] ${
                      errors.newClientFirstName ? "ring-1 ring-[#FF3E46]" : ""
                    }`}
                  />
                  {errors.newClientFirstName && (
                    <p className="text-[11px] text-[#FF3E46]">{errors.newClientFirstName.message}</p>
                  )}
                </div>

                <div className="flex flex-col gap-1">
                  <Label className="text-xs text-white">Last Name <span className="text-destructive">*</span></Label>
                  <Input
                    type="text"
                    {...register("newClientLastName")}
                    placeholder="Last Name"
                    className={`h-10 bg-[#141C24] border-0 text-white placeholder-[#919191] text-xs rounded-[12px] focus-visible:ring-1 focus-visible:ring-[#6887A0] ${
                      errors.newClientLastName ? "ring-1 ring-[#FF3E46]" : ""
                    }`}
                  />
                  {errors.newClientLastName && (
                    <p className="text-[11px] text-[#FF3E46]">{errors.newClientLastName.message}</p>
                  )}
                </div>

                <div className="flex flex-col gap-1">
                  <Label className="text-xs text-white">Email</Label>
                  <Input
                    type="email"
                    {...register("newClientEmail")}
                    placeholder="client@example.com"
                    className={`h-10 bg-[#141C24] border-0 text-white placeholder-[#919191] text-xs rounded-[12px] focus-visible:ring-1 focus-visible:ring-[#6887A0] ${
                      errors.newClientEmail ? "ring-1 ring-[#FF3E46]" : ""
                    }`}
                  />
                  {errors.newClientEmail && (
                    <p className="text-[11px] text-[#FF3E46]">{errors.newClientEmail.message}</p>
                  )}
                </div>

                <div className="flex flex-col gap-1">
                  <Label className="text-xs text-white">Phone</Label>
                  <Input
                    type="text"
                    {...register("newClientPhone")}
                    placeholder="(555) 000-0000"
                    className="h-10 bg-[#141C24] border-0 text-white placeholder-[#919191] text-xs rounded-[12px] focus-visible:ring-1 focus-visible:ring-[#6887A0]"
                  />
                </div>

                <div className="flex flex-col gap-1 sm:col-span-2">
                  <Label className="text-xs text-white">Date of Birth</Label>
                  <Controller
                    name="newClientDob"
                    control={control}
                    render={({ field, fieldState }) => (
                      <DatePickerInput
                        value={field.value}
                        onChange={field.onChange}
                        onBlur={field.onBlur}
                        onValidationError={(err) => handleDateValidationError("newClientDob", err)}
                        error={fieldState.error?.message}
                        isDob
                        label="Date of Birth"
                        placeholder="MM-DD-YYYY"
                      />
                    )}
                  />
                </div>
              </div>
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

              {/* Contract Type - REQUIRED (8 options in order) */}
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
                        {PRIMARY_CONTRACT_TYPES.map((type) => (
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

              {/* Tax Treatment - REQUIRED on every contract */}
              <div className="flex flex-col gap-1.5">
                <Label className="text-xs font-medium text-white">
                  Tax Treatment <span className="text-destructive">*</span>
                </Label>
                <Controller
                  name="taxTreatment"
                  control={control}
                  render={({ field }) => (
                    <Select value={field.value || ""} onValueChange={field.onChange}>
                      <SelectTrigger className={`h-10 px-3.5 bg-[#141C24] border-0 text-white rounded-[12px] text-xs font-normal w-full justify-between shadow-none focus:ring-1 focus:ring-[#6887A0] ${
                        errors.taxTreatment ? "ring-1 ring-[#FF3E46]" : ""
                      }`}>
                        <SelectValue placeholder="Select Tax Treatment" />
                      </SelectTrigger>
                      <SelectContent className="bg-[#141C24] border border-white/10 text-white rounded-[12px]">
                        {TAX_TREATMENTS.map((type) => (
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
                {errors.taxTreatment && (
                  <p className="text-[11px] font-medium text-[#FF3E46] mt-0.5">
                    {errors.taxTreatment.message}
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

              {/* Contract Number - OPTIONAL */}
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

              {/* Product Name - Required unless Other (Private Note requires it) */}
              {!isOther && (
                <div className="flex flex-col gap-1.5 sm:col-span-2">
                  <Label className="text-xs font-medium text-white">
                    Product Name <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    type="text"
                    {...register("productName")}
                    placeholder="e.g. Gold Guard 5"
                    className={`h-10 bg-[#141C24] border-0 text-white placeholder-[#919191] text-xs rounded-[12px] focus-visible:ring-1 focus-visible:ring-[#6887A0] ${
                      errors.productName ? "ring-1 ring-[#FF3E46]" : ""
                    }`}
                  />
                  {errors.productName && (
                    <p className="text-[11px] font-medium text-[#FF3E46] mt-0.5">
                      {errors.productName.message}
                    </p>
                  )}
                </div>
              )}
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

              {/* Death Benefit - Required for Annuity types only; hidden for Private Note & Other */}
              {isAnnuity && (
                <div className="flex flex-col gap-1.5">
                  <Label className="text-xs font-medium text-white">
                    Death Benefit <span className="text-destructive">*</span>
                  </Label>
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
              )}

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

              {/* Income Mode (Required if Income has value) */}
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

              {/* RMD (Yes / No Control) */}
              <div className="flex flex-col gap-1.5">
                <Label className="text-xs font-medium text-white">RMD</Label>
                <Controller
                  name="rmd"
                  control={control}
                  render={({ field }) => (
                    <Select value={field.value || "none"} onValueChange={field.onChange}>
                      <SelectTrigger className="h-10 px-3.5 bg-[#141C24] border-0 text-white rounded-[12px] text-xs font-normal w-full justify-between shadow-none focus:ring-1 focus:ring-[#6887A0]">
                        <SelectValue placeholder="Select RMD..." />
                      </SelectTrigger>
                      <SelectContent className="bg-[#141C24] border border-white/10 text-white rounded-[12px]">
                        <SelectItem value="none" className="text-[#919191] hover:bg-white/10 cursor-pointer text-xs">
                          Not Answered
                        </SelectItem>
                        <SelectItem value="yes" className="text-white hover:bg-white/10 cursor-pointer text-xs">
                          Yes
                        </SelectItem>
                        <SelectItem value="no" className="text-white hover:bg-white/10 cursor-pointer text-xs">
                          No
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
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
                        {LIQUIDITY_OPTIONS.map((opt) => (
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

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
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
                      placeholder="MM-DD-YYYY"
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
                      placeholder="MM-DD-YYYY"
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
                      placeholder="MM-DD-YYYY"
                    />
                  )}
                />
              </div>

              {/* Maturity Date (NEW) */}
              <div className="flex flex-col gap-1.5">
                <Label className="text-xs font-medium text-white">Maturity Date</Label>
                <Controller
                  name="maturityDate"
                  control={control}
                  render={({ field, fieldState }) => (
                    <DatePickerInput
                      value={field.value}
                      onChange={field.onChange}
                      onBlur={field.onBlur}
                      onValidationError={(err) => handleDateValidationError("maturityDate", err)}
                      error={fieldState.error?.message}
                      placeholder="MM-DD-YYYY"
                    />
                  )}
                />
              </div>
            </div>
          </div>

          {/* SECTION 5: Annuitant Details - Annuity types only (Hidden for Private Note & Other) */}
          {isAnnuity && (
            <div className="flex flex-col gap-3 p-3.5 bg-[#0C1116] border border-white/5 rounded-xl">
              <Label className="text-xs font-semibold text-[#849EB2] uppercase tracking-wider">
                Annuitant Details
              </Label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {/* Annuitant Not Owner (Required, explicit Yes/No, no default) */}
                <div className="flex flex-col gap-1.5">
                  <Label className="text-xs font-medium text-white">
                    Annuitant Not Owner <span className="text-destructive">*</span>
                  </Label>
                  <Controller
                    name="annuitantNotOwner"
                    control={control}
                    render={({ field }) => (
                      <Select
                        value={field.value}
                        onValueChange={(val: any) => {
                          field.onChange(val);
                          if (val === "yes") {
                            setValue("annuitantDob", null);
                            clearErrors("annuitantDob");
                          } else if (val === "no") {
                            setValue("annuitantDob", ownerDob);
                            clearErrors("annuitantDob");
                          }
                        }}
                      >
                        <SelectTrigger className={`h-10 px-3.5 bg-[#141C24] border-0 text-white rounded-[12px] text-xs font-normal w-full justify-between shadow-none focus:ring-1 focus:ring-[#6887A0] ${
                          errors.annuitantNotOwner ? "ring-1 ring-[#FF3E46]" : ""
                        }`}>
                          <SelectValue placeholder="Select..." />
                        </SelectTrigger>
                        <SelectContent className="bg-[#141C24] border border-white/10 text-white rounded-[12px]">
                          <SelectItem value="unselected" disabled className="text-[#919191] text-xs">
                            Select...
                          </SelectItem>
                          <SelectItem value="no" className="text-white hover:bg-white/10 cursor-pointer text-xs">
                            No
                          </SelectItem>
                          <SelectItem value="yes" className="text-[#FF3E46] font-semibold hover:bg-white/10 cursor-pointer text-xs">
                            <span className="text-[#FF3E46] font-semibold">Yes</span>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {errors.annuitantNotOwner && (
                    <p className="text-[11px] font-medium text-[#FF3E46] mt-0.5">
                      {errors.annuitantNotOwner.message}
                    </p>
                  )}
                </div>

                {/* Annuitant DOB */}
                <div className="flex flex-col gap-1.5">
                  <Label className="text-xs font-medium text-white">
                    Annuitant DOB {annuitantNotOwner === "yes" && <span className="text-destructive">*</span>}
                    {annuitantNotOwner === "no" && (
                      <span className="text-[#919191] font-normal ml-1.5">(Pre-filled from Client)</span>
                    )}
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
                        placeholder="MM-DD-YYYY"
                        disabled={annuitantNotOwner === "no"}
                        required={annuitantNotOwner === "yes"}
                      />
                    )}
                  />
                  {annuitantNotOwner === "no" && !ownerDob && (
                    <p className="text-[11px] text-[#919191]">Client has no Date of Birth on file.</p>
                  )}
                </div>
              </div>
            </div>
          )}

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
              disabled={isPending}
              className="w-[140px] h-10 bg-[#2B343D] text-white hover:bg-[#394551] rounded-[12px] text-sm font-medium border-0 cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="w-[160px] h-10 bg-gradient-to-r from-[#66859E] to-[#849EB2] text-white hover:opacity-90 rounded-[12px] text-sm font-medium border-0 shadow-sm cursor-pointer"
              disabled={isPending}
            >
              {isPending ? "Creating..." : "Create Contract"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
