"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Pin, Trash2 } from "lucide-react";
import DeleteModal from "@/components/shared/delete-modal";
import ArchiveModal from "@/components/shared/archive-modal";
import { EmptyState } from "@/components/shared/empty-state";

interface NoteItem {
  id: string;
  text: string;
  date: string;
}

interface NotesTabProps {
  initialNotes: NoteItem[];
}

export default function NotesTab({ initialNotes }: NotesTabProps) {
  const router = useRouter();
  const [newNote, setNewNote] = useState("");
  const [notesList, setNotesList] = useState(initialNotes);
  const [deletingNoteId, setDeletingNoteId] = useState<string | null>(null);
  const [isArchiveOpen, setIsArchiveOpen] = useState(false);

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.trim()) return;
    const addedNote = {
      id: Date.now().toString(),
      text: newNote.trim(),
      date: new Date().toISOString().split("T")[0],
    };
    setNotesList([addedNote, ...notesList]);
    setNewNote("");
  };

  const confirmDeleteNote = () => {
    if (deletingNoteId) {
      setNotesList(notesList.filter((note) => note.id !== deletingNoteId));
      setDeletingNoteId(null);
      setIsArchiveOpen(true);
    }
  };

  const handleArchiveClose = () => {
    setIsArchiveOpen(false);
    router.push("/dashboard/archived");
  };

  return (
    <div className="w-full bg-[#141C24] border border-[#0F1F3D]/12 rounded-[12px] p-6 flex flex-col gap-6 shadow-sm">
      {/* Top Add Note Input Box */}
      <form onSubmit={handleAddNote} className="w-full flex items-center gap-3">
        <input
          type="text"
          value={newNote}
          onChange={(e) => setNewNote(e.target.value)}
          placeholder="Add a note about this client..."
          className="flex-1 bg-[#0C1116] border-0 text-white placeholder-[#576574] text-sm rounded-[12px] px-4 h-[60px] outline-none focus:ring-1 focus:ring-[#6887A0]"
        />
        <button
          type="submit"
          className="h-9 px-5 bg-gradient-to-r from-[#66859E] to-[#849EB2] text-white hover:opacity-90 rounded-[12px] text-sm font-medium transition-all shadow-sm"
        >
          Add
        </button>
      </form>

      {/* Notes List */}
      <div className="w-full flex flex-col">
        {notesList.length === 0 ? (
          <EmptyState 
            icon={Pin}
            title="No notes added"
            className="py-12 border-0 bg-transparent min-h-0"
          />
        ) : (
          notesList.map((note) => (
            <div
              key={note.id}
              className="w-full border-b border-white/10 py-4 flex items-center justify-between gap-4"
            >
              <div className="flex items-start gap-3 flex-1">
                <Pin className="w-4 h-4 text-[#576574] flex-shrink-0 mt-0.5" />
                <div className="flex flex-col gap-1">
                  <p className="text-sm text-white font-normal leading-snug">
                    {note.text}
                  </p>
                  <span className="text-xs text-[#919191]">{note.date}</span>
                </div>
              </div>

              <button
                onClick={() => setDeletingNoteId(note.id)}
                className="w-6 h-6 bg-[#FF0000] rounded-[4px] flex items-center justify-center text-white hover:bg-red-600 transition-colors flex-shrink-0"
              >
                <Trash2 className="w-3.5 h-3.5 text-white" />
              </button>
            </div>
          ))
        )}
      </div>

      {/* Delete Note Confirmation Modal */}
      <DeleteModal
        isOpen={!!deletingNoteId}
        onClose={() => setDeletingNoteId(null)}
        onConfirm={confirmDeleteNote}
        title="Delete Note"
        description="Are you sure you want to delete this note?"
      />

      {/* File Moved to Archive Modal */}
      <ArchiveModal
        isOpen={isArchiveOpen}
        onClose={handleArchiveClose}
      />
    </div>
  );
}
