"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  FileText,
  FileCode,
  CheckSquare,
  Activity as ActivityIcon,
} from "lucide-react";
import EditClientDialog from "@/features/clients/components/edit-client-dialog";
import SuccessModal from "@/components/shared/success-modal";
import DeleteModal from "@/components/shared/delete-modal";
import ArchiveModal from "@/components/shared/archive-modal";
import ClientProfileHeader from "@/features/clients/components/profile/client-profile-header";
import ClientInfoCard from "@/features/clients/components/profile/client-info-card";
import ContractsTab from "@/features/clients/components/profile/contracts-tab";
import NotesTab from "@/features/clients/components/profile/notes-tab";
import DocumentsTab from "@/features/clients/components/profile/documents-tab";
import TasksTab from "@/features/clients/components/profile/tasks-tab";
import ActivityTab from "@/features/clients/components/profile/activity-tab";
import { cn } from "@/lib/utils";

const CLIENT_DATA = {
  id: "1",
  initials: "JT",
  name: "Jacob Thompson",
  dob: "DOB 1947-06-01",
  email: "jacob.thompson0@example.com",
  phone: "(322) 573-3458",
  address: "5722 Magnolia Pkwy, Seattle, WA",
  contracts: 4,
  status: "Archived" as const,
  created: "2024-10-07",
  clientSince: "2024-10-07",
  notes: "Client prefers quarterly review calls.",
};

const CONTRACTS = [
  {
    contractNo: "IX-239032",
    provider: "Equitable",
    type: "Immediate",
    value: "$127,416",
    anniversary: "2027-03-06 (256d)",
    status: "Surrendered",
    statusStyle: "bg-[#FF3E46] text-white border-0",
  },
  {
    contractNo: "VR-601714",
    provider: "Equitable",
    type: "Fixed",
    value: "$400,603",
    anniversary: "2026-10-15 (114d)",
    status: "Matured",
    statusStyle: "bg-[#39BDF6] text-white border-0",
  },
  {
    contractNo: "FX-323530",
    provider: "Jackson National",
    type: "Deferred",
    value: "$141,795",
    anniversary: "2027-02-01 (223d)",
    status: "Active",
    statusStyle: "bg-[#42CD7F] text-white border-0",
  },
  {
    contractNo: "FX-759316",
    provider: "Symetra",
    type: "Deferred",
    value: "$404,832",
    anniversary: "2027-01-30 (221d)",
    status: "Pending",
    statusStyle: "bg-[#FFE600] text-black border-0 font-semibold",
  },
];

const INITIAL_NOTES = [
  {
    id: "n1",
    text: "Client requested allocation rebalance after market volatility.",
    date: "2026-04-16",
  },
  {
    id: "n2",
    text: "Client considering 1035 exchange to lower-fee product.",
    date: "2026-01-12",
  },
  {
    id: "n3",
    text: "Discussed beneficiary update during quarterly review.",
    date: "2026-04-15",
  },
  {
    id: "n4",
    text: "Anniversary review completed; no changes requested.",
    date: "2025-09-02",
  },
  {
    id: "n5",
    text: "Updated address and contact preferences in CRM.",
    date: "2025-11-14",
  },
];

const DOCUMENTS = [
  {
    id: "d1",
    name: "Pacific Life Policy Contract.pdf",
    meta: "2.4 MB · Uploaded 2022-01-18 by J. Harrison",
  },
  {
    id: "d2",
    name: "Suitability Form — Smith.pdf",
    meta: "890 KB · Uploaded 2022-01-18 by J. Harrison",
  },
  {
    id: "d3",
    name: "Beneficiary Designation.pdf",
    meta: "450 KB · Uploaded 2022-02-03 by J. Harrison",
  },
  {
    id: "d4",
    name: "Athene Application 2023.pdf",
    meta: "1.8 MB · Uploaded 2023-06-22 by J. Harrison",
  },
];

