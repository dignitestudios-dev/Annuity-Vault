"use client";

import { RotateCcw } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface RestoreModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
}

export default function RestoreModal({
  isOpen,
  onClose,
  onConfirm,
  title = "Restore Item",
  description = "Are you sure you want to restore this archived item back to active records?",
  confirmText = "Yes, Restore",
  cancelText = "Cancel",
}: RestoreModalProps) {
  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent showCloseButton={false} className="sm:max-w-[360px] bg-[#0C1116] border-white/10 shadow-2xl p-6 rounded-[12px] flex flex-col items-center justify-center text-center gap-4">
        <div className="w-[48px] h-[48px] rounded-full bg-[#42CD7F]/10 flex items-center justify-center flex-shrink-0 border border-[#42CD7F]/20">
          <RotateCcw className="w-[24px] h-[24px] text-[#42CD7F]" />
        </div>

        <DialogHeader className="flex flex-col items-center justify-center gap-2 text-center">
          <DialogTitle className="text-xl font-semibold text-white tracking-tight text-center">
            {title}
          </DialogTitle>
          <DialogDescription className="text-sm text-[#919191] text-center leading-relaxed">
            {description}
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="pt-2 flex flex-row items-center justify-center gap-2 sm:justify-center w-full">
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            className="flex-1 h-[42px] bg-[#2B343D] text-white hover:bg-[#394551] rounded-[10px] text-xs font-semibold border-0 cursor-pointer"
          >
            {cancelText}
          </Button>
          <Button
            type="button"
            onClick={handleConfirm}
            className="flex-1 h-[42px] bg-[#42CD7F] text-[#181818] hover:bg-emerald-400 rounded-[10px] text-xs font-semibold border-0 shadow-sm cursor-pointer"
          >
            {confirmText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
