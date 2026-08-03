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

const CLIENTS = [
  {
    initials: "JT",
    name: "Jacob Thompson",
    dob: "DOB 1947-06-01",
    email: "jacob.thompson0@example.com",
    phone: "(322) 573-3458",
    contracts: 4,
    status: "Archived" as StatusType,
    created: "2024-10-07",
  },
  {
    initials: "BS",
    name: "Barbara Smith",
    dob: "DOB 1947-06-01",
    email: "barbara.smith5@example.com",
    phone: "(628) 908-1698",
    contracts: 7,
    status: "Active" as StatusType,
    created: "2025-03-25",
  },
  {
    initials: "AB",
    name: "Anthony Brown",
    dob: "DOB 1947-06-01",
    email: "anthony.brown2@example.com",
    phone: "(571) 124-2556",
    contracts: 2,
    status: "Inactive" as StatusType,
    created: "2024-06-26",
  },
  {
    initials: "PW",
    name: "Patricia Williams",
    dob: "DOB 1947-06-01",
    email: "patricia.williams3@example.com",
    phone: "(371) 680-2885",
    contracts: 6,
    status: "Prospect" as StatusType,
    created: "2024-12-11",
  },
  {
    initials: "MA",
    name: "Mark Anderson",
    dob: "DOB 1947-06-01",
    email: "mark.anderson4@example.com",
    phone: "(676) 723-9349",
    contracts: 7,
    status: "Active" as StatusType,
    created: "2024-10-16",
  },
];

export default function ClientsTableCard() {
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
            {CLIENTS.map((client) => (
              <TableRow
                key={client.email}
                className="border-b border-white/10 hover:bg-white/[0.02] transition-colors"
              >
                {/* Name & Avatar */}
                <TableCell className="px-6 py-3.5">
                  <div className="flex items-center gap-3">
                    <div className="w-[30px] h-[30px] rounded-full bg-white/10 flex items-center justify-center text-[11px] font-bold text-white flex-shrink-0 font-sans">
                      {client.initials}
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-white font-sans leading-tight">
                        {client.name}
                      </span>
                      <span className="text-xs font-normal text-[#8C8C8C] font-sans">
                        {client.dob}
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
                  {client.contracts}
                </TableCell>

                {/* Status Badge */}
                <TableCell className="px-6 py-3.5">
                  <Badge
                    className={cn(
                      "px-2.5 py-0.5 rounded-[8px] text-xs font-medium capitalize font-sans",
                      STATUS_STYLES[client.status]
                    )}
                  >
                    {client.status}
                  </Badge>
                </TableCell>

                {/* Created */}
                <TableCell className="px-6 py-3.5 text-sm text-white font-sans">
                  {client.created}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </Card>
  );
}
