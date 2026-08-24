"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

type StatusType = "Archived" | "Active" | "Inactive" | "Prospect";

const STATUS_STYLES: Record<StatusType, string> = {
  Archived: "bg-[#4F39F6] hover:bg-[#4F39F6]/80 text-white border-0",
  Active: "bg-[#42CD7F] hover:bg-[#42CD7F]/80 text-white border-0",
  Inactive: "bg-[#FF3E46] hover:bg-[#FF3E46]/80 text-white border-0",
  Prospect: "bg-[#FF6A00] hover:bg-[#FF6A00]/80 text-white border-0",
};

import { useDashboardSummary } from "@/features/dashboard/api/dashboard.service";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/shared/empty-state";
import { Users } from "lucide-react";

function getInitials(name: string) {
  if (!name) return "U";
  const parts = name.trim().split(" ");
  if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  return name[0].toUpperCase();
}

export default function ClientsTableCard() {
  const { data, isLoading } = useDashboardSummary();

  if (isLoading) {
    return <Skeleton className="h-[400px] w-full bg-[#141C24] rounded-[12px]" />;
  }

  const clients = data?.clients || [];

  return (
    <Card className="bg-[#141C24] border border-[#0F1F3D]/12 rounded-[12px] flex flex-col overflow-hidden shadow-sm w-full">
      {/* Header */}
      <div className="h-[51px] bg-[#394A58] px-5 flex items-center justify-between border-b border-white/10">
        <h3 className="text-sm font-semibold text-white font-sans">Clients</h3>
        <Link
          href="/dashboard/clients"
          className="text-xs font-medium text-white hover:underline flex items-center gap-1 font-sans"
        >
          <span>Manage clients</span>
          <ChevronRight className="w-3.5 h-3.5 text-white" />
        </Link>
      </div>

      {/* Table Container */}
      <div className="overflow-x-auto w-full">
        <Table className="w-full">
          <TableHeader className="bg-transparent border-b border-white/10">
            <TableRow className="border-b border-white/10 hover:bg-transparent">
              <TableHead className="text-[#8C8C8C] font-medium text-xs h-10 px-6 font-sans">
                Name
              </TableHead>
              <TableHead className="text-[#8C8C8C] font-medium text-xs h-10 px-6 font-sans">
                Email Address
              </TableHead>
              <TableHead className="text-[#8C8C8C] font-medium text-xs h-10 px-6 font-sans">
                Contact No.
              </TableHead>
              <TableHead className="text-[#8C8C8C] font-medium text-xs h-10 px-6 font-sans text-center">
                Contracts
              </TableHead>
              <TableHead className="text-[#8C8C8C] font-medium text-xs h-10 px-6 font-sans">
                Status
              </TableHead>
              <TableHead className="text-[#8C8C8C] font-medium text-xs h-10 px-6 font-sans">
                Created
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {clients.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-0">
                  <EmptyState 
                    icon={Users}
                    title="No clients found"
                    className="py-12 border-0 bg-transparent min-h-0"
                  />
                </TableCell>
              </TableRow>
            ) : (
              clients.map((client: any) => {
                const name = client.firstName ? `${client.firstName} ${client.lastName}` : client.name || "Unknown";
                return (
                <TableRow
                  key={client._id || client.id}
                  className="border-b border-white/10 hover:bg-white/[0.02] transition-colors"
                >
                  {/* Name & Avatar */}
                  <TableCell className="px-6 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="w-[30px] h-[30px] rounded-full bg-white/10 flex items-center justify-center text-[11px] font-bold text-white flex-shrink-0 font-sans">
                        {getInitials(name)}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-white font-sans leading-tight">
                          {name}
                        </span>
                        <span className="text-xs font-normal text-[#8C8C8C] font-sans">
                          {client.email}
                        </span>
                      </div>
                    </div>
                  </TableCell>

                  {/* Email */}
                  <TableCell className="px-6 py-3.5 text-sm text-white font-sans">
                    {client.email}
                  </TableCell>

                  {/* Phone */}
                  <TableCell className="px-6 py-3.5 text-sm text-white font-sans">
                    {client.phone}
                  </TableCell>

                  {/* Contracts */}
                  <TableCell className="px-6 py-3.5 text-sm text-white font-sans text-center">
                    {client.contracts?.length || client.contractsCount || 0}
                  </TableCell>

                  {/* Status Badge */}
                  <TableCell className="px-6 py-3.5">
                    <Badge
                      className={cn(
                        "px-2.5 py-0.5 rounded-[8px] text-xs font-medium capitalize font-sans",
                        STATUS_STYLES[client.status as StatusType] || "bg-gray-600 hover:bg-gray-500 text-white border-0"
                      )}
                    >
                      {client.status}
                    </Badge>
                  </TableCell>

                  {/* Created */}
                  <TableCell className="px-6 py-3.5 text-sm text-white font-sans">
                    {new Date(client.createdAt || client.lastContact).toLocaleDateString("en-US", { year: 'numeric', month: '2-digit', day: '2-digit' })}
                  </TableCell>
                </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </Card>
  );
}
