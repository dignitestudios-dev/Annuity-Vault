"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Pencil,
  Trash2,
  Download,
  ExternalLink,
  Plus,
  FileText,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/shared/empty-state";
import { Loader } from "@/components/ui/loader";
import EditContractDialog from "@/features/contracts/components/edit-contract-dialog";
import SuccessModal from "@/components/shared/success-modal";
import DeleteModal from "@/components/shared/delete-modal";
import ArchiveModal from "@/components/shared/archive-modal";
import toast from "react-hot-toast";

import { Skeleton } from "@/components/ui/skeleton";
import { format, differenceInDays } from "date-fns";
import { cn } from "@/lib/utils";
import {
  useContract,
  useDeleteContract,
  useAddContractNote,
  useDeleteContractNote,
  useAddContractDocument,
  useDeleteContractDocument,
} from "@/features/contracts/api/contracts.service";

const getStatusStyle = (status: string) => {
  switch (status?.toLowerCase()) {
    case "active":
      return "bg-[#42CD7F] text-white border-0";
    case "surrendered":
      return "bg-[#FF3E46] text-white border-0";
    case "matured":
      return "bg-[#39BDF6] text-white border-0";
    case "pending":
      return "bg-[#FFE600] text-black border-0 font-semibold";
    default:
      return "bg-gray-600 text-white border-0";
  }
};

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value || 0);
};

const formatAnniversary = (dateString?: string) => {
  if (!dateString) return "N/A";
  const date = new Date(dateString);
  const now = new Date();
  
  // Create a date for this year's anniversary
  const thisYearAnniversary = new Date(date);
  thisYearAnniversary.setFullYear(now.getFullYear());
  
  // If anniversary already passed this year, look at next year's
  if (thisYearAnniversary < now) {
    thisYearAnniversary.setFullYear(now.getFullYear() + 1);
  }
  
  const daysDiff = differenceInDays(thisYearAnniversary, now);
  const formattedDate = format(thisYearAnniversary, "yyyy-MM-dd");
  
  return `${formattedDate} (${daysDiff > 0 ? 'in ' : ''}${Math.abs(daysDiff)} days)`;
};

