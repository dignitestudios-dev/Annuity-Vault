"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Pencil,
  Trash2,
  Download,
  ExternalLink,
  Plus,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import EditContractDialog from "@/features/contracts/components/edit-contract-dialog";
import SuccessModal from "@/components/shared/success-modal";
import DeleteModal from "@/components/shared/delete-modal";
import ArchiveModal from "@/components/shared/archive-modal";

const CONTRACT_DETAILS = {
  id: "IX-239032",
  client: "Jacob Thompson",
  provider: "Equitable",
  type: "Immediate",
  status: "Surrendered",
  issueDate: "2020-08-04",
  anniversary: "2027-03-06 (in 256 days)",
  premium: "$305,000",
  currentValue: "$127,416",
  beneficiary: "Stephanie Lewis (Sibling) — 100%",
  notes: "Client requested allocation rebalance after market",
};

const INITIAL_DOCUMENTS = [
  {
    id: "d1",
    name: "Pacific Life Policy Contract.pdf",
    meta: "2.4 MB · Uploaded 2022-01-18 by A. Smith",
  },
  {
    id: "d2",
    name: "Suitability Form — Smith.pdf",
    meta: "890 KB · Uploaded 2022-01-18 by A. Smith",
  },
  {
    id: "d3",
    name: "Beneficiary Designation.pdf",
    meta: "450 KB · Uploaded 2022-02-03 by A. Smith",
  },
  {
    id: "d4",
    name: "Athene Application 2023.pdf",
    meta: "1.8 MB · Uploaded 2023-06-22 by A. Smith",
  },
];

const INITIAL_NOTES = [
  {
    id: "n1",
    text: "Anniversary review completed; no changes requested",
    date: "2025-09-02",
  },
];

