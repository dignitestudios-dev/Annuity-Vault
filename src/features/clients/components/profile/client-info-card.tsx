"use client";

import { Mail, Phone, MapPin, Calendar as CalendarIcon } from "lucide-react";

interface ClientInfoCardProps {
  name: string;
  clientSince: string;
  created: string;
  email: string;
  phone: string;
  address: string;
  dob: string;
}

export default function ClientInfoCard({
  name,
  clientSince,
  created,
  email,
  phone,
  address,
  dob,
}: ClientInfoCardProps) {
  return (
    <div className="w-full bg-[#141C24] border border-[#0F1F3D]/12 rounded-[12px] p-6 flex flex-col gap-4 shadow-sm relative overflow-hidden">
      {/* Header Row: Name & Created Date */}
      <div className="flex items-start justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl lg:text-[28px] font-bold text-white tracking-tight leading-tight">
            {name}
          </h1>
          <span className="text-sm font-normal text-[#828282]">
            Client since {clientSince}
          </span>
        </div>
        <div className="flex flex-col items-end text-right">
          <span className="text-xs font-bold text-white">
            Created
          </span>
          <span className="text-xs font-normal text-[#828282]">
            {created}
          </span>
        </div>
      </div>

      {/* Divider */}
      <div className="w-full border-t border-[#262E35]" />

      {/* Metadata Details Row */}
      <div className="flex flex-row items-center flex-wrap gap-x-6 gap-y-3 text-sm text-white pt-1">
        <div className="flex items-center gap-2">
          <Mail className="w-4 h-4 text-white flex-shrink-0" />
          <span>{email}</span>
        </div>
        <div className="flex items-center gap-2">
          <Phone className="w-4 h-4 text-white flex-shrink-0" />
          <span>{phone}</span>
        </div>
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-white flex-shrink-0" />
          <span>{address}</span>
        </div>
        <div className="flex items-center gap-2">
          <CalendarIcon className="w-4 h-4 text-white flex-shrink-0" />
          <span>{dob.replace("DOB ", "")}</span>
        </div>
      </div>
    </div>
  );
}
