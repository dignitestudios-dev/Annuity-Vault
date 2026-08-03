"use client";

import { Check } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

interface ArchiveModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
}

export default function ArchiveModal({
  isOpen,
  onClose,
  title = "File Moved To Archive!",
  description = "Your file has been successfully moved to Archive. It will remain there for 60 days, during which you can restore it if needed. After 60 days, the file will be permanently deleted.",
}: ArchiveModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        showCloseButton={true}
        className="sm:max-w-[434px] bg-[#0C1116] border-white/10 shadow-2xl p-8 rounded-[12px] flex flex-col items-center justify-center text-center gap-6"
      >
        {/* Centered Muted Blue Circle Checkmark Badge (#6887A0) */}
        <div className="w-[80px] h-[80px] rounded-full bg-[#6887A0] flex items-center justify-center flex-shrink-0 shadow-md">
          <Check className="w-10 h-10 text-white stroke-[3]" />
        </div>

        {/* Modal Header Title & Description */}
        <DialogHeader className="flex flex-col items-center justify-center gap-3 text-center p-0">
          <DialogTitle className="text-2xl sm:text-[28px] font-semibold text-white tracking-tight text-center capitalize leading-tight">
            {title}
          </DialogTitle>
          <DialogDescription className="text-sm sm:text-base text-[#919191] text-center leading-relaxed font-normal p-0 max-w-[360px]">
            {description}
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}
