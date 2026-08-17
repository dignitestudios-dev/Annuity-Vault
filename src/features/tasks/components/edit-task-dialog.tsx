"use client";

import { useEffect } from "react";
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
import { Task } from "../types/tasks.types";
import { useUpdateTask } from "../api/tasks.service";
import { useUsers } from "@/features/users/api/users.service";
import { useClients } from "@/features/clients/api/clients.service";

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
  status: z.enum(["To do", "In progress", "Done"], {
    message: "Please select a status",
  }),
  due: z.string().min(1, "Due date is required"),
  assignedTo: z.string().min(1, "Assigned advisor is required"),
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
        status: task.status,
        due: task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : "",
        assignedTo: task.assignedTo?._id || "",
        client: task.client?._id || "none",
      });
    }
  }, [task, reset]);

  const { data: usersData } = useUsers({ limit: 100, status: "Active" });
  const advisors = usersData?.data?.filter(u => u.role === "Advisor" || u.role === "Admin") || [];

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
        dueDate: data.due,
        priority: data.priority,
        status: data.status,
        assignedTo: data.assignedTo,
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
            </div>
          </div>

          {/* 4. Due Date & Assigned To (2 Columns) */}
          <div className="grid grid-cols-2 gap-3">
            {/* Due Date */}
            <div className="space-y-1.5">
              <Label className="text-sm font-medium text-white">Due Date <span className="text-destructive">*</span></Label>
              <Input
                type="date"
                {...register("due")}
                className="h-10 bg-[#141C24] border-0 text-white rounded-[12px] text-xs sm:text-sm px-3.5 focus:ring-1 focus:ring-[#6887A0] [color-scheme:dark]"
              />
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
                      {advisors.map((advisor) => (
                        <SelectItem key={advisor._id} value={advisor._id} className="text-xs sm:text-sm text-white hover:bg-white/10 cursor-pointer">
                          {advisor.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
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
                    <SelectItem value="none" className="text-xs sm:text-sm text-white hover:bg-white/10 cursor-pointer text-gray-400">
                      None
                    </SelectItem>
                    {clients.map((client) => (
                      <SelectItem key={client.id} value={client.id} className="text-xs sm:text-sm text-white hover:bg-white/10 cursor-pointer">
                        {client.firstName} {client.lastName}
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
