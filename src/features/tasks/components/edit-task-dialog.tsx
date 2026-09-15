"use client";

import { useEffect } from "react";
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
import { Task } from "../types/tasks.types";
import { useUpdateTask } from "../api/tasks.service";
import { useClients } from "@/features/clients/api/clients.service";
import SearchableSelect from "@/components/ui/searchable-select";

interface EditTaskDialogProps {
  task: Task | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const editTaskSchema = z.object({
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

type EditTaskFormData = z.infer<typeof editTaskSchema>;

export default function EditTaskDialog({
  task,
  isOpen,
  onClose,
  onSuccess,
}: EditTaskDialogProps) {
  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<EditTaskFormData>({
    resolver: zodResolver(editTaskSchema),
  });

  useEffect(() => {
    if (task) {
      reset({
        title: task.title,
        desc: task.description || "",
        priority: task.priority,
        status: task.status || "To Do",
        due: task.dueDate ? new Date(task.dueDate) : new Date(),
        client: task.client?._id || "none",
      });
    }
  }, [task, reset]);

  const { data: clientsData } = useClients({ limit: 100 });
  const clients = clientsData?.data || [];

  const updateTask = useUpdateTask();

  const onSubmit = (data: EditTaskFormData) => {
    if (!task) return;

    updateTask.mutate({
      id: task._id || "",
      data: {
        title: data.title,
        description: data.desc,
        dueDate: data.due ? format(data.due, "yyyy-MM-dd") : undefined,
        priority: data.priority,
        status: data.status,
        client: data.client !== "none" ? data.client : undefined,
      }
    }, {
      onSuccess: () => {
        onClose();
        onSuccess?.();
      }
    });
  };

  if (!task) return null;

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
    const found = clientsOptions.find((c) => c.value === clientId);
    if (found) return found.label;
    return task?.client ? `${task.client.firstName || ''} ${task.client.lastName || ''}`.trim() : "Select client";
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="bg-[#0C1116] border border-white/10 text-white sm:max-w-[525px] p-7 rounded-[12px] shadow-2xl">
        <DialogHeader className="pb-1">
          <DialogTitle className="text-[28px] font-bold text-white tracking-tight font-sans">
            Edit Task
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
                  <Popover>
                    <PopoverTrigger
                      render={
                        <button
                          type="button"
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
                        selected={field.value}
                        onSelect={field.onChange}
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
                  let options = clientOptionsWithNone;
                  // If the currently selected client is not in the options (e.g., from old data or paginated out), add it
                  if (field.value && field.value !== "none" && !clientsOptions.find(c => c.value === field.value)) {
                    options = [
                      { label: "None", value: "none" },
                      { label: getClientDisplayName(field.value), value: field.value },
                      ...clientsOptions
                    ];
                  }

                  return (
                    <SearchableSelect
                      options={options}
                      value={field.value || "none"}
                      onChange={field.onChange}
                      placeholder="Select Client..."
                      searchPlaceholder="Search client..."
                      className={errors.client ? "ring-1 ring-[#FF3E46]" : ""}
                    />
                  );
                }}
              />
            </div>
          </div>

          {/* 5. Footer Buttons */}
          <div className="pt-3 flex items-center justify-center gap-3">
            <Button
              type="button"
              onClick={onClose}
              className="w-[150px] h-10 bg-[#2B343D] hover:bg-[#394551] text-white rounded-[12px] text-sm font-medium border-0 cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="w-[150px] h-10 bg-gradient-to-r from-[#66859E] to-[#849EB2] hover:opacity-95 text-white rounded-[12px] text-sm font-medium border-0 shadow-md cursor-pointer"
              disabled={updateTask.isPending}
            >
              {updateTask.isPending ? "Updating..." : "Update Task"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
