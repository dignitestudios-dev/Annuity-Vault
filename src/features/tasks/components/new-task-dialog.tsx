"use client";

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
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
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

export interface TaskItem {
  id: string;
  title: string;
  priority: "Urgent" | "High" | "Medium" | "Low";
  desc: string;
  due: string;
  status: "To do" | "In progress" | "Done";
  client?: string;
  assignedTo?: string;
}

interface NewTaskDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onAddTask: (task: TaskItem) => void;
}

const CLIENT_OPTIONS = [
  "Jacob Thompson",
  "Eleanor Vance",
  "Marcus Brody",
  "Sophia Martinez",
  "Robert Chen",
  "Amelia Davis",
  "David Wilson",
];

const ADVISOR_OPTIONS = [
  "Jordan Reed",
  "Adam Smith",
  "Sarah Connor",
  "Michael Scott",
];

// Zod Validation Schema
const newTaskSchema = z.object({
  title: z
    .string()
    .min(1, "Title is required")
    .max(100, "Title must be less than 100 characters"),
  desc: z.string().optional(),
  priority: z.enum(["Urgent", "High", "Medium", "Low"], {
    message: "Please select a priority",
  }),
  status: z.enum(["To do", "In progress", "Done"], {
    message: "Please select a status",
  }),
  due: z.string().min(1, "Due date is required"),
  assignedTo: z.string().min(1, "Assigned advisor is required"),
  client: z.string().optional(),
});

type NewTaskFormData = z.infer<typeof newTaskSchema>;

export default function NewTaskDialog({
  isOpen,
  onClose,
  onAddTask,
}: NewTaskDialogProps) {
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
      status: "To do",
      due: "2026-06-23",
      assignedTo: "Jordan Reed",
      client: "Jacob Thompson",
    },
  });

  const onSubmit = (data: NewTaskFormData) => {
    onAddTask({
      id: `t-${Date.now()}`,
      title: data.title,
      desc: data.desc || "No description provided.",
      due: data.due,
      priority: data.priority,
      status: data.status,
      assignedTo: data.assignedTo,
      client: data.client,
    });

    reset();
    onClose();
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
            <Label className="text-sm font-medium text-white">Title</Label>
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
              <Label className="text-sm font-medium text-white">Priority</Label>
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
              <Label className="text-sm font-medium text-white">Status</Label>
              <Controller
                name="status"
                control={control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={(val: string | null) => val && field.onChange(val)}>
                    <SelectTrigger className="h-10 bg-[#141C24] border-0 text-white rounded-[12px] text-xs sm:text-sm justify-between px-3.5 shadow-none focus:ring-1 focus:ring-[#6887A0]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-[#141C24] border border-white/10 text-white rounded-[12px]">
                      <SelectItem value="To do" className="text-xs sm:text-sm text-white hover:bg-white/10 cursor-pointer">
                        Todo
                      </SelectItem>
                      <SelectItem value="In progress" className="text-xs sm:text-sm text-white hover:bg-white/10 cursor-pointer">
                        In progress
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

          {/* 4. Due Date & Assigned To (2 Columns) */}
          <div className="grid grid-cols-2 gap-3">
            {/* Due Date */}
            <div className="space-y-1.5">
              <Label className="text-sm font-medium text-white">Due Date</Label>
              <Input
                type="date"
                {...register("due")}
                className={`h-10 bg-[#141C24] border-0 text-white rounded-[12px] text-xs sm:text-sm px-3.5 focus:ring-1 focus:ring-[#6887A0] [color-scheme:dark] ${
                  errors.due ? "ring-1 ring-[#FF3E46]" : ""
                }`}
              />
              {errors.due && (
                <p className="text-[11px] font-medium text-[#FF3E46] mt-1">
                  {errors.due.message}
                </p>
              )}
            </div>

            {/* Assigned To */}
            <div className="space-y-1.5">
              <Label className="text-sm font-medium text-white">Assigned To</Label>
              <Controller
                name="assignedTo"
                control={control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={(val: string | null) => val && field.onChange(val)}>
                    <SelectTrigger className="h-10 bg-[#141C24] border-0 text-white rounded-[12px] text-xs sm:text-sm justify-between px-3.5 shadow-none focus:ring-1 focus:ring-[#6887A0]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-[#141C24] border border-white/10 text-white rounded-[12px]">
                      {ADVISOR_OPTIONS.map((name) => (
                        <SelectItem key={name} value={name} className="text-xs sm:text-sm text-white hover:bg-white/10 cursor-pointer">
                          {name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.assignedTo && (
                <p className="text-[11px] font-medium text-[#FF3E46] mt-1">
                  {errors.assignedTo.message}
                </p>
              )}
            </div>
          </div>

          {/* 5. Client (Optional) */}
          <div className="space-y-1.5">
            <Label className="text-sm font-medium text-white">Client (Optional)</Label>
            <Controller
              name="client"
              control={control}
              render={({ field }) => (
                <Select value={field.value} onValueChange={(val: string | null) => val && field.onChange(val)}>
                  <SelectTrigger className="h-10 bg-[#141C24] border-0 text-white rounded-[12px] text-xs sm:text-sm justify-between px-3.5 shadow-none focus:ring-1 focus:ring-[#6887A0]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#141C24] border border-white/10 text-white rounded-[12px]">
                    {CLIENT_OPTIONS.map((cName) => (
                      <SelectItem key={cName} value={cName} className="text-xs sm:text-sm text-white hover:bg-white/10 cursor-pointer">
                        {cName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          {/* 6. Footer Buttons */}
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
            >
              Create Task
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
