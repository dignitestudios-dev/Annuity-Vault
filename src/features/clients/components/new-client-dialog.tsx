"use client";

import { useState, useRef, useCallback } from "react";
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
import DatePickerInput from "@/components/ui/date-picker-input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { ClientStatus } from "./clients-folder-table";
import { useCreateClient } from "@/features/clients/api/clients.service";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import toast from "react-hot-toast";
import { formatUSPhoneNumber } from "@/lib/utils";
import { US_STATES, US_STATE_CODES } from "@/lib/us-states";
import { handleFormServerErrors } from "@/lib/server-errors";

const US_PHONE_REGEX = /^(?:\+?1[-.\s]?)?\(?([2-9][0-9]{2})\)?[-.\s]?([2-9][0-9]{2})[-.\s]?([0-9]{4})$/;

const newClientSchema = z.object({
  firstName: z
    .string()
    .trim()
    .min(1, "First Name is required")
    .max(50, "First Name cannot exceed 50 characters")
    .regex(/^[a-zA-Z\s\-']+$/, "First Name must contain only English letters"),
  lastName: z
    .string()
    .trim()
    .min(1, "Last Name is required")
    .max(50, "Last Name cannot exceed 50 characters")
    .regex(/^[a-zA-Z\s\-']+$/, "Last Name must contain only English letters"),
  email: z
    .string()
    .trim()
    .min(1, "Email is required")
    .email("Invalid email address")
    .max(100, "Email cannot exceed 100 characters")
    .regex(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, "Email must contain only English characters"),
  phone: z
    .string()
    .trim()
    .optional()
    .or(z.literal(""))
    .refine(
      (val) => {
        if (!val) return true;
        return US_PHONE_REGEX.test(val);
      },
      {
        message: "Please enter a valid US phone number (e.g. (555) 000-0000 or +1 (555) 000-0000)",
      }
    ),
  address: z
    .string()
    .trim()
    .min(1, "Address is required")
    .max(200, "Address cannot exceed 200 characters")
    .regex(/^[\x20-\x7E]+$/, "Address must contain only English characters and standard symbols"),
  city: z
    .string()
    .trim()
    .max(100, "City cannot exceed 100 characters")
    .optional()
    .or(z.literal("")),
  state: z
    .string()
    .trim()
    .optional()
    .or(z.literal(""))
    .refine(
      (val) => !val || US_STATE_CODES.includes(val.toUpperCase() as any),
      {
        message: "Must be a valid 2-letter US state code",
      }
    ),
  zip: z
    .string()
    .trim()
    .optional()
    .or(z.literal(""))
    .refine(
      (val) => !val || /^\d{5}(-\d{4})?$/.test(val),
      {
        message: "Must be a 5-digit ZIP or ZIP+4 (e.g. 78759 or 78759-1234)",
      }
    ),
  status: z.enum(["Active", "Inactive", "Prospect"], {
    message: "Please select a valid status",
  }),
  dateOfBirth: z
    .date({
      message: "Date of Birth is required",
    })
    .refine(
      (val) => {
        if (!val) return false;
        const today = new Date();
        const minAgeDate = new Date(
          today.getFullYear() - 18,
          today.getMonth(),
          today.getDate()
        );
        return val <= minAgeDate;
      },
      {
        message: "Client must be at least 18 years old",
      }
    ),
  notes: z
    .string()
    .trim()
    .max(500, "Notes cannot exceed 500 characters")
    .regex(/^[\x20-\x7E\r\n\t]*$/, "Notes must contain only English characters")
    .optional()
    .or(z.literal("")),
});

type NewClientFormData = z.infer<typeof newClientSchema>;

interface NewClientDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitSuccess: () => void;
}

export default function NewClientDialog({
  isOpen,
  onClose,
  onSubmitSuccess,
}: NewClientDialogProps) {
  const {
    register,
    handleSubmit,
    control,
    reset,
    setError,
    clearErrors,
    formState: { errors },
  } = useForm<NewClientFormData>({
    resolver: zodResolver(newClientSchema),
    mode: "onChange",
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      address: "",
      city: "",
      state: "",
      zip: "",
      status: "Active",
      dateOfBirth: undefined,
      notes: "",
    },
  });

  const createClientMutation = useCreateClient();
  const dateErrorsRef = useRef<Record<string, string | null>>({});

  const handleDateValidationError = useCallback(
    (fieldName: keyof NewClientFormData, err: string | null) => {
      dateErrorsRef.current[fieldName] = err;
      if (err) {
        setError(fieldName, { type: "manual", message: err });
      } else {
        clearErrors(fieldName);
      }
    },
    [setError, clearErrors]
  );

  const onSubmit = (data: NewClientFormData) => {
    const activeDateErrors = Object.entries(dateErrorsRef.current).filter(([_, err]) => Boolean(err));
    if (activeDateErrors.length > 0) {
      activeDateErrors.forEach(([fieldName, err]) => {
        if (err) {
          setError(fieldName as any, { type: "manual", message: err });
        }
      });
      return;
    }

    createClientMutation.mutate(
      {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone,
        address: data.address,
        city: data.city?.trim() || undefined,
        state: data.state?.trim() ? data.state.trim().toUpperCase() : undefined,
        zip: data.zip?.trim() || undefined,
        status: data.status,
        dateOfBirth: data.dateOfBirth ? format(data.dateOfBirth, "yyyy-MM-dd") : undefined,
        notes: data.notes,
      },
      {
        onSuccess: () => {
          toast.success("Client created successfully!");
          reset();
          onClose();
          onSubmitSuccess();
        },
        onError: (err: any) => {
          handleFormServerErrors(err, setError, "Failed to create client");
        },
      }
    );
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-[525px] border-white/10 shadow-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-white tracking-tight">
            New Client
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4 font-sans py-2" noValidate>
          {/* Row 1: First Name & Last Name */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs font-medium text-white">First Name <span className="text-destructive">*</span></Label>
              <Input
                type="text"
                {...register("firstName")}
                placeholder="Enter First Name"
                className={`h-10 bg-[#141C24] border-0 text-white placeholder-[#919191] text-xs rounded-[12px] focus-visible:ring-1 focus-visible:ring-[#6887A0] ${errors.firstName ? "ring-1 ring-[#FF3E46]" : ""}`}
              />
              {errors.firstName && <p className="text-[11px] font-medium text-[#FF3E46] mt-0.5">{errors.firstName.message}</p>}
            </div>
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs font-medium text-white">Last Name <span className="text-destructive">*</span></Label>
              <Input
                type="text"
                {...register("lastName")}
                placeholder="Enter Last Name"
                className={`h-10 bg-[#141C24] border-0 text-white placeholder-[#919191] text-xs rounded-[12px] focus-visible:ring-1 focus-visible:ring-[#6887A0] ${errors.lastName ? "ring-1 ring-[#FF3E46]" : ""}`}
              />
              {errors.lastName && <p className="text-[11px] font-medium text-[#FF3E46] mt-0.5">{errors.lastName.message}</p>}
            </div>
          </div>

          {/* Row 2: Email & Phone */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs font-medium text-white">Email <span className="text-destructive">*</span></Label>
              <Input
                type="email"
                {...register("email")}
                placeholder="e.g. alex@example.com"
                className={`h-10 bg-[#141C24] border-0 text-white placeholder-[#919191] text-xs rounded-[12px] focus-visible:ring-1 focus-visible:ring-[#6887A0] ${errors.email ? "ring-1 ring-[#FF3E46]" : ""}`}
              />
              {errors.email && <p className="text-[11px] font-medium text-[#FF3E46] mt-0.5">{errors.email.message}</p>}
            </div>
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs font-medium text-white">Phone</Label>
              <Controller
                name="phone"
                control={control}
                render={({ field }) => (
                  <Input
                    type="tel"
                    maxLength={20}
                    value={field.value || ""}
                    onChange={(e) => field.onChange(formatUSPhoneNumber(e.target.value))}
                    placeholder="e.g. (555) 000-0000"
                    className={`h-10 bg-[#141C24] border-0 text-white placeholder-[#919191] text-xs rounded-[12px] focus-visible:ring-1 focus-visible:ring-[#6887A0] ${errors.phone ? "ring-1 ring-[#FF3E46]" : ""}`}
                  />
                )}
              />
              {errors.phone && <p className="text-[11px] font-medium text-[#FF3E46] mt-0.5">{errors.phone.message}</p>}
            </div>
          </div>

          {/* Row 3: Address */}
          <div className="flex flex-col gap-1.5">
            <Label className="text-xs font-medium text-white">Address <span className="text-destructive">*</span></Label>
            <Input
              type="text"
              {...register("address")}
              placeholder="Enter your address"
              className={`h-10 bg-[#141C24] border-0 text-white placeholder-[#919191] text-xs rounded-[12px] focus-visible:ring-1 focus-visible:ring-[#6887A0] ${errors.address ? "ring-1 ring-[#FF3E46]" : ""}`}
            />
            {errors.address && <p className="text-[11px] font-medium text-[#FF3E46] mt-0.5">{errors.address.message}</p>}
          </div>

          {/* Row 3.5: City, State, Zip */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs font-medium text-white">City</Label>
              <Input
                type="text"
                {...register("city")}
                placeholder="e.g. Austin"
                className={`h-10 bg-[#141C24] border-0 text-white placeholder-[#919191] text-xs rounded-[12px] focus-visible:ring-1 focus-visible:ring-[#6887A0] ${errors.city ? "ring-1 ring-[#FF3E46]" : ""}`}
              />
              {errors.city && <p className="text-[11px] font-medium text-[#FF3E46] mt-0.5">{errors.city.message}</p>}
            </div>

            <div className="flex flex-col gap-1.5">
              <Label className="text-xs font-medium text-white">State</Label>
              <Controller
                name="state"
                control={control}
                render={({ field }) => (
                  <Select
                    value={field.value || "none"}
                    onValueChange={(val) => field.onChange(val === "none" ? "" : val)}
                  >
                    <SelectTrigger className={`h-10 px-3.5 bg-[#141C24] border-0 text-white rounded-[12px] text-xs font-normal w-full justify-between shadow-none focus:ring-1 focus:ring-[#6887A0] ${errors.state ? "ring-1 ring-[#FF3E46]" : ""}`}>
                      <SelectValue placeholder="Select State" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#141C24] border border-white/10 text-white rounded-[12px] max-h-60">
                      <SelectItem value="none" className="text-[#919191] hover:bg-white/10 cursor-pointer text-xs">
                        None
                      </SelectItem>
                      {US_STATES.map((s) => (
                        <SelectItem key={s.code} value={s.code} className="text-white hover:bg-white/10 cursor-pointer text-xs">
                          {s.code} - {s.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.state && <p className="text-[11px] font-medium text-[#FF3E46] mt-0.5">{errors.state.message}</p>}
            </div>

            <div className="flex flex-col gap-1.5">
              <Label className="text-xs font-medium text-white">Zip</Label>
              <Input
                type="text"
                {...register("zip")}
                placeholder="e.g. 78759"
                className={`h-10 bg-[#141C24] border-0 text-white placeholder-[#919191] text-xs rounded-[12px] focus-visible:ring-1 focus-visible:ring-[#6887A0] ${errors.zip ? "ring-1 ring-[#FF3E46]" : ""}`}
              />
              {errors.zip && <p className="text-[11px] font-medium text-[#FF3E46] mt-0.5">{errors.zip.message}</p>}
            </div>
          </div>

          {/* Row 4: Date & Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {/* Date Select using Shadcn Calendar + Popover */}
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs font-medium text-white">Date of Birth <span className="text-destructive">*</span></Label>
              <Controller
                name="dateOfBirth"
                control={control}
                render={({ field, fieldState }) => (
                  <DatePickerInput
                    value={field.value}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                    onValidationError={(err) => handleDateValidationError("dateOfBirth", err)}
                    error={fieldState.error?.message}
                    isDob
                    label="Date of Birth"
                    placeholder="MM/DD/YYYY"
                    required
                  />
                )}
              />
            </div>

            {/* Status Select */}
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
                      <SelectItem value="Inactive" className="text-white hover:bg-white/10 cursor-pointer text-xs">
                        Inactive
                      </SelectItem>
                      <SelectItem value="Prospect" className="text-white hover:bg-white/10 cursor-pointer text-xs">
                        Prospect
                      </SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.status && <p className="text-[11px] font-medium text-[#FF3E46] mt-0.5">{errors.status.message}</p>}
            </div>
          </div>

          {/* Row 5: Notes */}
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
              disabled={createClientMutation.isPending}
              className="w-[140px] h-10 bg-gradient-to-r from-[#66859E] to-[#849EB2] text-white hover:opacity-90 rounded-[12px] text-sm font-medium border-0 shadow-sm disabled:opacity-50"
            >
              {createClientMutation.isPending ? "Creating..." : "Create Client"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
