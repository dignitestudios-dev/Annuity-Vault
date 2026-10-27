"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, ChevronRight, Users, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/shared/empty-state";
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
import { useClients } from "@/features/clients/api/clients.service";
import { Skeleton } from "@/components/ui/skeleton";
import { useDebounce } from "@/hooks/use-debounce";

import { US_STATES } from "@/lib/us-states";
import { RotateCcw } from "lucide-react";

export type ClientStatus = "Active" | "Archived" | "Inactive" | "Prospect" | string;

const STATUS_STYLES: Record<string, string> = {
  Archived: "bg-[#4F39F6] hover:bg-[#4F39F6]/80 text-white border-0",
  Active: "bg-[#42CD7F] hover:bg-[#42CD7F]/80 text-white border-0",
  Inactive: "bg-[#FF3E46] hover:bg-[#FF3E46]/80 text-white border-0",
  Prospect: "bg-[#FF6A00] hover:bg-[#FF6A00]/80 text-white border-0",
};

function getInitials(name: string) {
  if (!name) return "U";
  const parts = name.trim().split(" ");
  if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  return name[0].toUpperCase();
}

export default function ClientsFolderTable() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("All statuses");
  const [cityFilter, setCityFilter] = useState("");
  const [stateFilter, setStateFilter] = useState("All states");
  const [zipFilter, setZipFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  const debouncedSearch = useDebounce(searchQuery, 400);
  const debouncedCity = useDebounce(cityFilter, 400);
  const debouncedZip = useDebounce(zipFilter, 400);

  const { data, isLoading } = useClients({
    search: debouncedSearch?.trim() || undefined,
    status: selectedStatus !== "All statuses" ? selectedStatus : undefined,
    city: debouncedCity?.trim() || undefined,
    state: stateFilter !== "All states" ? stateFilter : undefined,
    zip: debouncedZip?.trim() || undefined,
    page: currentPage,
    limit: itemsPerPage,
  });

  const clients = data?.data || [];
  const totalPages = data?.total ? Math.ceil(data.total / itemsPerPage) : 1;
  const totalItems = data?.total || 0;

  const hasActiveFilters = Boolean(
    searchQuery ||
    (selectedStatus && selectedStatus !== "All statuses") ||
    cityFilter ||
    (stateFilter && stateFilter !== "All states") ||
    zipFilter
  );

  const handleResetFilters = () => {
    setSearchQuery("");
    setSelectedStatus("All statuses");
    setCityFilter("");
    setStateFilter("All states");
    setZipFilter("");
    setCurrentPage(1);
  };

  return (
    <div className="w-full flex flex-col gap-4">
      {/* Top Search & Filter Bar Container matching Figma (#394A58) */}
      <div className="w-full bg-[#394A58] border border-white/5 rounded-[12px] p-4 flex flex-col gap-3">
        <div className="w-full grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 items-center">
          {/* Search Input Box */}
          <div className="relative w-full lg:col-span-2">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8C8C8C]" />
            <Input
              type="text"
              placeholder="Search clients (name, email, city...)"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full h-10 pl-10 pr-9 bg-[#141C24] border border-white/5 text-white placeholder:text-[#8C8C8C] rounded-[12px] text-xs sm:text-sm focus-visible:ring-0 focus-visible:border-white/20 font-sans"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery("");
                  setCurrentPage(1);
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8C8C8C] hover:text-white transition-colors cursor-pointer p-0.5"
                title="Clear search"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* City Filter */}
          <div className="w-full">
            <Input
              type="text"
              placeholder="Filter by City"
              value={cityFilter}
              onChange={(e) => {
                setCityFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full h-10 bg-[#141C24] border border-white/5 text-white placeholder:text-[#8C8C8C] rounded-[12px] text-xs focus-visible:ring-0 focus-visible:border-white/20 font-sans"
            />
          </div>

          {/* State Dropdown Filter */}
          <div className="w-full">
            <Select
              value={stateFilter}
              onValueChange={(val: string | null) => {
                if (val) setStateFilter(val);
                setCurrentPage(1);
              }}
            >
              <SelectTrigger className="w-full h-10 bg-[#141C24] border border-white/5 text-white rounded-[12px] text-xs focus:ring-0 font-sans">
                <SelectValue placeholder="All states" />
              </SelectTrigger>
              <SelectContent
                side="bottom"
                alignItemWithTrigger={false}
                className="bg-[#141C24] border-white/10 text-white font-sans max-h-60"
              >
                <SelectItem value="All states" className="text-xs">All states</SelectItem>
                {US_STATES.map((s) => (
                  <SelectItem key={s.code} value={s.code} className="text-xs">
                    {s.code} - {s.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Zip Filter */}
          <div className="w-full">
            <Input
              type="text"
              placeholder="Filter by Zip"
              value={zipFilter}
              onChange={(e) => {
                setZipFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full h-10 bg-[#141C24] border border-white/5 text-white placeholder:text-[#8C8C8C] rounded-[12px] text-xs focus-visible:ring-0 focus-visible:border-white/20 font-sans"
            />
          </div>

          {/* Status Dropdown Filter */}
          <div className="w-full">
            <Select
              value={selectedStatus}
              onValueChange={(val: string | null) => {
                if (val) setSelectedStatus(val);
                setCurrentPage(1);
              }}
            >
              <SelectTrigger className="w-full h-10 bg-[#141C24] border border-white/5 text-white rounded-[12px] text-xs focus:ring-0 font-sans">
                <SelectValue placeholder="All statuses" />
              </SelectTrigger>
              <SelectContent
                side="bottom"
                alignItemWithTrigger={false}
                className="bg-[#141C24] border-white/10 text-white font-sans"
              >
                <SelectItem value="All statuses" className="text-xs">All statuses</SelectItem>
                <SelectItem value="Active" className="text-xs">Active</SelectItem>
                <SelectItem value="Inactive" className="text-xs">Inactive</SelectItem>
                <SelectItem value="Prospect" className="text-xs">Prospect</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {hasActiveFilters && (
          <div className="flex items-center justify-end">
            <button
              type="button"
              onClick={handleResetFilters}
              className="text-xs text-white/80 hover:text-white flex items-center gap-1.5 py-1 px-2.5 rounded-lg bg-[#141C24] border border-white/10 cursor-pointer transition-colors"
            >
              <RotateCcw className="w-3 h-3 text-[#919191]" />
              <span>Reset location & status filters</span>
            </button>
          </div>
        )}
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
                <TableHead className="text-white font-medium text-sm h-10 px-6 font-sans">
                  Location
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
              {isLoading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <TableRow key={i} className="border-b border-white/10 h-16">
                    <TableCell colSpan={8}>
                      <Skeleton className="h-6 w-full bg-white/5" />
                    </TableCell>
                  </TableRow>
                ))
              ) : clients.length > 0 ? (
                clients.map((client) => {
                  const fullName = `${client.firstName} ${client.lastName}`;
                  const locationStr = [client.city, client.state, client.zip || client.zipCode].filter(Boolean).join(", ");
                  return (
                    <TableRow
                      key={client._id || client.id}
                      onClick={() => router.push(`/dashboard/clients/${client._id || client.id}`)}
                      className="border-b border-white/10 hover:bg-white/[0.02] transition-colors h-16 cursor-pointer"
                    >
                      {/* Name Column with Avatar & DOB */}
                      <TableCell className="px-6 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-[30px] h-[30px] rounded-full bg-white/10 flex items-center justify-center text-[11px] font-bold text-white flex-shrink-0 font-sans">
                            {getInitials(fullName)}
                          </div>
                          <div className="flex flex-col">
                            <span className="text-sm font-medium text-white font-sans leading-tight">
                              {fullName}
                            </span>
                            <span className="text-xs font-normal text-[#8C8C8C] font-sans">
                              {client.dateOfBirth ? `DOB ${new Date(client.dateOfBirth).toLocaleDateString("en-US", { year: 'numeric', month: '2-digit', day: '2-digit' })}` : "--"}
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

                      {/* Location Column (City, State, Zip) */}
                      <TableCell className="px-6 py-3 text-sm text-[#8C8C8C] font-sans">
                        {locationStr || "--"}
                      </TableCell>

                      {/* Contracts Count Column */}
                      <TableCell className="px-6 py-3 text-sm text-white font-sans text-center">
                        {client.contractsCount || 0}
                      </TableCell>

                      {/* Status Badge Column */}
                      <TableCell className="px-6 py-3">
                        <Badge
                          className={cn(
                            "px-2.5 py-0.5 rounded-[8px] text-xs font-medium capitalize font-sans",
                            STATUS_STYLES[client.status] || "bg-gray-600 hover:bg-gray-500 text-white border-0"
                          )}
                        >
                          {client.status}
                        </Badge>
                      </TableCell>

                      {/* Created Date Column */}
                      <TableCell className="px-6 py-3 text-sm text-white font-sans">
                        {new Date(client.createdAt).toLocaleDateString("en-US", { year: 'numeric', month: '2-digit', day: '2-digit' })}
                      </TableCell>

                      {/* Right Chevron Arrow Icon */}
                      <TableCell className="pr-4 py-3 text-right">
                        <ChevronRight className="w-4 h-4 text-white/50 inline-block" />
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={8} className="py-12">
                    <EmptyState 
                      icon={Users}
                      title="No clients found matching your search"
                      className="py-6 border-0 bg-transparent min-h-0"
                    />
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
            totalItems={totalItems}
            itemsPerPage={itemsPerPage}
            itemLabel="clients"
          />
        </div>
      </div>
    </div>
  );
}
