"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import TablePagination from "@/components/shared/table-pagination";
import { cn } from "@/lib/utils";

export type ClientStatus = "Active" | "Archived" | "Inactive" | "Prospect";

export interface ClientItem {
  id: string;
  initials: string;
  name: string;
  dob: string;
  email: string;
  phone: string;
  contracts: number;
  status: ClientStatus;
  created: string;
}

export const CLIENTS_DATA: ClientItem[] = [
  {
    id: "1",
    initials: "JT",
    name: "Jacob Thompson",
    dob: "DOB 1947-06-01",
    email: "jacob.thompson0@example.com",
    phone: "(322) 573-3458",
    contracts: 4,
    status: "Archived",
    created: "2024-10-07",
  },
  {
    id: "2",
    initials: "BS",
    name: "Barbara Smith",
    dob: "DOB 1950-03-15",
    email: "barbara.smith5@example.com",
    phone: "(628) 908-1698",
    contracts: 7,
    status: "Active",
    created: "2025-03-25",
  },
  {
    id: "3",
    initials: "AB",
    name: "Anthony Brown",
    dob: "DOB 1948-07-22",
    email: "anthony.brown2@example.com",
    phone: "(571) 124-2556",
    contracts: 2,
    status: "Inactive",
    created: "2024-06-26",
  },
  {
    id: "4",
    initials: "PW",
    name: "Patricia Williams",
    dob: "DOB 1952-11-30",
    email: "patricia.williams3@example.com",
    phone: "(371) 680-2885",
    contracts: 6,
    status: "Prospect",
    created: "2024-12-11",
  },
  {
    id: "5",
    initials: "MA",
    name: "Mark Anderson",
    dob: "DOB 1949-01-05",
    email: "mark.anderson4@example.com",
    phone: "(676) 723-9349",
    contracts: 7,
    status: "Active",
    created: "2024-10-16",
  },
  {
    id: "6",
    initials: "CL",
    name: "Cynthia Lee",
    dob: "DOB 1951-09-18",
    email: "cynthia.lee7@example.com",
    phone: "(489) 357-2190",
    contracts: 3,
    status: "Inactive",
    created: "2024-08-30",
  },
  {
    id: "7",
    initials: "RV",
    name: "Robert Vasquez",
    dob: "DOB 1946-12-12",
    email: "robert.vasquez1@example.com",
    phone: "(254) 682-1374",
    contracts: 5,
    status: "Active",
    created: "2025-01-12",
  },
  {
    id: "8",
    initials: "SN",
    name: "Samantha Nguyen",
    dob: "DOB 1953-05-25",
    email: "samantha.nguyen9@example.com",
    phone: "(512) 947-6653",
    contracts: 1,
    status: "Prospect",
    created: "2024-07-22",
  },
  {
    id: "9",
    initials: "DB",
    name: "David Brooks",
    dob: "DOB 1945-08-09",
    email: "david.brooks8@example.com",
    phone: "(349) 781-4432",
    contracts: 4,
    status: "Archived",
    created: "2024-09-05",
  },
  {
    id: "10",
    initials: "MH",
    name: "Maria Hernandez",
    dob: "DOB 1954-04-02",
    email: "maria.hernandez0@example.com",
    phone: "(601) 423-5987",
    contracts: 6,
    status: "Active",
    created: "2025-02-14",
  },
  {
    id: "11",
    initials: "EL",
    name: "Ethan Lewis",
    dob: "DOB 1944-10-20",
    email: "ethan.lewis3@example.com",
    phone: "(718) 134-9876",
    contracts: 2,
    status: "Inactive",
    created: "2024-11-21",
  },
  {
    id: "12",
    initials: "KS",
    name: "Karen Scott",
    dob: "DOB 1955-02-14",
    email: "karen.scott2@example.com",
    phone: "(439) 205-7631",
    contracts: 5,
    status: "Prospect",
    created: "2024-08-15",
  },
];

const STATUS_STYLES: Record<ClientStatus, string> = {
  Archived: "bg-[#4F39F6] hover:bg-[#4F39F6]/80 text-white border-0",
  Active: "bg-[#42CD7F] hover:bg-[#42CD7F]/80 text-white border-0",
  Inactive: "bg-[#FF3E46] hover:bg-[#FF3E46]/80 text-white border-0",
  Prospect: "bg-[#FF6A00] hover:bg-[#FF6A00]/80 text-white border-0",
};

