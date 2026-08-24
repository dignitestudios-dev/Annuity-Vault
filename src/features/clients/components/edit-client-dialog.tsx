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
import { Client } from "@/features/clients/types/clients.types";
import { useUpdateClient } from "@/features/clients/api/clients.service";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import toast from "react-hot-toast";
import { useEffect } from "react";

const editClientSchema = z.object({
  firstName: z.string().min(1, "First Name is required").max(50, "First Name must be less than 50 characters"),
  lastName: z.string().min(1, "Last Name is required").max(50, "Last Name must be less than 50 characters"),
  email: z.string().min(1, "Email is required").email("Invalid email address").max(100, "Email must be less than 100 characters"),
  phone: z.string().regex(/^\+?[\d\s\-\(\)]+$/, "Invalid phone number format").min(10, "Phone number too short").max(20, "Phone number too long").optional().or(z.literal("")),
  address: z.string().min(1, "Address is required").max(200, "Address must be less than 200 characters"),
  status: z.enum(["Active", "Inactive", "Prospect"], {
    message: "Please select a valid status",
  }),
  dateOfBirth: z.date().optional(),
  notes: z.string().max(500, "Notes must be less than 500 characters").optional().or(z.literal("")),
});

type EditClientFormData = z.infer<typeof editClientSchema>;

interface EditClientDialogProps {
  isOpen: boolean;
  onClose: () => void;
  client: Client;
  onUpdateSuccess?: () => void;
}

export default function EditClientDialog({
  isOpen,
  onClose,
  client,
  onUpdateSuccess,
}: EditClientDialogProps) {
  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<EditClientFormData>({
    resolver: zodResolver(editClientSchema),
    defaultValues: {
      firstName: client.firstName,
      lastName: client.lastName,
      email: client.email,
      phone: client.phone || "",
      address: client.address || "",
      status: (client.status as any) || "Active",
      dateOfBirth: client.dateOfBirth ? new Date(client.dateOfBirth) : undefined,
      notes: "",
    },
  });

  useEffect(() => {
    if (isOpen) {
      reset({
        firstName: client.firstName,
        lastName: client.lastName,
        email: client.email,
        phone: client.phone || "",
        address: client.address || "",
        status: (client.status as any) || "Active",
        dateOfBirth: client.dateOfBirth ? new Date(client.dateOfBirth) : undefined,
        notes: "",
      });
    }
  }, [client, isOpen, reset]);

  const updateClientMutation = useUpdateClient();

  const onSubmit = (data: EditClientFormData) => {
    updateClientMutation.mutate(
      {
        id: client.id,
        data: {
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
          phone: data.phone,
          address: data.address,
          status: data.status,
          dateOfBirth: data.dateOfBirth ? format(data.dateOfBirth, "yyyy-MM-dd") : undefined,
          notes: data.notes,
        }
      },
      {
        onSuccess: () => {
          toast.success("Client updated successfully!");
          onClose();
          if (onUpdateSuccess) onUpdateSuccess();
        },
      }
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[525px] border-white/10 shadow-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-white tracking-tight">
            Edit Client
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
                placeholder="Enter Email"
                className={`h-10 bg-[#141C24] border-0 text-white placeholder-[#919191] text-xs rounded-[12px] focus-visible:ring-1 focus-visible:ring-[#6887A0] ${errors.email ? "ring-1 ring-[#FF3E46]" : ""}`}
              />
              {errors.email && <p className="text-[11px] font-medium text-[#FF3E46] mt-0.5">{errors.email.message}</p>}
            </div>
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs font-medium text-white">Phone</Label>
              <Input
                type="tel"
                {...register("phone")}
                placeholder="Enter Phone No."
                className={`h-10 bg-[#141C24] border-0 text-white placeholder-[#919191] text-xs rounded-[12px] focus-visible:ring-1 focus-visible:ring-[#6887A0] ${errors.phone ? "ring-1 ring-[#FF3E46]" : ""}`}
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

          {/* Row 4: Date & Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {/* Date Select using Shadcn Calendar + Popover */}
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs font-medium text-white">Date</Label>
              <Controller
                name="dateOfBirth"
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
              onClick={onClose}
              className="w-[140px] h-10 bg-[#2B343D] text-white hover:bg-[#394551] rounded-[12px] text-sm font-medium border-0"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={updateClientMutation.isPending}
              className="w-[140px] h-10 bg-gradient-to-r from-[#66859E] to-[#849EB2] text-white hover:opacity-90 rounded-[12px] text-sm font-medium border-0 shadow-sm disabled:opacity-50"
            >
              {updateClientMutation.isPending ? "Updating..." : "Update Client"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