const TASKS = [
  {
    id: "t1",
    title: "Schedule annual review meeting",
    due: "2026-06-14",
    priority: "Medium",
    priorityStyle: "bg-[#33BBFF] text-white border-0",
    status: "In Progress",
    statusStyle: "bg-[#FF9D00] text-black border-0 font-semibold",
  },
];

const ACTIVITIES = [
  {
    id: "a1",
    title: "Record Edited",
    timestamp: "2024-08-05 10:45",
    subtext: "Updated beneficiary information",
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

const TABS = [
  { id: "contracts", label: "Contracts (4)", icon: FileText },
  { id: "notes", label: "Notes (7)", icon: FileCode },
  { id: "documents", label: "Documents (4)", icon: FileText },
  { id: "tasks", label: "Tasks (1)", icon: CheckSquare },
  { id: "activity", label: "Activity", icon: ActivityIcon },
];

export default function ClientDetailsPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("contracts");
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isSuccessOpen, setIsSuccessOpen] = useState(false);
  const [isDeleteClientOpen, setIsDeleteClientOpen] = useState(false);
  const [isArchiveOpen, setIsArchiveOpen] = useState(false);

  const handleDeleteClientConfirm = () => {
    setIsArchiveOpen(true);
  };

  const handleArchiveClose = () => {
    setIsArchiveOpen(false);
    router.push("/dashboard/archived");
  };

  return (
    <div className="w-full flex flex-col gap-6 max-w-[1440px] mx-auto pb-12 font-sans">
      {/* Top Header */}
      <ClientProfileHeader
        status={CLIENT_DATA.status}
        onEditClick={() => setIsEditOpen(true)}
        onDeleteClick={() => setIsDeleteClientOpen(true)}
      />

      {/* Client Information Card */}
      <ClientInfoCard
        name={CLIENT_DATA.name}
        clientSince={CLIENT_DATA.clientSince}
        created={CLIENT_DATA.created}
        email={CLIENT_DATA.email}
        phone={CLIENT_DATA.phone}
        address={CLIENT_DATA.address}
        dob={CLIENT_DATA.dob}
      />

      {/* Tab Navigation Header Bar */}
      <div className="w-full bg-[#394A58] p-1.5 rounded-[12px] flex items-center gap-1.5 overflow-x-auto">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "h-8 px-4 rounded-[10px] text-xs sm:text-sm font-medium flex items-center gap-2 whitespace-nowrap transition-all font-sans",
                isActive
                  ? "bg-gradient-to-r from-[#66859E] to-[#849EB2] text-white shadow-sm"
                  : "text-[#919191] hover:text-white hover:bg-white/5"
              )}
            >
              <Icon className={cn("w-4 h-4", isActive ? "text-white" : "text-[#919191]")} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Dynamic Tab Panels */}
      {activeTab === "contracts" && <ContractsTab contracts={CONTRACTS} />}
      {activeTab === "notes" && <NotesTab initialNotes={INITIAL_NOTES} />}
      {activeTab === "documents" && <DocumentsTab documents={DOCUMENTS} />}
      {activeTab === "tasks" && <TasksTab tasks={TASKS} />}
      {activeTab === "activity" && <ActivityTab activities={ACTIVITIES} />}

      {/* Edit Client Modal */}
      <EditClientDialog
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        client={CLIENT_DATA}
        onUpdateSuccess={() => setIsSuccessOpen(true)}
      />

      {/* Reusable Success Popup Modal */}
      <SuccessModal
        isOpen={isSuccessOpen}
        onClose={() => setIsSuccessOpen(false)}
        title="Client Updated!"
        description="Your client folder has been updated successfully!"
      />

      {/* Delete Client Confirmation Modal */}
      <DeleteModal
        isOpen={isDeleteClientOpen}
        onClose={() => setIsDeleteClientOpen(false)}
        onConfirm={handleDeleteClientConfirm}
        title="Delete Client"
        description="Are you sure you want to delete this client?"
      />

      {/* File Moved to Archive Confirmation Modal */}
      <ArchiveModal
        isOpen={isArchiveOpen}
        onClose={handleArchiveClose}
      />
    </div>
  );
}
