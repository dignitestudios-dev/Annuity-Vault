import React from "react";
import { LucideIcon, Inbox } from "lucide-react";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  className?: string;
}

export function EmptyState({
  icon: Icon = Inbox,
  title,
  description,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center w-full min-h-[200px] bg-[#141C24] border border-[#0F1F3D]/20 rounded-xl p-8 text-center",
        className
      )}
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#1A2634] mb-4">
        <Icon className="h-6 w-6 text-[#919191]" />
      </div>
      <h3 className="text-sm font-medium text-white mb-1">{title}</h3>
      {description && (
        <p className="text-xs text-[#919191] max-w-sm mx-auto">{description}</p>
      )}
    </div>
  );
}
