"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Download, ExternalLink, Trash2 } from "lucide-react";
import DeleteModal from "@/components/shared/delete-modal";
import ArchiveModal from "@/components/shared/archive-modal";

interface DocumentItem {
  id: string;
  name: string;
  meta: string;
}

interface DocumentsTabProps {
  documents: DocumentItem[];
}

export default function DocumentsTab({ documents }: DocumentsTabProps) {
  const router = useRouter();
  const [docList, setDocList] = useState(documents);
  const [deletingDocId, setDeletingDocId] = useState<string | null>(null);
  const [isArchiveOpen, setIsArchiveOpen] = useState(false);

  const confirmDeleteDoc = () => {
    if (deletingDocId) {
      setDocList(docList.filter((doc) => doc.id !== deletingDocId));
      setDeletingDocId(null);
      setIsArchiveOpen(true);
    }
  };

  const handleArchiveClose = () => {
    setIsArchiveOpen(false);
    router.push("/dashboard/archived");
  };

  return (
    <div className="w-full bg-[#141C24] border border-[#0F1F3D]/12 rounded-[12px] overflow-hidden shadow-sm">
      {/* Header Row (#394A58) */}
      <div className="h-[65px] bg-[#394A58] px-6 flex items-center justify-between border-b border-white/10">
        <h3 className="text-lg lg:text-xl font-semibold text-white tracking-tight">
          Documents
        </h3>
        <button className="h-8 px-3.5 bg-gradient-to-r from-[#66859E] to-[#849EB2] text-white font-medium hover:opacity-90 rounded-[12px] text-xs sm:text-sm transition-all flex items-center gap-2 shadow-sm">
          <span>Upload Document</span>
        </button>
      </div>

      {/* Documents List */}
      <div className="w-full flex flex-col">
        {docList.map((doc) => (
          <div
            key={doc.id}
            className="w-full border-b border-white/10 px-6 py-4 flex items-center justify-between gap-4"
          >
            {/* File Icon & Info */}
            <div className="flex items-center gap-3.5 flex-1">
              <div className="w-[34px] h-[34px] bg-white/10 rounded-[8px] flex items-center justify-center text-white font-bold text-xs">
                PDF
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-sm font-medium text-white">
                  {doc.name}
                </span>
                <span className="text-xs text-[#919191]">{doc.meta}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <button className="w-6 h-6 bg-[#42CD7F] rounded-[4px] flex items-center justify-center text-white hover:bg-emerald-600 transition-colors">
                <Download className="w-3.5 h-3.5 text-white" />
              </button>
              <button className="w-6 h-6 bg-[#829CB0] rounded-[4px] flex items-center justify-center text-white hover:bg-slate-600 transition-colors">
                <ExternalLink className="w-3.5 h-3.5 text-white" />
              </button>
              <button
                onClick={() => setDeletingDocId(doc.id)}
                className="w-6 h-6 bg-[#FF0000] rounded-[4px] flex items-center justify-center text-white hover:bg-red-600 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5 text-white" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Delete Document Confirmation Modal */}
      <DeleteModal
        isOpen={!!deletingDocId}
        onClose={() => setDeletingDocId(null)}
        onConfirm={confirmDeleteDoc}
        title="Delete Document"
        description="Are you sure you want to delete this document?"
      />

      {/* File Moved to Archive Modal */}
      <ArchiveModal
        isOpen={isArchiveOpen}
        onClose={handleArchiveClose}
      />
    </div>
  );
}
