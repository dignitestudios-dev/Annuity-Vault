"use client";

import Link from "next/link";
import { ArrowLeft, Edit2, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface ClientProfileHeaderProps {
  status: string;
  onEditClick: () => void;
  onDeleteClick?: () => void;
}

export default function ClientProfileHeader({
  status,
  onEditClick,
  onDeleteClick,
}: ClientProfileHeaderProps) {
  return (
    <div className="w-full flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      {/* Back Link */}
      <Link
        href="/dashboard/clients"
        className="flex items-center gap-2 text-sm font-medium text-white hover:text-white/80 transition-colors"
      >
        <ArrowLeft className="w-4 h-4 text-white" />
        <span>Back</span>
      </Link>

      {/* Status Badge & Action Buttons */}
      <div className="flex items-center gap-3">
        <Badge className="px-3 py-1 rounded-[8px] bg-[#4F39F6] text-white font-medium text-xs border-0">
          {status}
        </Badge>
        <button
          onClick={onEditClick}
          className="h-9 px-4 bg-gradient-to-r from-[#66859E] to-[#849EB2] text-white hover:opacity-90 rounded-[12px] text-sm font-medium transition-all shadow-sm flex items-center gap-2"
        >
          <Edit2 className="w-3.5 h-3.5 text-white" />
          <span>Edit</span>
        </button>
        <button
          onClick={onDeleteClick}
          className="h-9 px-4 bg-[#FF0000] text-white hover:bg-red-600 rounded-[12px] text-sm font-medium transition-colors shadow-sm flex items-center gap-2"
        >
          <Trash2 className="w-3.5 h-3.5 text-white" />
          <span>Delete</span>
        </button>
      </div>
    </div>
  );
}
