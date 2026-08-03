"use client";

import { Activity as ActivityIcon } from "lucide-react";

const ACTIVITIES = [
  {
    id: "a1",
    title: "Record Edited",
    timestamp: "2024-08-05 10:45",
    subtext: "Updated beneficiary information for Jacob Thompson",
    author: "by A. Smith",
  },
  {
    id: "a2",
    title: "Contract Created",
    timestamp: "2023-06-22 11:00",
    subtext: "Added annuity contract AV-2023-003312",
    author: "by A. Smith",
  },
  {
    id: "a3",
    title: "Note Added",
    timestamp: "2023-04-12 14:15",
    subtext: "Added note under 'Strategy' category",
    author: "by A. Smith",
  },
  {
    id: "a4",
    title: "Contract Created",
    timestamp: "2022-01-18 09:30",
    subtext: "Added annuity contract AV-2022-001847",
    author: "by A. Smith",
  },
  {
    id: "a5",
    title: "Document Uploaded",
    timestamp: "2022-01-18 09:24",
    subtext: "Uploaded 'Pacific Life Policy Contract.pdf'",
    author: "by A. Smith",
  },
];

export default function ActivityPage() {
  return (
    <div className="w-full flex flex-col gap-6 max-w-[1440px] mx-auto pb-12 font-sans">
      {/* Header Row */}
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-3">
          <ActivityIcon className="w-7 h-7 text-[#6887A0]" />
          <h1 className="text-2xl lg:text-[32px] font-semibold text-white tracking-tight leading-tight">
            Activity & Audit Log
          </h1>
        </div>
        <p className="text-xs sm:text-sm text-[#919191]">
          Complete chronological history of changes, updates, uploads, and record creations across your Annuity Vault account.
        </p>
      </div>

      {/* Activity Timeline Card */}
      <div className="w-full bg-[#141C24] border border-[#0F1F3D]/12 rounded-[12px] overflow-hidden shadow-sm p-6">
        <div className="relative border-l border-[#686868] ml-3 pl-6 flex flex-col gap-6">
          {ACTIVITIES.map((act) => (
            <div key={act.id} className="relative flex flex-col gap-1">
              {/* Timeline Dot */}
              <div className="absolute -left-[31px] top-1 w-3 h-3 bg-[#0C1116] border-2 border-[#6887A0] rounded-full" />

              {/* Card Container */}
              <div className="w-full bg-[#0C1116] rounded-[8px] p-4 flex flex-col gap-1.5 border border-white/5">
                <div className="flex items-center justify-between">
                  <span className="text-xs sm:text-sm font-semibold text-white">
                    {act.title}
                  </span>
                  <span className="text-xs font-mono text-[#919191]">
                    {act.timestamp}
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-[#919191]">{act.subtext}</p>
                <span className="text-xs font-medium text-white">
                  {act.author}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
