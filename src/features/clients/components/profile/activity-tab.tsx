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
  Search,
  ArrowRight,
  X
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Loader } from "@/components/ui/loader";
import { EmptyState } from "@/components/shared/empty-state";
import TablePagination from "@/components/shared/table-pagination";
import { useAuditLogs, AuditLogItem, useAuditLogsById } from "@/features/activity/api/activity.service";
import { cn } from "@/lib/utils";

// Standard Field Labels for accurate human-readable display
const FIELD_LABELS: Record<string, string> = {
  firstName: "First Name",
  lastName: "Last Name",
  email: "Email",
  phone: "Phone",
  address: "Address",
  status: "Status",
  dateOfBirth: "Date of Birth",
  notes: "Notes",
  city: "City",
  state: "State",
  zipCode: "Zip Code",
  totalAUM: "Total AUM",
  contractNumber: "Contract #",
  policyNumber: "Policy #",
  provider: "Provider",
  contractType: "Contract Type",
  contractValue: "Contract Value",
  anniversaryDate: "Anniversary Date",
  commission: "Commission",
  title: "Title",
  description: "Description",
  dueDate: "Due Date",
  priority: "Priority",
  assignedTo: "Assigned To",
};

// System / internal fields that should not be shown as user-content updates
const IGNORED_FIELDS = new Set([
  "_id",
  "id",
  "__v",
  "createdAt",
  "updatedAt",
  "createdBy",
  "createdByType",
  "clientId",
  "contractsCount",
  "clientNotes",
  "documents",
]);

interface ParsedFieldChange {
  field: string;
  label: string;
  from?: string;
  to?: string;
  value?: string;
}

const formatFieldValue = (val: any): string => {
  if (val === null || val === undefined || val === "") return "--";
  if (typeof val === "boolean") return val ? "Yes" : "No";
  if (typeof val === "number") return val.toLocaleString();
  if (typeof val === "string") {
    // Check if ISO date
    if (/^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}:\d{2}(\.\d+)?Z?)?$/.test(val)) {
      try {
        const d = new Date(val);
        if (!isNaN(d.getTime())) {
          return d.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
        }
      } catch {
        // fall back to string
      }
    }
    return val;
  }
  if (typeof val === "object") {
    if (val.name) return String(val.name);
    if (val.title) return String(val.title);
    return JSON.stringify(val);
  }
  return String(val);
};