export default function ClientsFolderTable() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("All statuses");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  const filteredClients = CLIENTS_DATA.filter((client) => {
    const matchesSearch =
      client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      client.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      client.phone.includes(searchQuery);

    const matchesStatus =
      selectedStatus === "All statuses" || client.status === selectedStatus;

    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.ceil(filteredClients.length / itemsPerPage);
  const paginatedClients = filteredClients.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="w-full flex flex-col gap-4">
      {/* Top Search & Filter Bar Container matching Figma (#394A58) */}
      <div className="w-full bg-[#394A58] border border-white/5 rounded-[12px] p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Search Input Box */}
        <div className="relative w-full sm:w-[320px]">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8C8C8C]" />
          <Input
            type="text"
            placeholder="Search clients..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full h-10 pl-10 bg-[#141C24] border border-white/5 text-white placeholder:text-[#8C8C8C] rounded-[12px] text-sm focus-visible:ring-0 focus-visible:border-white/20 font-sans"
          />
        </div>

        {/* Status Dropdown Filter */}
        <div className="w-full sm:w-[220px]">
          <Select
            value={selectedStatus}
            onValueChange={(val: string | null) => {
              if (val) setSelectedStatus(val);
              setCurrentPage(1);
            }}
          >
            <SelectTrigger className="w-full h-10 bg-[#141C24] border border-white/5 text-white rounded-[12px] text-sm focus:ring-0 font-sans">
              <SelectValue placeholder="All statuses" />
            </SelectTrigger>
            <SelectContent
              side="bottom"
              alignItemWithTrigger={false}
              className="bg-[#141C24] border-white/10 text-white font-sans"
            >
              <SelectItem value="All statuses">All statuses</SelectItem>
              <SelectItem value="Active">Active</SelectItem>
              <SelectItem value="Archived">Archived</SelectItem>
              <SelectItem value="Inactive">Inactive</SelectItem>
              <SelectItem value="Prospect">Prospect</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Main Table Card Container (#141C24) */}
      <div className="w-full bg-[#141C24] border border-white/5 rounded-[12px] overflow-hidden shadow-sm flex flex-col justify-between min-h-[420px]">
        <div className="w-full overflow-x-auto">
          <Table>
            <TableHeader className="bg-[#394A58] border-b border-white/10">
              <TableRow className="border-b border-white/10 hover:bg-transparent h-10">
                <TableHead className="text-white font-medium text-sm h-10 px-6 font-sans">
                  Name
                </TableHead>
                <TableHead className="text-white font-medium text-sm h-10 px-6 font-sans">
                  Email Address
                </TableHead>
                <TableHead className="text-white font-medium text-sm h-10 px-6 font-sans">
                  Contact No.
                </TableHead>
                <TableHead className="text-white font-medium text-sm h-10 px-6 font-sans text-center">
                  Contracts
                </TableHead>
                <TableHead className="text-white font-medium text-sm h-10 px-6 font-sans">
                  Status
                </TableHead>
                <TableHead className="text-white font-medium text-sm h-10 px-6 font-sans">
                  Created
                </TableHead>
                <TableHead className="w-10 h-10"></TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {paginatedClients.length > 0 ? (
                paginatedClients.map((client) => (
                  <TableRow
                    key={client.id}
                    onClick={() => router.push(`/dashboard/clients/${client.id}`)}
                    className="border-b border-white/10 hover:bg-white/[0.02] transition-colors h-16 cursor-pointer"
                  >
                    {/* Name Column with Avatar & DOB */}
                    <TableCell className="px-6 py-3">
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

                    {/* Email Column */}
                    <TableCell className="px-6 py-3 text-sm text-white font-sans">
                      {client.email}
                    </TableCell>

                    {/* Contact Phone Column */}
                    <TableCell className="px-6 py-3 text-sm text-white font-sans">
                      {client.phone}
                    </TableCell>

                    {/* Contracts Count Column */}
                    <TableCell className="px-6 py-3 text-sm text-white font-sans text-center">
                      {client.contracts}
                    </TableCell>

                    {/* Status Badge Column */}
                    <TableCell className="px-6 py-3">
                      <Badge
                        className={cn(
                          "px-2.5 py-0.5 rounded-[8px] text-xs font-medium capitalize font-sans",
                          STATUS_STYLES[client.status]
                        )}
                      >
                        {client.status}
                      </Badge>
                    </TableCell>

                    {/* Created Date Column */}
                    <TableCell className="px-6 py-3 text-sm text-white font-sans">
                      {client.created}
                    </TableCell>

                    {/* Right Chevron Arrow Icon */}
                    <TableCell className="pr-4 py-3 text-right">
                      <ChevronRight className="w-4 h-4 text-white/50 inline-block" />
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="h-32 text-center text-sm text-[#919191] font-sans"
                  >
                    No clients found matching your search.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Reusable Pagination */}
        <div className="px-6 pb-4">
          <TablePagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            totalItems={filteredClients.length}
            itemsPerPage={itemsPerPage}
          />
        </div>
      </div>
    </div>
  );
}
