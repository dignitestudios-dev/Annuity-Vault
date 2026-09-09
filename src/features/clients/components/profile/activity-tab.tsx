"use client";

import { useState } from "react";
import { useDebounce } from "@/hooks/use-debounce";
import { 
  Activity, 
  Upload, 
  PlusCircle, 
  Edit3, 
  Archive, 
  RotateCcw, 
  Clock, 
  User, 
  Folder,
  FileText,
  Search
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Loader } from "@/components/ui/loader";
import { EmptyState } from "@/components/shared/empty-state";
import TablePagination from "@/components/shared/table-pagination";
import { useAuditLogs, AuditLogItem, useAuditLogsById } from "@/features/activity/api/activity.service";
import { cn } from "@/lib/utils";

interface ActivityTabProps {
  clientId?: string;
  clientName?: string;
}

export default function ActivityTab({ clientId, clientName }: ActivityTabProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearch = useDebounce(searchTerm, 400);
  const itemsPerPage = 10;

  const { data, isLoading } = useAuditLogsById(clientId || "", {
    page: currentPage,
    limit: itemsPerPage,
    search: debouncedSearch || undefined,
  });

  const logs: AuditLogItem[] = data?.data || [];
  const totalItems = data?.pagination?.totalItems || 0;
  const totalPages = data?.pagination?.totalPages || 1;

  // Helper for Action Badge Styling & Icon
  const getActionBadge = (action: string) => {
    const act = action.toLowerCase();
    switch (act) {
      case "create":
        return {
          icon: PlusCircle,
          className: "bg-[#42CD7F]/10 text-[#42CD7F] border-[#42CD7F]/30",
        };
      case "upload":
        return {
          icon: Upload,
          className: "bg-[#A78BFA]/10 text-[#A78BFA] border-[#A78BFA]/30",
        };
      case "update":
      case "edit":
        return {
          icon: Edit3,
          className: "bg-[#33BBFF]/10 text-[#33BBFF] border-[#33BBFF]/30",
        };
      case "archive":
      case "delete":
        return {
          icon: Archive,
          className: "bg-[#FF3E46]/10 text-[#FF3E46] border-[#FF3E46]/30",
        };
      case "restore":
        return {
          icon: RotateCcw,
          className: "bg-[#FF9D00]/10 text-[#FF9D00] border-[#FF9D00]/30",
        };
      default:
        return {
          icon: Activity,
          className: "bg-[#6887A0]/10 text-[#6887A0] border-[#6887A0]/30",
        };
    }
  };

  const formatTimestamp = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return {
        date: date.toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
          day: "2-digit",
        }),
        time: date.toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        }),
      };
    } catch {
      return { date: dateString, time: "" };
    }
  };

  return (
    <div className="w-full bg-[#141C24] border border-[#0F1F3D]/12 rounded-[12px] overflow-hidden shadow-sm flex flex-col justify-between">
      {/* 1. Header Row (#394A58) */}
      <div className="h-[65px] bg-[#394A58] px-6 flex flex-wrap items-center justify-between gap-4 border-b border-white/10">
        <div className="flex items-center gap-3">
          <h3 className="text-lg lg:text-xl font-semibold text-white tracking-tight font-sans">
            Activity Log
          </h3>
          {totalItems > 0 && (
            <Badge className="bg-[#141C24] text-[#849EB2] border border-white/10 text-xs px-2.5 py-0.5 rounded-full font-mono">
              {totalItems} {totalItems === 1 ? "event" : "events"}
            </Badge>
          )}
        </div>

        {/* Search Bar in Header */}
        <div className="flex items-center gap-2 bg-[#141C24] px-3 h-9 rounded-[10px] border border-white/10 text-white w-full sm:w-[260px]">
          <Search className="w-3.5 h-3.5 text-[#919191] flex-shrink-0" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Search activity..."
            className="w-full bg-transparent text-xs text-white placeholder-[#919191] outline-none"
          />
        </div>
      </div>

      {/* 2. Timeline Activity Feed */}
      <div className="p-6">
        {isLoading ? (
          <div className="relative border-l border-white/10 ml-4 pl-6 sm:pl-8 flex flex-col gap-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="relative flex flex-col gap-2">
                <div className="absolute -left-[37px] sm:-left-[45px] top-1.5 w-6 h-6 rounded-full bg-[#192430] animate-pulse border border-white/15"></div>
                <div className="w-full h-28 bg-[#192430] animate-pulse rounded-[10px] border border-white/5"></div>
              </div>
            ))}
          </div>
        ) : logs.length === 0 ? (
          <EmptyState
            icon={Activity}
            title="No activity logs found"
            description={
              debouncedSearch
                ? "No activity logs match your search filter."
                : "Activity and audit logs will appear here once actions are performed."
            }
            className="py-12 border-0 bg-transparent min-h-[220px]"
          />
        ) : (
          <div className="relative border-l border-white/10 ml-4 pl-6 sm:pl-8 flex flex-col gap-6">
            {logs.map((log) => {
              const badgeInfo = getActionBadge(log.action);
              const ActionIcon = badgeInfo.icon;
              const { date, time } = formatTimestamp(log.createdAt);
              const performerName = log.performedBy
                ? log.performedBy.name ||
                  `${log.performedBy.firstName || ""} ${log.performedBy.lastName || ""}`.trim() ||
                  "User"
                : "System";

              return (
                <div key={log._id} className="relative flex flex-col gap-2 group">
                  {/* Timeline Node Icon / Dot */}
                  <div className="absolute -left-[37px] sm:-left-[45px] top-1.5 w-6 h-6 rounded-full bg-[#0C1116] border border-white/15 flex items-center justify-center text-[#849EB2] group-hover:border-[#6887A0] group-hover:scale-110 transition-all shadow-sm">
                    <ActionIcon className="w-3 h-3" />
                  </div>

                  {/* Activity Card */}
                  <div className="w-full bg-[#0C1116] rounded-[10px] p-4 sm:p-5 flex flex-col gap-2.5 border border-white/5 hover:border-white/10 hover:bg-[#0E151C] transition-all">
                    {/* Top Row: Action Badge + Module + Timestamp */}
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span
                          className={cn(
                            "px-2.5 py-0.5 rounded-[6px] text-xs font-semibold uppercase tracking-wider border flex items-center gap-1",
                            badgeInfo.className
                          )}
                        >
                          {log.action}
                        </span>
                        {log.module && (
                          <span className="text-xs font-medium text-[#849EB2] bg-white/5 px-2 py-0.5 rounded-[6px] border border-white/5 flex items-center gap-1">
                            <Folder className="w-3 h-3 text-[#6887A0]" />
                            {log.module}
                          </span>
                        )}
                      </div>

                      {/* Timestamp */}
                      <div className="flex items-center gap-1.5 text-xs text-[#919191] font-mono">
                        <Clock className="w-3.5 h-3.5 text-[#6887A0]" />
                        <span>{date}</span>
                        {time && <span className="text-white/40">·</span>}
                        {time && <span>{time}</span>}
                      </div>
                    </div>

                    {/* Middle: Record Label & Change Details */}
                    <div className="flex flex-col gap-1">
                      {log.recordLabel && (
                        <h4 className="text-sm font-semibold text-white tracking-tight flex items-center gap-1.5">
                          <FileText className="w-3.5 h-3.5 text-[#849EB2] flex-shrink-0" />
                          <span className="truncate">{log.recordLabel}</span>
                        </h4>
                      )}
                      {log.change && (
                        <p className="text-xs text-[#CACACA] leading-relaxed break-words">
                          {log.change}
                        </p>
                      )}
                    </div>

                    {/* Bottom Row: Performed By */}
                    <div className="flex items-center justify-between pt-2 border-t border-white/5 text-xs text-[#919191]">
                      <div className="flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-[#6887A0]" />
                        <span>
                          Performed by{" "}
                          <span className="text-white font-medium">{performerName}</span>
                        </span>
                        {log.performedByType && (
                          <span className="text-[10px] text-[#849EB2] bg-white/5 px-1.5 py-0.2 rounded border border-white/5">
                            {log.performedByType}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 3. Pagination Footer */}
      {!isLoading && logs.length > 0 && (
        <div className="px-6 pb-4">
          <TablePagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            totalItems={totalItems}
            itemsPerPage={itemsPerPage}
            itemLabel="activities"
          />
        </div>
      )}
    </div>
  );
}