function parseAuditLogChanges(log: AuditLogItem): {
  isStructured: boolean;
  changes: ParsedFieldChange[];
  fallbackText: string;
} {
  const rawChange = log.change || "";
  const rawObj = (log as any).changes || (log as any).details || (log as any).diff;

  let dataObj: any = rawObj;
  if (!dataObj && typeof rawChange === "string") {
    const trimmed = rawChange.trim();
    if ((trimmed.startsWith("{") && trimmed.endsWith("}")) || (trimmed.startsWith("[") && trimmed.endsWith("]"))) {
      try {
        dataObj = JSON.parse(trimmed);
      } catch {
        dataObj = null;
      }
    }
  }

  const parsedChanges: ParsedFieldChange[] = [];

  if (Array.isArray(dataObj)) {
    for (const item of dataObj) {
      if (!item || typeof item !== "object") continue;
      const fieldKey = item.field || item.key || item.name;
      if (!fieldKey || IGNORED_FIELDS.has(fieldKey)) continue;

      const fromVal = item.from !== undefined ? item.from : item.oldValue !== undefined ? item.oldValue : item.old;
      const toVal = item.to !== undefined ? item.to : item.newValue !== undefined ? item.newValue : item.new !== undefined ? item.new : item.value;

      // Filter out unchanged fields where before and after values are identical
      if (fromVal !== undefined && toVal !== undefined) {
        if (JSON.stringify(fromVal) === JSON.stringify(toVal) || String(fromVal).trim() === String(toVal).trim()) {
          continue;
        }
      }

      parsedChanges.push({
        field: fieldKey,
        label: FIELD_LABELS[fieldKey] || fieldKey.replace(/([A-Z])/g, " $1").replace(/^./, (s:any) => s.toUpperCase()).trim(),
        from: fromVal !== undefined ? formatFieldValue(fromVal) : undefined,
        to: toVal !== undefined ? formatFieldValue(toVal) : undefined,
        value: toVal !== undefined ? formatFieldValue(toVal) : formatFieldValue(item.value),
      });
    }
  } else if (dataObj && typeof dataObj === "object") {
    for (const [key, val] of Object.entries(dataObj)) {
      if (IGNORED_FIELDS.has(key)) continue;
      if (val && typeof val === "object" && ("from" in val || "to" in val || "old" in val || "new" in val || "oldValue" in val || "newValue" in val)) {
        const vObj = val as any;
        const fromVal = vObj.from !== undefined ? vObj.from : vObj.oldValue !== undefined ? vObj.oldValue : vObj.old;
        const toVal = vObj.to !== undefined ? vObj.to : vObj.newValue !== undefined ? vObj.newValue : vObj.new;

        // Skip unchanged fields
        if (fromVal !== undefined && toVal !== undefined) {
          if (JSON.stringify(fromVal) === JSON.stringify(toVal) || String(fromVal).trim() === String(toVal).trim()) {
            continue;
          }
        }

        parsedChanges.push({
          field: key,
          label: FIELD_LABELS[key] || key.replace(/([A-Z])/g, " $1").replace(/^./, (s) => s.toUpperCase()).trim(),
          from: fromVal !== undefined ? formatFieldValue(fromVal) : undefined,
          to: toVal !== undefined ? formatFieldValue(toVal) : undefined,
        });
      } else {
        parsedChanges.push({
          field: key,
          label: FIELD_LABELS[key] || key.replace(/([A-Z])/g, " $1").replace(/^./, (s) => s.toUpperCase()).trim(),
          value: formatFieldValue(val),
        });
      }
    }
  }

  // Fallback: parse string formatted diffs e.g. "status: Active -> Inactive" or "firstName: from A to B"
  if (parsedChanges.length === 0 && rawChange.includes("->")) {
    const parts = rawChange.split(/,\s*/);
    for (const part of parts) {
      const match = part.match(/([^:]+):\s*(.*?)\s*->\s*(.*)/);
      if (match) {
        const [, fieldName, fromVal, toVal] = match;
        const cleanField = fieldName.trim();
        if (IGNORED_FIELDS.has(cleanField)) continue;
        if (fromVal.trim() === toVal.trim()) continue; // skip unchanged

        parsedChanges.push({
          field: cleanField,
          label: FIELD_LABELS[cleanField] || cleanField.replace(/([A-Z])/g, " $1").replace(/^./, (s) => s.toUpperCase()).trim(),
          from: formatFieldValue(fromVal.trim()),
          to: formatFieldValue(toVal.trim()),
        });
      }
    }
  } else if (parsedChanges.length === 0 && rawChange.toLowerCase().includes("changed from")) {
    const match = rawChange.match(/([a-zA-Z\s]+)\s+changed from\s+['"]?([^'"]+)['"]?\s+to\s+['"]?([^'"]+)['"]?/i);
    if (match) {
      const [, fieldName, fromVal, toVal] = match;
      const cleanField = fieldName.trim();
      if (fromVal.trim() !== toVal.trim()) {
        parsedChanges.push({
          field: cleanField,
          label: FIELD_LABELS[cleanField] || cleanField.replace(/([A-Z])/g, " $1").replace(/^./, (s) => s.toUpperCase()).trim(),
          from: formatFieldValue(fromVal.trim()),
          to: formatFieldValue(toVal.trim()),
        });
      }
    }
  }

  return {
    isStructured: parsedChanges.length > 0,
    changes: parsedChanges,
    fallbackText: rawChange || "No changes recorded.",
  };
}

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
          {searchTerm && (
            <button
              type="button"
              onClick={() => {
                setSearchTerm("");
                setCurrentPage(1);
              }}
              className="text-[#919191] hover:text-white transition-colors cursor-pointer p-0.5"
              title="Clear search"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
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
                    <div className="flex flex-col gap-2">
                      {log.recordLabel && (
                        <h4 className="text-sm font-semibold text-white tracking-tight flex items-center gap-1.5">
                          <FileText className="w-3.5 h-3.5 text-[#849EB2] flex-shrink-0" />
                          <span className="truncate">{log.recordLabel}</span>
                        </h4>
                      )}

                      {/* Accurate Field Changes Display */}
                      {(() => {
                        const changeInfo = parseAuditLogChanges(log);
                        if (changeInfo.isStructured && changeInfo.changes.length > 0) {
                          return (
                            <div className="flex flex-col gap-1.5 bg-[#141C24] p-3 rounded-[8px] border border-white/5 mt-0.5">
                              <span className="text-[11px] font-semibold text-[#849EB2] uppercase tracking-wider">
                                Updated Fields ({changeInfo.changes.length})
                              </span>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                {changeInfo.changes.map((change, idx) => (
                                  <div
                                    key={`${change.field}-${idx}`}
                                    className="flex flex-col gap-1 bg-[#0C1116] p-2.5 rounded-[6px] border border-white/5"
                                  >
                                    <span className="text-xs font-medium text-[#919191]">
                                      {change.label}
                                    </span>
                                    {change.from !== undefined && change.to !== undefined ? (
                                      <div className="flex items-center gap-1.5 text-xs flex-wrap">
                                        <span
                                          className="text-[#FF3E46]/80 line-through truncate max-w-[130px]"
                                          title={change.from || ""}
                                        >
                                          {change.from}
                                        </span>
                                        <ArrowRight className="w-3 h-3 text-[#6887A0] flex-shrink-0" />
                                        <span
                                          className="text-[#42CD7F] font-medium truncate max-w-[130px]"
                                          title={change.to || ""}
                                        >
                                          {change.to}
                                        </span>
                                      </div>
                                    ) : (
                                      <span
                                        className="text-xs text-white font-medium truncate"
                                        title={change.value || change.to || ""}
                                      >
                                        {change.value || change.to || "--"}
                                      </span>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          );
                        }

                        if (log.change) {
                          return (
                            <p className="text-xs text-[#CACACA] leading-relaxed break-words bg-[#141C24] px-3 py-2 rounded-[8px] border border-white/5">
                              {log.change}
                            </p>
                          );
                        }

                        return null;
                      })()}
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
