"use client";

import { AlertTriangle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface DeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
}

export default function DeleteModal({
  isOpen,
  onClose,
  onConfirm,
  title = "Delete Client",
  description = "Are you sure you want to delete this client?",
  confirmText = "Yes, Delete Now",
  cancelText = "No, keep it",
}: DeleteModalProps) {
  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent showCloseButton={false} className="sm:max-w-[340px] bg-[#0C1116] border-white/10 shadow-2xl p-6 rounded-[12px] flex flex-col items-center justify-center text-center gap-4">
        {/* Red Danger Warning Triangle Icon */}
        <div className="w-[42px] h-[42px] flex items-center justify-center flex-shrink-0">
          <AlertTriangle className="w-[42px] h-[42px] text-[#FF0000] fill-[#FF0000]/20 stroke-[#FF0000] stroke-[2]" />
        </div>

        {/* Modal Header & Title */}
        <DialogHeader className="flex flex-col items-center justify-center gap-2 text-center">
          <DialogTitle className="text-xl font-semibold text-white tracking-tight text-center">
            {title}
          </DialogTitle>
          <DialogDescription className="text-sm text-[#919191] text-center leading-relaxed max-w-[230px]">
            {description}
          </DialogDescription>
        </DialogHeader>

        {/* Dialog Actions Footer */}
        <DialogFooter className="pt-2 flex flex-row items-center justify-center gap-2 sm:justify-center w-full">
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            className="flex-1 h-[44px] bg-[#2B343D] text-white hover:bg-[#394551] rounded-[12px] text-xs font-semibold border-0"
          >
            {cancelText}
          </Button>
          <Button
            type="button"
            onClick={handleConfirm}
            className="flex-1 h-[44px] bg-[#FF0000] text-white hover:bg-red-600 rounded-[12px] text-xs font-semibold border-0 shadow-sm"
          >
            {confirmText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