export default function ContractDetailsPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isSuccessOpen, setIsSuccessOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isArchiveOpen, setIsArchiveOpen] = useState(false);
  const [deletingItem, setDeletingItem] = useState<{ id: string; type: "note" | "document" | "contract" } | null>(null);
  const [newNote, setNewNote] = useState("");

  const params = useParams();
  const contractId = params.id as string;
  const { data: contract, isLoading } = useContract(contractId);
  const deleteContract = useDeleteContract();
  const addNote = useAddContractNote(contractId);
  const deleteNote = useDeleteContractNote(contractId);
  const addDocument = useAddContractDocument(contractId);
  const deleteDocument = useDeleteContractDocument(contractId);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 20 * 1024 * 1024) {
      toast.error("File size exceeds 20MB limit.");
      e.target.value = "";
      return;
    }

    addDocument.mutate(file, {
      onSuccess: () => {
        toast.success("Document uploaded successfully!");
        if (fileInputRef.current) fileInputRef.current.value = "";
      },
      onError: (err: any) => {
        toast.error(err?.message || "Failed to upload document");
      }
    });
  };

  const handleConfirmDelete = async () => {
    if (deletingItem?.type === "document" && deletingItem.id) {
      try {
        await deleteDocument.mutateAsync(deletingItem.id);
        toast.success("Document deleted successfully!");
      } catch (err: any) {
        toast.error(err?.message || "Failed to delete document");
      }
    } else if (deletingItem?.type === "note" && deletingItem.id) {
      try {
        await deleteNote.mutateAsync(deletingItem.id);
        toast.success("Note deleted successfully!");
      } catch (err: any) {
        toast.error(err?.message || "Failed to delete note");
      }
    } else if (deletingItem?.type === "contract") {
      try {
        await deleteContract.mutateAsync(contractId);
        setIsArchiveOpen(true);
      } catch (err: any) {
        toast.error(err?.message || "Failed to delete contract");
      }
    }
    setDeletingItem(null);
  };

  const handleArchiveClose = () => {
    setIsArchiveOpen(false);
    router.push("/dashboard/contracts");
  };

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.trim()) return;
    try {
      await addNote.mutateAsync(newNote.trim());
      setNewNote("");
      toast.success("Note added successfully!");
    } catch (err: any) {
      toast.error(err?.message || "Failed to add note");
    }
  };

  if (isLoading) {
    return (
      <div className="w-full flex flex-col gap-6 max-w-[1440px] mx-auto pb-12 font-sans p-6">
        <Skeleton className="w-full h-[300px] bg-white/5 rounded-[12px]" />
      </div>
    );
  }

  if (!contract) return null;

  return (
    <div className="w-full flex flex-col gap-6 max-w-[1440px] mx-auto pb-12 font-sans">
      {/* Top Header Navigation Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Left Side: Back Link & Title */}
        <div className="flex flex-col gap-2">
          <button
            type="button"
            onClick={() => router.back()}
            className="inline-flex items-center gap-1.5 text-sm text-white hover:text-[#6887A0] transition-colors self-start cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 text-white" />
            <span>Back</span>
          </button>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl lg:text-[28px] font-semibold text-white tracking-tight leading-tight">
              {contract.contractNumber}
            </h1>
            <Badge className={cn("px-2.5 py-0.5 rounded-[8px] text-xs font-medium capitalize", getStatusStyle(contract.status))}>
              {contract.status}
            </Badge>
          </div>
          <span className="text-sm font-normal text-[#919191]">
            {contract.provider} • {contract.contractType}
          </span>
        </div>

        {/* Right Side: Action Buttons */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setIsEditOpen(true)}
            className="h-9 px-4 bg-gradient-to-r from-[#66859E] to-[#849EB2] text-white hover:opacity-90 rounded-[12px] text-xs sm:text-sm font-medium transition-all flex items-center gap-2 shadow-sm"
          >
            <Pencil className="w-3.5 h-3.5 text-white" />
            <span>Edit</span>
          </button>
          <button
            onClick={() =>
              setDeletingItem({ id: contract.id, type: "contract" })
            }
            className="h-9 px-4 bg-[#FF0000] text-white hover:bg-red-600 rounded-[12px] text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm"
          >
            <Trash2 className="w-3.5 h-3.5 text-white" />
            <span>Delete</span>
          </button>
        </div>
      </div>

      {/* Main Grid Content: Left Details Card & Right Documents Card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Card: Contract Details (8 cols) */}
        <div className="lg:col-span-8 bg-[#141C24] border border-[#0F1F3D]/12 rounded-[12px] overflow-hidden shadow-sm flex flex-col">
          <div className="h-[48px] bg-[#394A58] px-6 flex items-center border-b border-white/10">
            <h3 className="text-base font-semibold text-white tracking-tight">
              Contract details
            </h3>
          </div>
          <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-y-6 gap-x-8 text-sm">
            <div className="flex flex-col gap-1">
              <span className="text-xs uppercase tracking-wider text-[#919191]">
                Client
              </span>
              <span className="text-white font-normal">
                {contract.client ? `${contract.client.firstName} ${contract.client.lastName}` : "N/A"}
              </span>
            </div>

            <div className="flex flex-col gap-1">
              <span className="text-xs uppercase tracking-wider text-[#919191]">
                Provider
              </span>
              <span className="text-white font-normal">
                {contract.provider}
              </span>
            </div>

            <div className="flex flex-col gap-1">
              <span className="text-xs uppercase tracking-wider text-[#919191]">
                Type
              </span>
              <span className="text-white font-normal">
                {contract.contractType}
              </span>
            </div>

            <div className="flex flex-col gap-1">
              <span className="text-xs uppercase tracking-wider text-[#919191]">
                Status
              </span>
              <div>
                <Badge className={cn("px-2.5 py-0.5 rounded-[8px] text-xs font-medium capitalize", getStatusStyle(contract.status))}>
                  {contract.status}
                </Badge>
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <span className="text-xs uppercase tracking-wider text-[#919191]">
                Start date
              </span>
              <span className="text-white font-normal">
                {contract.startDate ? format(new Date(contract.startDate), "yyyy-MM-dd") : "N/A"}
              </span>
            </div>

            <div className="flex flex-col gap-1">
              <span className="text-xs uppercase tracking-wider text-[#919191]">
                Anniversary
              </span>
              <span className="text-white font-normal">
                {formatAnniversary(contract.anniversaryDate)}
              </span>
            </div>

            <div className="flex flex-col gap-1">
              <span className="text-xs uppercase tracking-wider text-[#919191]">
                Premium
              </span>
              <span className="text-white font-normal">
                {formatCurrency(contract.premiumAmount)}
              </span>
            </div>

            <div className="flex flex-col gap-1">
              <span className="text-xs uppercase tracking-wider text-[#919191]">
                Current value
              </span>
              <span className="text-white font-normal">
                {formatCurrency(contract.contractValue)}
              </span>
            </div>

            <div className="sm:col-span-2 flex flex-col gap-1">
              <span className="text-xs uppercase tracking-wider text-[#919191]">
                Beneficiary
              </span>
              <span className="text-white font-normal">
                {contract.beneficiaryInformation || "N/A"}
              </span>
            </div>

            <div className="sm:col-span-2 flex flex-col gap-1">
              <span className="text-xs uppercase tracking-wider text-[#919191]">
                Notes
              </span>
              <span className="text-white font-normal whitespace-pre-wrap">
                {contract.notes || "None"}
              </span>
            </div>
          </div>
        </div>

        {/* Right Card: Documents (4 cols) */}
        <div className="lg:col-span-4 bg-[#141C24] border border-[#0F1F3D]/12 rounded-[12px] overflow-hidden shadow-sm flex flex-col">
          <div className="h-[48px] bg-[#394A58] px-4 flex items-center justify-between border-b border-white/10">
            <h3 className="text-base font-semibold text-white tracking-tight">
              Documents
            </h3>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              className="hidden"
              accept="image/*,.pdf,.doc,.docx,.xls,.xlsx"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={addDocument.isPending}
              className="h-7 px-3 bg-gradient-to-r from-[#66859E] to-[#849EB2] text-white font-medium hover:opacity-90 rounded-[12px] text-xs transition-all flex items-center gap-1 shadow-sm disabled:opacity-50 cursor-pointer"
            >
              {addDocument.isPending ? (
                <div className="flex items-center gap-1.5">
                  <Loader className="w-3 h-3 text-white" />
                  <span>Uploading...</span>
                </div>
              ) : (
                <>
                  <Plus className="w-3 h-3 text-white" />
                  <span>Upload Document</span>
                </>
              )}
            </button>
          </div>

          <div className="flex flex-col divide-y divide-white/10">
            {(contract.documents || []).length > 0 ? (
              (contract.documents || []).map((doc) => (
                <div
                  key={doc._id}
                  className="p-3.5 flex items-center justify-between gap-3 hover:bg-white/[0.02] transition-colors"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="w-8 h-8 bg-white/10 rounded-[8px] flex items-center justify-center text-white font-bold text-[10px] flex-shrink-0">
                      {doc.fileType?.split("/").pop()?.toUpperCase().substring(0, 4) || "DOC"}
                    </div>
                    <div className="flex flex-col gap-0.5 truncate">
                      <a
                        href={doc.location}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs font-medium text-white truncate hover:underline"
                      >
                        {doc.fileName}
                      </a>
                      <span className="text-[11px] text-[#919191] truncate">
                        {(doc.fileSize ? (doc.fileSize / 1024 / 1024).toFixed(2) : "0")} MB · Uploaded by {doc.uploadedBy || 'User'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    {doc.location && (
                      <>
                        <a
                          href={doc.location}
                          download
                          className="w-6 h-6 bg-[#42CD7F] rounded-[4px] flex items-center justify-center text-white hover:bg-emerald-600 transition-colors"
                        >
                          <Download className="w-3.5 h-3.5 text-white" />
                        </a>
                        <a
                          href={doc.location}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-6 h-6 bg-[#829CB0] rounded-[4px] flex items-center justify-center text-white hover:bg-slate-600 transition-colors"
                        >
                          <ExternalLink className="w-3.5 h-3.5 text-white" />
                        </a>
                      </>
                    )}
                    <button
                      onClick={() =>
                        setDeletingItem({ type: "document", id: doc._id })
                      }
                      className="w-6 h-6 bg-[#FF0000] rounded-[4px] flex items-center justify-center text-white hover:bg-red-600 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5 text-white" />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <EmptyState
                icon={FileText}
                title="No Documents"
                description="No documents found for this contract."
                className="py-12"
              />
            )}
          </div>
        </div>
      </div>

      {/* Bottom Card: Contract Notes */}
      <div className="w-full bg-[#141C24] border border-[#0F1F3D]/12 rounded-[12px] overflow-hidden shadow-sm flex flex-col">
        <div className="h-[48px] bg-[#394A58] px-6 flex items-center border-b border-white/10">
          <h3 className="text-base font-semibold text-white tracking-tight">
            Contract Notes
          </h3>
        </div>

        <div className="p-6 flex flex-col gap-6">
          {/* Add Note Input Bar */}
          <form onSubmit={handleAddNote} className="w-full flex items-center gap-3">
            <input
              type="text"
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              placeholder="Add a note to this contract…"
              className="flex-1 bg-[#0C1116] border-0 text-white placeholder-[#919191] text-xs sm:text-sm rounded-[12px] px-4 h-10 outline-none focus:ring-1 focus:ring-[#6887A0]"
            />
            <button
              type="submit"
              className="h-9 px-5 bg-gradient-to-r from-[#66859E] to-[#849EB2] text-white hover:opacity-90 rounded-[12px] text-xs sm:text-sm font-medium transition-all shadow-sm"
            >
              Add
            </button>
          </form>

          {/* Notes List */}
          <div className="w-full flex flex-col">
            {(contract.contractNotes || []).length > 0 ? (contract.contractNotes || []).map((note) => (
              <div
                key={note._id}
                className="w-full bg-[#0C1116] rounded-[8px] p-3.5 flex items-center justify-between gap-4 border border-white/5"
              >
                <div className="flex flex-col gap-1">
                  <p className="text-xs sm:text-sm text-white font-normal">
                    {note.body}
                  </p>
                  <span className="text-[11px] text-[#919191]">{format(new Date(note.createdAt), "MMM d, yyyy h:mm a")}</span>
                </div>
                <button
                  onClick={() =>
                    setDeletingItem({ type: "note", id: note._id })
                  }
                  className="w-6 h-6 bg-[#FF0000] rounded-[4px] flex items-center justify-center text-white hover:bg-red-600 transition-colors flex-shrink-0"
                >
                  <Trash2 className="w-3.5 h-3.5 text-white" />
                </button>
              </div>
            )) : (
              <EmptyState
                icon={FileText}
                title="No Notes"
                description="No notes have been added to this contract yet."
                className="py-12"
              />
            )}
          </div>
        </div>
      </div>

      {/* Edit Contract Dialog */}
      <EditContractDialog
        contract={contract}
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        onSubmitSuccess={() => setIsSuccessOpen(true)}
      />

      {/* Contract Updated Success Popup */}
      <SuccessModal
        isOpen={isSuccessOpen}
        onClose={() => setIsSuccessOpen(false)}
        title="Contract Updated!"
        description="Your contract folder has been updated successfully!"
      />

      {/* Delete Confirmation Modal */}
      <DeleteModal
        isOpen={!!deletingItem}
        onClose={() => setDeletingItem(null)}
        onConfirm={handleConfirmDelete}
        title={
          deletingItem?.type === "document"
            ? "Delete Document"
            : deletingItem?.type === "note"
            ? "Delete Note"
            : "Delete Contract"
        }
        description={
          deletingItem?.type === "document"
            ? "Are you sure you want to delete this document?"
            : deletingItem?.type === "note"
            ? "Are you sure you want to delete this note?"
            : "Are you sure you want to delete this contract?"
        }
      />

      {/* File Moved to Archive Modal */}
      <ArchiveModal
        isOpen={isArchiveOpen}
        onClose={handleArchiveClose}
      />
    </div>
  );
}
