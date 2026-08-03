"use client";

interface ActivityItem {
  id: string;
  title: string;
  timestamp: string;
  subtext: string;
  author: string;
}

interface ActivityTabProps {
  activities: ActivityItem[];
}

export default function ActivityTab({ activities }: ActivityTabProps) {
  return (
    <div className="w-full bg-[#141C24] border border-[#0F1F3D]/12 rounded-[12px] overflow-hidden shadow-sm">
      {/* Header Row (#394A58) */}
      <div className="h-[65px] bg-[#394A58] px-6 flex items-center justify-between border-b border-white/10">
        <h3 className="text-lg lg:text-xl font-semibold text-white tracking-tight">
          Activity Log
        </h3>
      </div>

      {/* Timeline Container */}
      <div className="p-6">
        <div className="relative border-l border-[#686868] ml-3 pl-6 flex flex-col gap-6">
          {activities.map((act) => (
            <div key={act.id} className="relative flex flex-col gap-1">
              {/* Timeline Dot */}
              <div className="absolute -left-[31px] top-1 w-3 h-3 bg-[#0C1116] border-2 border-[#6887A0] rounded-full" />

              {/* Card Container */}
              <div className="w-full bg-[#0C1116] rounded-[8px] p-4 flex flex-col gap-1.5 border border-white/5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-white">
                    {act.title}
                  </span>
                  <span className="text-xs font-mono text-[#919191]">
                    {act.timestamp}
                  </span>
                </div>
                <p className="text-xs text-[#919191]">{act.subtext}</p>
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
