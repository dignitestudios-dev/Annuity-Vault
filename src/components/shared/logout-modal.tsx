"use client";

import { LogOut } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface LogoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export default function LogoutModal({
  isOpen,
  onClose,
  onConfirm,
}: LogoutModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        showCloseButton={false}
        className="sm:max-w-[340px] bg-[#0C1116] border-white/10 shadow-2xl p-6 rounded-2xl flex flex-col items-center justify-center text-center gap-4 font-sans"
      >
        {/* Red Logout Icon Badge matching Figma design screenshot */}
        <div className="w-[52px] h-[52px] rounded-2xl bg-[#FF0000] flex items-center justify-center shadow-md flex-shrink-0">
          <LogOut className="w-6 h-6 text-white ml-0.5" />
        </div>

        {/* Modal Title & Description */}
        <DialogHeader className="flex flex-col items-center justify-center gap-2 text-center">
          <DialogTitle className="text-2xl font-bold text-white tracking-tight text-center">
            Logout
          </DialogTitle>
          <DialogDescription className="text-sm text-[#919191] text-center leading-relaxed max-w-[220px]">
            Are you sure you want to logout your account?
          </DialogDescription>
        </DialogHeader>

        {/* Dialog Action Buttons */}
        <DialogFooter className="pt-2 flex flex-row items-center justify-center gap-3 sm:justify-center w-full">
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            className="flex-1 h-11 bg-[#2B343D] text-white hover:bg-[#394551] rounded-xl text-sm font-semibold border-0 cursor-pointer"
          >
            No
          </Button>
          <Button
            type="button"
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="flex-1 h-11 bg-[#FF0000] text-white hover:bg-red-600 rounded-xl text-sm font-semibold border-0 shadow-sm cursor-pointer"
          >
            Yes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
