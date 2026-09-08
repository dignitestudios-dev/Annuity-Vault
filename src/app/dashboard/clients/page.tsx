"use client";

import { useState } from "react";
import { Download, Plus } from "lucide-react";
import ClientsFolderTable from "@/features/clients/components/clients-folder-table";
import NewClientDialog from "@/features/clients/components/new-client-dialog";
import SuccessModal from "@/components/shared/success-modal";
import { exportClients } from "@/features/clients/api/clients.service";
import { useIsFetching } from "@tanstack/react-query";
import { Loader } from "@/components/ui/loader";

export default function ClientsFolderPage() {
  const [isNewClientOpen, setIsNewClientOpen] = useState(false);
  const [isSuccessOpen, setIsSuccessOpen] = useState(false);
  const [isExportingPDF, setIsExportingPDF] = useState(false);
  const [isExportingCSV, setIsExportingCSV] = useState(false);
  const isFetching = useIsFetching({ queryKey: ["clients"] }) > 0;

  const handleExportPDF = async () => {
    setIsExportingPDF(true);
    try {
      await exportClients("pdf");
    } finally {
      setIsExportingPDF(false);
    }
  };

  const handleExportCSV = async () => {
    setIsExportingCSV(true);
    try {
      await exportClients("csv");
    } finally {
      setIsExportingCSV(false);
    }
  };

  return (
    <div className="w-full flex flex-col gap-6 max-w-[1440px] mx-auto pb-8">
      {/* Top Header: Title & Action Buttons */}
      <div className="w-full flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h1 className="text-2xl lg:text-3xl font-semibold text-white tracking-tight font-sans">
          Clients Folder
        </h1>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          <button 
            onClick={handleExportPDF}
            disabled={isFetching || isExportingPDF}
            className="h-10 px-5 bg-[#141C24] disabled:opacity-50 text-white border border-white/5 font-medium hover:bg-white/5 rounded-[12px] text-sm transition-colors font-sans flex items-center gap-2"
          >
            {isExportingPDF ? <Loader className="w-4 h-4 text-[#8C8C8C]" /> : <Download className="w-4 h-4 text-[#8C8C8C]" />}
            <span>Export PDF</span>
          </button>
          <button 
            onClick={handleExportCSV}
            disabled={isFetching || isExportingCSV}
            className="h-10 px-5 bg-[#141C24] disabled:opacity-50 text-white border border-white/5 font-medium hover:bg-white/5 rounded-[12px] text-sm transition-colors font-sans flex items-center gap-2"
          >
            {isExportingCSV ? <Loader className="w-4 h-4 text-[#8C8C8C]" /> : <Download className="w-4 h-4 text-[#8C8C8C]" />}
            <span>Export CSV</span>
          </button>
          <button
            onClick={() => setIsNewClientOpen(true)}
            // disabled={true}
            className="h-10 px-5 bg-gradient-to-r from-[#66859E] to-[#849EB2] text-white disabled:opacity-50 font-medium hover:opacity-90 rounded-[12px] text-sm transition-all shadow-sm font-sans flex items-center gap-2 cursor-not-allowed"
          >
            <Plus className="w-4 h-4 text-white" />
            <span>New Client</span>
          </button>
        </div>
      </div>

      {/* Clients Filter Bar & Table Component */}
      <ClientsFolderTable />

      {/* New Client Form Modal */}
      <NewClientDialog
        isOpen={isNewClientOpen}
        onClose={() => setIsNewClientOpen(false)}
        onSubmitSuccess={() => {
          setIsNewClientOpen(false);
          setIsSuccessOpen(true);
        }}
      />

      {/* Reusable Success Popup Modal */}
      <SuccessModal
        isOpen={isSuccessOpen}
        onClose={() => setIsSuccessOpen(false)}
        title="Client Created!"
        description="Your client folder has been created successfully!"
      />
    </div>
  );
}