export default function ContractDetailsPage() {
  const router = useRouter();
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isSuccessOpen, setIsSuccessOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isArchiveOpen, setIsArchiveOpen] = useState(false);

  const [documents, setDocuments] = useState(INITIAL_DOCUMENTS);
  const [notes, setNotes] = useState(INITIAL_NOTES);
  const [newNote, setNewNote] = useState("");

  const [deletingItem, setDeletingItem] = useState<{
    type: "contract" | "document" | "note";
    id?: string;
  } | null>(null);

  const handleConfirmDelete = () => {
    if (deletingItem?.type === "document" && deletingItem.id) {
      setDocuments(documents.filter((d) => d.id !== deletingItem.id));
    } else if (deletingItem?.type === "note" && deletingItem.id) {
      setNotes(notes.filter((n) => n.id !== deletingItem.id));
    }
    setDeletingItem(null);
    setIsArchiveOpen(true);
  };

  const handleArchiveClose = () => {
    setIsArchiveOpen(false);
    router.push("/dashboard/archived");
  };

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.trim()) return;
    setNotes([
      {
        id: Date.now().toString(),
        text: newNote.trim(),
        date: new Date().toISOString().split("T")[0],
      },
      ...notes,
    ]);
    setNewNote("");
  };

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
              {CONTRACT_DETAILS.id}
            </h1>
            <Badge className="bg-[#FF3E46] text-white border-0 px-2.5 py-0.5 rounded-[8px] text-xs font-medium capitalize">
              {CONTRACT_DETAILS.status}
            </Badge>
          </div>
          <span className="text-sm font-normal text-[#919191]">
            {CONTRACT_DETAILS.provider} • {CONTRACT_DETAILS.type}
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
              setDeletingItem({ type: "contract" })
            }
            className="h-9 px-4 bg-[#FF0000] text-white hover:bg-red-600 rounded-[12px] text-xs sm:text-sm font-medium transition-all flex items-center gap-2 shadow-sm"
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
                {CONTRACT_DETAILS.client}
              </span>
            </div>

            <div className="flex flex-col gap-1">
              <span className="text-xs uppercase tracking-wider text-[#919191]">
                Provider
              </span>
              <span className="text-white font-normal">
                {CONTRACT_DETAILS.provider}
              </span>
            </div>

            <div className="flex flex-col gap-1">
              <span className="text-xs uppercase tracking-wider text-[#919191]">
                Type
              </span>
              <span className="text-white font-normal">
                {CONTRACT_DETAILS.type}
              </span>
            </div>

            <div className="flex flex-col gap-1">
              <span className="text-xs uppercase tracking-wider text-[#919191]">
                Status
              </span>
              <div>
                <Badge className="bg-[#FF3E46] text-white border-0 px-2.5 py-0.5 rounded-[8px] text-xs font-medium capitalize">
                  {CONTRACT_DETAILS.status}
                </Badge>
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <span className="text-xs uppercase tracking-wider text-[#919191]">
                Issue date
              </span>
              <span className="text-white font-normal">
                {CONTRACT_DETAILS.issueDate}
              </span>
            </div>

            <div className="flex flex-col gap-1">
              <span className="text-xs uppercase tracking-wider text-[#919191]">
                Anniversary
              </span>
              <span className="text-white font-normal">
                {CONTRACT_DETAILS.anniversary}
              </span>
            </div>

            <div className="flex flex-col gap-1">
              <span className="text-xs uppercase tracking-wider text-[#919191]">
                Premium
              </span>
              <span className="text-white font-normal">
                {CONTRACT_DETAILS.premium}
              </span>
            </div>

            <div className="flex flex-col gap-1">
              <span className="text-xs uppercase tracking-wider text-[#919191]">
                Current value
              </span>
              <span className="text-white font-normal">
                {CONTRACT_DETAILS.currentValue}
              </span>
            </div>

            <div className="sm:col-span-2 flex flex-col gap-1">
              <span className="text-xs uppercase tracking-wider text-[#919191]">
                Beneficiary
              </span>
              <span className="text-white font-normal">
                {CONTRACT_DETAILS.beneficiary}
              </span>
            </div>

            <div className="sm:col-span-2 flex flex-col gap-1">
              <span className="text-xs uppercase tracking-wider text-[#919191]">
                Notes
              </span>
              <span className="text-white font-normal">
                {CONTRACT_DETAILS.notes}
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
            <button className="h-7 px-3 bg-gradient-to-r from-[#66859E] to-[#849EB2] text-white font-medium hover:opacity-90 rounded-[12px] text-xs transition-all flex items-center gap-1 shadow-sm">
              <Plus className="w-3 h-3 text-white" />
              <span>Upload Document</span>
            </button>
          </div>

          <div className="flex flex-col divide-y divide-white/10">
            {documents.map((doc) => (
              <div
                key={doc.id}
                className="p-3.5 flex items-center justify-between gap-3 hover:bg-white/[0.02] transition-colors"
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="w-8 h-8 bg-white/10 rounded-[8px] flex items-center justify-center text-white font-bold text-[10px] flex-shrink-0">
                    PDF
                  </div>
                  <div className="flex flex-col gap-0.5 truncate">
                    <span className="text-xs font-medium text-white truncate">
                      {doc.name}
                    </span>
                    <span className="text-[11px] text-[#919191] truncate">
                      {doc.meta}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <button className="w-6 h-6 bg-[#FF0000] rounded-[4px] flex items-center justify-center text-white hover:bg-red-600 transition-colors">
                    <Trash2
                      onClick={() =>
                        setDeletingItem({ type: "document", id: doc.id })
                      }
                      className="w-3.5 h-3.5 text-white"
                    />
                  </button>
                </div>
              </div>
            ))}
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
            {notes.map((note) => (
              <div
                key={note.id}
                className="w-full bg-[#0C1116] rounded-[8px] p-3.5 flex items-center justify-between gap-4 border border-white/5"
              >
                <div className="flex flex-col gap-1">
                  <p className="text-xs sm:text-sm text-white font-normal">
                    {note.text}
                  </p>
                  <span className="text-[11px] text-[#919191]">{note.date}</span>
                </div>
                <button
                  onClick={() =>
                    setDeletingItem({ type: "note", id: note.id })
                  }
                  className="w-6 h-6 bg-[#FF0000] rounded-[4px] flex items-center justify-center text-white hover:bg-red-600 transition-colors flex-shrink-0"
                >
                  <Trash2 className="w-3.5 h-3.5 text-white" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Edit Contract Dialog */}
      <EditContractDialog
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
