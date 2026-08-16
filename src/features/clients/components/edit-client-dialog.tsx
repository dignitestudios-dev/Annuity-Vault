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
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    client.dateOfBirth ? new Date(client.dateOfBirth) : undefined
  );
  const [formData, setFormData] = useState({
    firstName: client.firstName,
    lastName: client.lastName,
    email: client.email,
    phone: client.phone || "",
    address: client.address || "",
    status: client.status || "Active",
    notes: client.notes || "",
  });

  const updateClientMutation = useUpdateClient();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateClientMutation.mutate(
      {
        id: client.id,
        data: {
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          phone: formData.phone,
          address: formData.address,
          status: formData.status,
          dateOfBirth: selectedDate ? format(selectedDate, "yyyy-MM-dd") : undefined,
          notes: formData.notes,
        }
      },
      {
        onSuccess: () => {
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

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 font-sans py-2">
          {/* Row 1: First Name & Last Name */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs font-medium text-white">First Name</Label>
              <Input
                type="text"
                value={formData.firstName}
                onChange={(e) =>
                  setFormData({ ...formData, firstName: e.target.value })
                }
                placeholder="Enter First Name"
                className="h-10 bg-[#141C24] border-0 text-white placeholder-[#919191] text-xs rounded-[12px]"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs font-medium text-white">Last Name</Label>
              <Input
                type="text"
                value={formData.lastName}
                onChange={(e) =>
                  setFormData({ ...formData, lastName: e.target.value })
                }
                placeholder="Enter Last Name"
                className="h-10 bg-[#141C24] border-0 text-white placeholder-[#919191] text-xs rounded-[12px]"
              />
            </div>
          </div>

          {/* Row 2: Email & Phone */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs font-medium text-white">Email</Label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                placeholder="Enter Email"
                className="h-10 bg-[#141C24] border-0 text-white placeholder-[#919191] text-xs rounded-[12px]"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs font-medium text-white">Phone</Label>
              <Input
                type="tel"
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
                placeholder="Enter Phone No."
                className="h-10 bg-[#141C24] border-0 text-white placeholder-[#919191] text-xs rounded-[12px]"
              />
            </div>
          </div>

          {/* Row 3: Address */}
          <div className="flex flex-col gap-1.5">
            <Label className="text-xs font-medium text-white">Address</Label>
            <Input
              type="text"
              value={formData.address}
              onChange={(e) =>
                setFormData({ ...formData, address: e.target.value })
              }
              placeholder="Enter your address"
              className="h-10 bg-[#141C24] border-0 text-white placeholder-[#919191] text-xs rounded-[12px]"
            />
          </div>

          {/* Row 4: Date & Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {/* Date Select using Shadcn Calendar + Popover */}
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs font-medium text-white">Date</Label>
              <Popover>
                <PopoverTrigger
                  render={
                    <button
                      type="button"
                      className="h-10 w-full bg-[#141C24] border-0 text-white text-xs rounded-[12px] px-3.5 flex items-center justify-between font-sans outline-none focus:ring-1 focus:ring-[#6887A0]"
                    >
                      <span className={selectedDate ? "text-white" : "text-[#919191]"}>
                        {selectedDate ? format(selectedDate, "MM/dd/yyyy") : "mm/dd/yyyy"}
                      </span>
                      <CalendarIcon className="w-4 h-4 text-[#919191]" />
                    </button>
                  }
                />
                <PopoverContent className="w-auto p-0 bg-[#141C24] border border-white/10 text-white rounded-[12px]">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Status Select */}
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs font-medium text-white">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(val: string | null) =>
                  setFormData({
                    ...formData,
                    status: val || "Active",
                  })
                }
              >
                <SelectTrigger className="h-10 px-3.5 bg-[#141C24] border-0 text-white rounded-[12px] text-xs font-normal w-full justify-between shadow-none">
                  <SelectValue placeholder="Active" />
                </SelectTrigger>
                <SelectContent className="bg-[#141C24] border border-white/10 text-white rounded-[12px]">
                  <SelectItem value="Active" className="text-white hover:bg-white/10 cursor-pointer text-xs">
                    Active
                  </SelectItem>
                  <SelectItem value="Archived" className="text-white hover:bg-white/10 cursor-pointer text-xs">
                    Archived
                  </SelectItem>
                  <SelectItem value="Inactive" className="text-white hover:bg-white/10 cursor-pointer text-xs">
                    Inactive
                  </SelectItem>
                  <SelectItem value="Prospect" className="text-white hover:bg-white/10 cursor-pointer text-xs">
                    Prospect
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Row 5: Notes */}
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
