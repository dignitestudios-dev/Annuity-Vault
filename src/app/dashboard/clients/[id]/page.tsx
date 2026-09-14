"use client";
import { Loader } from "@/components/ui/loader";
import { Skeleton } from "@/components/ui/skeleton";

import { useState, useEffect, Suspense } from "react";
import {
  useRouter,
  useSearchParams,
  usePathname,
  useParams,
} from "next/navigation";
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
import {
  useClient,
  useDeleteClient,
} from "@/features/clients/api/clients.service";
import { useContracts } from "@/features/contracts/api/contracts.service";
import { useTasks } from "@/features/tasks/api/tasks.service";

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

const TABS_CONFIG = [
  { id: "contracts", label: "Contracts", icon: FileText },
  { id: "notes", label: "Notes", icon: FileCode },
  { id: "documents", label: "Documents", icon: FileText },
  { id: "tasks", label: "Tasks", icon: CheckSquare },
  { id: "activity", label: "Activity", icon: ActivityIcon },
];

function ClientDetailsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const tabParam = searchParams.get("tab");
  const [activeTab, setActiveTab] = useState(tabParam || "contracts");
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isSuccessOpen, setIsSuccessOpen] = useState(false);
  const [isDeleteClientOpen, setIsDeleteClientOpen] = useState(false);
  const [isArchiveOpen, setIsArchiveOpen] = useState(false);

  const params = useParams();
  const clientId = typeof params?.id === "string" ? params.id : "";

  const { data: client, isLoading } = useClient(clientId);
  const deleteClientMutation = useDeleteClient();
  const { data: contractsData, isLoading: isLoadingContracts } = useContracts({
    client: clientId,
    limit: 100,
  });
  const { data: tasksData, isLoading: isLoadingTasks } = useTasks({
    client: clientId,
    limit: 100,
  });

  // Synchronize state when URL query parameter changes
  useEffect(() => {
    if (tabParam && TABS_CONFIG.some((t) => t.id === tabParam)) {
      setActiveTab(tabParam);
    }
  }, [tabParam]);

  const handleTabChange = (newTab: string) => {
    setActiveTab(newTab);
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", newTab);
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const handleDeleteClientConfirm = () => {
    deleteClientMutation.mutate(clientId, {
      onSuccess: () => {
        setIsDeleteClientOpen(false);
        router.push("/dashboard/clients");
      },
    });
  };

  const handleArchiveClose = () => {
    setIsArchiveOpen(false);
    router.push("/dashboard/archived");
  };

  if (isLoading) {
    return (
      <div className="w-full flex flex-col gap-6 max-w-[1440px] mx-auto pb-12 font-sans mt-6">
        <Skeleton className="w-full h-[60px] bg-[#141C24] rounded-[12px]" />
        <Skeleton className="w-full h-[120px] bg-[#141C24] rounded-[12px]" />
        <Skeleton className="w-full h-[40px] bg-[#141C24] rounded-[12px]" />
        <Skeleton className="w-full h-[400px] bg-[#141C24] rounded-[12px]" />
      </div>
    );
  }

  if (!client) {
    return <div className="text-white p-6 font-sans">Client not found.</div>;
  }

  const fullName = `${client.firstName} ${client.lastName}`.trim();

  // Map backend contracts data
  const mappedContracts = (contractsData?.data || []).map((c: any) => {
    let statusStyle = "bg-[#FFE600] text-black border-0 font-semibold";
    if (c.status === "Active") statusStyle = "bg-[#42CD7F] text-white border-0";
    if (c.status === "Surrendered")
      statusStyle = "bg-[#FF3E46] text-white border-0";
    if (c.status === "Matured")
      statusStyle = "bg-[#39BDF6] text-white border-0";

    const date = new Date(c.anniversaryDate);
    const dateStr = date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
    const diff = Math.ceil(
      (date.getTime() - new Date().getTime()) / (1000 * 3600 * 24),
    );
    const anniversaryStr = `${dateStr} (${diff > 0 ? diff + "d" : "past"})`;

    return {
      id: c._id || c.id,
      contractNo: c.contractNumber || c.policyNumber || "N/A",
      provider: c.provider,
      type: c.contractType,
      value: `$${(c.contractValue || 0).toLocaleString()}`,
      anniversary: anniversaryStr,
      status: c.status,
      statusStyle,
    };
  });

  // Map backend tasks data
  const mappedTasks = (tasksData?.data || []).map((t: any) => {
    let priorityStyle = "bg-[#33BBFF] text-white border-0"; // Medium
    if (t.priority === "Urgent")
      priorityStyle = "bg-[#FF3E46] text-white border-0";
    if (t.priority === "High")
      priorityStyle = "bg-[#FF9D00] text-black border-0 font-semibold";
    if (t.priority === "Low")
      priorityStyle = "bg-[#42CD7F] text-white border-0";

    let statusStyle = "bg-[#FFE600] text-black border-0 font-semibold"; // To Do
    if (t.status === "In Progress")
      statusStyle = "bg-[#FF9D00] text-black border-0 font-semibold";
    if (t.status === "Done") statusStyle = "bg-[#42CD7F] text-white border-0";

    const dateStr = t.dueDate
      ? new Date(t.dueDate).toLocaleDateString("en-US", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      })
      : "No Date";

    return {
      id: t._id,
      title: t.title,
      description: t.description || "",
      due: dateStr,
      priority: t.priority,
      priorityStyle,
      status: t.status,
      statusStyle,
    };
  });

  const TABS = TABS_CONFIG.map((t) => {
    if (t.id === "contracts")
      return { ...t, label: `Contracts (${contractsData?.total || 0})` };
    if (t.id === "tasks")
      return { ...t, label: `Tasks (${tasksData?.pagination?.totalItems || 0})` };
    if (t.id === "notes")
      return { ...t, label: `Notes (${client?.clientNotes?.length || 0})` };
    if (t.id === "documents")
      return { ...t, label: `Documents (${client?.documents?.length || 0})` };
    return t;
  });

  return (
    <div className="w-full flex flex-col gap-6 max-w-[1440px] mx-auto pb-12 font-sans">
      {/* Top Header */}
      <ClientProfileHeader
        status={client.status as any}
        onEditClick={() => setIsEditOpen(true)}
        onDeleteClick={() => setIsDeleteClientOpen(true)}
      />

      {/* Client Information Card */}
      <ClientInfoCard
        name={fullName || "Unknown Client"}
        clientSince={
          client.createdAt
            ? new Date(client.createdAt).toLocaleDateString("en-US", {
              year: "numeric",
              month: "2-digit",
              day: "2-digit",
            })
            : "--"
        }
        created={
          client.createdAt
            ? new Date(client.createdAt).toLocaleDateString("en-US", {
              year: "numeric",
              month: "2-digit",
              day: "2-digit",
            })
            : "--"
        }
        email={client.email || "--"}
        phone={client.phone || "--"}
        address={client.address || "--"}
        dob={
          client.dateOfBirth
            ? `DOB ${new Date(client.dateOfBirth).toLocaleDateString("en-US", { year: "numeric", month: "2-digit", day: "2-digit" })}`
            : "--"
        }
      />

      {/* Tab Navigation Header Bar */}
      <div className="w-full bg-[#394A58] p-1.5 rounded-[12px] flex items-center gap-1.5 overflow-x-auto">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={cn(
                "h-8 px-4 rounded-[10px] text-xs sm:text-sm font-medium flex items-center gap-2 whitespace-nowrap transition-all font-sans cursor-pointer",
                isActive
                  ? "bg-gradient-to-r from-[#66859E] to-[#849EB2] text-white shadow-sm"
                  : "text-[#919191] hover:text-white hover:bg-white/5",
              )}
            >
              <Icon
                className={cn(
                  "w-4 h-4",
                  isActive ? "text-white" : "text-[#919191]",
                )}
              />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Dynamic Tab Panels */}
      {activeTab === "contracts" && (
        <ContractsTab
          clientId={clientId || client?.id || client?._id}
          contracts={mappedContracts}
          isLoading={isLoadingContracts}
        />
      )}
      {activeTab === "notes" && <NotesTab clientId={clientId || client?.id || client?._id || ""} notes={client?.clientNotes || []} />}
      {activeTab === "documents" && <DocumentsTab clientId={clientId || client?.id || client?._id || ""} documents={client?.documents || []} />}
      {activeTab === "tasks" && (
        <TasksTab
          clientId={clientId || client?.id || client?._id}
          clientName={client ? `${client.firstName} ${client.lastName}` : ""}
          tasks={mappedTasks}
          isLoading={isLoadingTasks}
        />
      )}
      {activeTab === "activity" && (
        <ActivityTab
          clientId={clientId || client?.id || client?._id}
          clientName={client ? `${client.firstName} ${client.lastName}` : ""}
        />
      )}

      {/* Edit Client Modal */}
      <EditClientDialog
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        client={client}
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
        isPending={deleteClientMutation.isPending}
        title="Delete Client"
        description="Are you sure you want to delete this client?"
      />

      {/* File Moved to Archive Confirmation Modal */}
      <ArchiveModal isOpen={isArchiveOpen} onClose={handleArchiveClose} />
    </div>
  );
}

export default function ClientDetailsPage() {
  return (
    <Suspense
      fallback={
        <div className="w-full flex flex-col gap-6 max-w-[1440px] mx-auto pb-10">
          <Skeleton className="h-[400px] w-full bg-white/5 rounded-xl" />
        </div>
      }
    >
      <ClientDetailsContent />
    </Suspense>
  );
}
