"use client";

import { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Calendar as CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import { useCreateTask } from "../api/tasks.service";
import { useClients } from "@/features/clients/api/clients.service";
import SearchableSelect from "@/components/ui/searchable-select";
import toast from "react-hot-toast";

export interface TaskItem {
  id: string;
  title: string;
  priority: "Urgent" | "High" | "Medium" | "Low";
  desc: string;
  due: string;
  status: "To Do" | "In Progress" | "Done";
  client?: string;
}

export interface NewTaskDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  defaultClient?: { id: string; name: string } | string;
  defaultDate?: string;
}

// Zod Validation Schema
const newTaskSchema = z.object({
  title: z
    .string()
    .min(1, "Title is required")
    .max(100, "Title must be less than 100 characters"),
  desc: z.string().max(500, "Description must be less than 500 characters").optional().or(z.literal("")),
  priority: z.enum(["Urgent", "High", "Medium", "Low"], {
    message: "Please select a priority",
  }),
  status: z.enum(["To Do", "In Progress", "Done"], {
    message: "Please select a status",
  }),
  due: z.date({ message: "Due date is required" }),
  client: z.string().optional(),
});

type NewTaskFormData = z.infer<typeof newTaskSchema>;

export default function NewTaskDialog({
  isOpen,
  onClose,
  onSuccess,
  defaultClient,
  defaultDate,
}: NewTaskDialogProps) {
  const [isDueOpen, setIsDueOpen] = useState(false);
  const selectedClientId = typeof defaultClient === "object" ? defaultClient?.id : defaultClient;
  const selectedClientName = typeof defaultClient === "object" ? defaultClient?.name : undefined;

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<NewTaskFormData>({
    resolver: zodResolver(newTaskSchema),
    defaultValues: {
      title: "",
      desc: "",
      priority: "Medium",
      status: "To Do",
      due: defaultDate ? new Date(defaultDate) : new Date(),
      client: selectedClientId || "none",
    },
  });

  useEffect(() => {
    if (isOpen) {
      reset({
        title: "",
        desc: "",
        priority: "Medium",
        status: "To Do",
        due: defaultDate ? new Date(defaultDate) : new Date(),
        client: selectedClientId || "none",
      });
    }
  }, [isOpen, selectedClientId, defaultDate, reset]);

  const { data: clientsData } = useClients({ limit: 100 });
  const clients = clientsData?.data || [];

  const clientsOptions = clients.map((c) => ({
    label: `${c.firstName} ${c.lastName}`,
    value: c._id || c.id,
  }));

  const clientOptionsWithNone = [
    { label: "None", value: "none" },
    ...clientsOptions
  ];

  const getClientDisplayName = (clientId?: string) => {
    if (!clientId || clientId === "none") return "None";
    if (selectedClientId && clientId === selectedClientId && selectedClientName) {
      return selectedClientName;
    }
    const found = clientsOptions.find((c) => c.value === clientId);
    if (found) return found.label;
    if (selectedClientName) return selectedClientName;
    return "Select client";
  };

  const createTask = useCreateTask();

  const onSubmit = (data: NewTaskFormData) => {
    createTask.mutate({
      title: data.title,
      description: data.desc,
      dueDate: data.due ? format(data.due, "yyyy-MM-dd") : format(new Date(), "yyyy-MM-dd"),
      priority: data.priority,
      status: data.status,
      client: data.client && data.client !== "none" ? data.client : undefined,
    }, {
      onSuccess: () => {
        toast.success("Task created successfully!");
        reset();
        onClose();
        onSuccess?.();
      },
      onError: (err: any) => {
        toast.error(err?.message || "Failed to create task");
      }
    });
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="bg-[#0C1116] border border-white/10 text-white sm:max-w-[525px] p-7 rounded-[12px] shadow-2xl">
        <DialogHeader className="pb-1">
          <DialogTitle className="text-[28px] font-bold text-white tracking-tight font-sans">
            New Task
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3.5 pt-1" noValidate>
          {/* 1. Title Field */}
          <div className="space-y-1.5">
            <Label className="text-sm font-medium text-white">Title <span className="text-destructive">*</span></Label>
            <Input
              {...register("title")}
              placeholder="Enter title here"
              className={`h-10 bg-[#141C24] border-0 text-white placeholder:text-[#727272] focus:ring-1 focus:ring-[#6887A0] rounded-[12px] text-xs sm:text-sm px-3.5 ${
                errors.title ? "ring-1 ring-[#FF3E46]" : ""
              }`}
            />
            {errors.title && (
              <p className="text-[11px] font-medium text-[#FF3E46] mt-1">
                {errors.title.message}
              </p>
            )}
          </div>

          {/* 2. Description Field */}
          <div className="space-y-1.5">
            <Label className="text-sm font-medium text-white">Description</Label>
            <Textarea
              {...register("desc")}
              placeholder=""
              className="h-[91px] min-h-[91px] bg-[#141C24] border-0 text-white placeholder:text-[#727272] focus:ring-1 focus:ring-[#6887A0] rounded-[12px] text-xs sm:text-sm p-3.5 resize-none"
            />
            {errors.desc && (
              <p className="text-[11px] font-medium text-[#FF3E46] mt-1">
                {errors.desc.message}
              </p>
            )}
          </div>

          {/* 3. Priority & Status (2 Columns) */}
          <div className="grid grid-cols-2 gap-3">
            {/* Priority */}
            <div className="space-y-1.5">
              <Label className="text-sm font-medium text-white">Priority <span className="text-destructive">*</span></Label>
              <Controller
                name="priority"
                control={control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={(val: string | null) => val && field.onChange(val)}>
                    <SelectTrigger className="h-10 bg-[#141C24] border-0 text-white rounded-[12px] text-xs sm:text-sm justify-between px-3.5 shadow-none focus:ring-1 focus:ring-[#6887A0]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-[#141C24] border border-white/10 text-white rounded-[12px]">
                      <SelectItem value="Urgent" className="text-xs sm:text-sm text-white hover:bg-white/10 cursor-pointer">
                        Urgent
                      </SelectItem>
                      <SelectItem value="High" className="text-xs sm:text-sm text-white hover:bg-white/10 cursor-pointer">
                        High
                      </SelectItem>
                      <SelectItem value="Medium" className="text-xs sm:text-sm text-white hover:bg-white/10 cursor-pointer">
                        Medium
                      </SelectItem>
                      <SelectItem value="Low" className="text-xs sm:text-sm text-white hover:bg-white/10 cursor-pointer">
                        Low
                      </SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.priority && (
                <p className="text-[11px] font-medium text-[#FF3E46] mt-1">
                  {errors.priority.message}
                </p>
              )}
            </div>

            {/* Status */}
            <div className="space-y-1.5">
              <Label className="text-sm font-medium text-white">Status <span className="text-destructive">*</span></Label>
              <Controller
                name="status"
                control={control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={(val: string | null) => val && field.onChange(val)}>
                    <SelectTrigger className="h-10 bg-[#141C24] border-0 text-white rounded-[12px] text-xs sm:text-sm justify-between px-3.5 shadow-none focus:ring-1 focus:ring-[#6887A0]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-[#141C24] border border-white/10 text-white rounded-[12px]">
                      <SelectItem value="To Do" className="text-xs sm:text-sm text-white hover:bg-white/10 cursor-pointer">
                        To Do
                      </SelectItem>
                      <SelectItem value="In Progress" className="text-xs sm:text-sm text-white hover:bg-white/10 cursor-pointer">
                        In Progress
                      </SelectItem>
                      <SelectItem value="Done" className="text-xs sm:text-sm text-white hover:bg-white/10 cursor-pointer">
                        Done
                      </SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.status && (
                <p className="text-[11px] font-medium text-[#FF3E46] mt-1">
                  {errors.status.message}
                </p>
              )}
            </div>
          </div>

          {/* 4. Due Date & Client (2 Columns) */}
          <div className="grid grid-cols-2 gap-3">
            {/* Due Date */}
            <div className="space-y-1.5">
              <Label className="text-sm font-medium text-white">Due Date <span className="text-destructive">*</span></Label>
              <Controller
                name="due"
                control={control}
                render={({ field }) => (
                  <Popover open={isDueOpen} onOpenChange={setIsDueOpen}>
                    <PopoverTrigger
                      render={
                        <button
                          type="button"
                          onClick={() => setIsDueOpen(true)}
                          className={`h-10 w-full bg-[#141C24] border-0 text-white text-xs sm:text-sm rounded-[12px] px-3.5 flex items-center justify-between font-sans outline-none focus:ring-1 focus:ring-[#6887A0] ${
                            errors.due ? "ring-1 ring-[#FF3E46]" : ""
                          }`}
                        >
                          <span className={field.value ? "text-white" : "text-[#727272]"}>
                            {field.value ? format(field.value, "MM/dd/yyyy") : "mm/dd/yyyy"}
                          </span>
                          <CalendarIcon className="w-4 h-4 text-[#727272]" />
                        </button>
                      }
                    />
                    <PopoverContent className="w-auto p-0 bg-[#141C24] border border-white/10 text-white rounded-[12px]">
                      <Calendar
                        mode="single"
                        required
                        selected={field.value}
                        onSelect={(date) => {
                          if (date) {
                            field.onChange(date);
                            setIsDueOpen(false);
                          }
                        }}
                        defaultMonth={field.value || new Date()}
                        captionLayout="dropdown"
                        startMonth={new Date(1950, 0)}
                        endMonth={new Date(2050, 11)}
                        className="p-3 bg-[#141C24] text-white [color-scheme:dark]"
                      />
                    </PopoverContent>
                  </Popover>
                )}
              />
              {errors.due && (
                <p className="text-[11px] font-medium text-[#FF3E46] mt-1">
                  {errors.due.message}
                </p>
              )}
            </div>

            {/* Client (Optional) */}
            <div className="space-y-1.5">
              <Label className="text-sm font-medium text-white">Client (Optional)</Label>
              <Controller
                name="client"
                control={control}
                render={({ field }) => {
                  const options = selectedClientId 
                    ? [{ label: selectedClientName || getClientDisplayName(selectedClientId), value: selectedClientId }]
                    : clientOptionsWithNone;

                  return (
                    <div className={selectedClientId ? "opacity-70 pointer-events-none" : ""}>
                      <SearchableSelect
                        options={options}
                        value={field.value || "none"}
                        onChange={field.onChange}
                        placeholder="Select Client..."
                        searchPlaceholder="Search client..."
                        className={errors.client ? "ring-1 ring-[#FF3E46]" : ""}
                      />
                    </div>
                  );
                }}
              />
            </div>
          </div>

          {/* 5. Footer Buttons */}
          <div className="pt-3 flex items-center justify-center gap-3">
            <Button
              type="button"
              onClick={handleClose}
              className="w-[150px] h-10 bg-[#2B343D] hover:bg-[#394551] text-white rounded-[12px] text-sm font-medium border-0 cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="w-[150px] h-10 bg-gradient-to-r from-[#66859E] to-[#849EB2] hover:opacity-95 text-white rounded-[12px] text-sm font-medium border-0 shadow-md cursor-pointer"
              disabled={createTask.isPending}
            >
              {createTask.isPending ? "Creating..." : "Create Task"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
