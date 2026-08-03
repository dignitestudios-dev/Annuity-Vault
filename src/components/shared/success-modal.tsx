"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Check } from "lucide-react";

interface SuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
}

export default function SuccessModal({
  isOpen,
  onClose,
  title = "Client Created!",
  description = "Your client folder has been created successfully!",
}: SuccessModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[420px] border-white/10 p-8 flex flex-col items-center justify-center text-center shadow-2xl">
        <DialogHeader className="flex flex-col items-center gap-4 text-center sm:text-center w-full">
          {/* Circular Badge Icon */}
          <div className="w-16 h-16 rounded-full bg-[#6887A0] flex items-center justify-center flex-shrink-0 my-2 shadow-md">
            <Check className="w-8 h-8 text-white stroke-[3px]" />
          </div>

          <DialogTitle className="text-2xl sm:text-3xl font-semibold text-white tracking-tight font-sans text-center">
            {title}
          </DialogTitle>
          <DialogDescription className="text-sm sm:text-base font-normal text-[#919191] font-sans text-center max-w-[320px]">
            {description}
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}
