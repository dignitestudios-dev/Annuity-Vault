"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Download, ExternalLink, Trash2, FileText } from "lucide-react";
import DeleteModal from "@/components/shared/delete-modal";
import { EmptyState } from "@/components/shared/empty-state";
import ArchiveModal from "@/components/shared/archive-modal";
import { useUploadClientDocument, useArchiveClientDocument } from "../../api/clients.service";
import { ClientDocument } from "../../types/clients.types";
import { Loader } from "@/components/ui/loader";

interface DocumentsTabProps {
  clientId: string;
  documents: ClientDocument[];
}

export default function DocumentsTab({ clientId, documents }: DocumentsTabProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [deletingDocId, setDeletingDocId] = useState<string | null>(null);
  const [isArchiveOpen, setIsArchiveOpen] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const uploadDocMutation = useUploadClientDocument();
  const archiveDocMutation = useArchiveClientDocument();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadError(null);

    // Validate size (20MB = 20 * 1024 * 1024 bytes)
    if (file.size > 20 * 1024 * 1024) {
      setUploadError("File size exceeds 20MB limit.");
      e.target.value = '';
      return;
    }

    // Validate type (Images, PDF, Word, Excel)
    const validTypes = [
      "image/jpeg",
      "image/png",
      "image/gif",
      "image/webp",
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    ];
    if (!validTypes.includes(file.type)) {
      setUploadError("Invalid file type. Only Images, PDF, Word, and Excel are allowed.");
      e.target.value = '';
      return;
    }

    uploadDocMutation.mutate(
      { clientId, file },
      {
        onSuccess: () => {
          if (fileInputRef.current) fileInputRef.current.value = '';
        },
      }
    );
  };

  const confirmDeleteDoc = () => {
    if (deletingDocId) {
      archiveDocMutation.mutate(
        { clientId, docId: deletingDocId },
        {
          onSuccess: () => {
            setDeletingDocId(null);
            setIsArchiveOpen(true);
          }
        }
      );
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
        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={handleFileChange} 
          className="hidden" 
          accept="image/*,.pdf,.doc,.docx,.xls,.xlsx"
        />
        <button 
          onClick={() => fileInputRef.current?.click()}
          disabled={uploadDocMutation.isPending}
          className="h-8 px-3.5 bg-gradient-to-r from-[#66859E] to-[#849EB2] text-white font-medium hover:opacity-90 rounded-[12px] text-xs sm:text-sm transition-all flex items-center justify-center gap-2 shadow-sm disabled:opacity-50 min-w-[150px]"
        >
          {uploadDocMutation.isPending ? (
            <Loader className="w-4 h-4 text-white" />
          ) : (
            <span>Upload Document</span>
          )}
        </button>
      </div>

      {/* Error message */}
      {uploadError && (
        <div className="px-6 py-3 bg-red-500/10 text-red-500 text-sm border-b border-white/10">
          {uploadError}
        </div>
      )}

      {/* Documents List */}
      <div className="w-full flex flex-col">
        {documents.length === 0 ? (
          <EmptyState 
            icon={FileText}
            title="No documents uploaded"
            className="py-12 border-0 bg-transparent min-h-0"
          />
        ) : (
          documents.filter(doc => !doc.isDeleted).map((doc) => {
            const isPdf = doc.title.toLowerCase().endsWith('.pdf');
            const isImage = doc.url.match(/\.(jpeg|jpg|gif|png|webp)$/i) != null;
            
            return (
            <div
              key={doc._id}
              className="w-full border-b border-white/10 px-6 py-4 flex items-center justify-between gap-4"
            >
              {/* File Icon & Info */}
              <div className="flex items-center gap-3.5 flex-1">
                <div className="w-[34px] h-[34px] bg-white/10 rounded-[8px] flex items-center justify-center text-white font-bold text-xs">
                  {isPdf ? "PDF" : isImage ? "IMG" : "DOC"}
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="text-sm font-medium text-white">
                    {doc.title}
                  </span>
                  <span className="text-xs text-[#919191]">
                    {new Date(doc.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2">
                <a 
                  href={doc.url} 
                  download 
                  className="w-6 h-6 bg-[#42CD7F] rounded-[4px] flex items-center justify-center text-white hover:bg-emerald-600 transition-colors"
                >
                  <Download className="w-3.5 h-3.5 text-white" />
                </a>
                <a 
                  href={doc.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-6 h-6 bg-[#829CB0] rounded-[4px] flex items-center justify-center text-white hover:bg-slate-600 transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-white" />
                </a>
                <button
                  onClick={() => setDeletingDocId(doc._id)}
                  disabled={archiveDocMutation.isPending && deletingDocId === doc._id}
                  className="w-6 h-6 bg-[#FF0000] rounded-[4px] flex items-center justify-center text-white hover:bg-red-600 transition-colors disabled:opacity-50"
                >
                  {archiveDocMutation.isPending && deletingDocId === doc._id ? (
                    <Loader className="w-3.5 h-3.5 text-white" />
                  ) : (
                    <Trash2 className="w-3.5 h-3.5 text-white" />
                  )}
                </button>
              </div>
            </div>
            );
          })
        )}
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
