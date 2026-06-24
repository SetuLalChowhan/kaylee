import React, { useState } from 'react';
import { StickyNote, Trash2 } from 'lucide-react';
import { useCreateCampaignNote, useDeleteCampaignNote, useUpdateUgcCampaign } from '@/api/apiHooks/useUgcCampaign';

const NotesComments = ({ campaign }) => {
  const [newNote, setNewNote] = useState('');
  const createMutation = useCreateCampaignNote();
  const deleteMutation = useDeleteCampaignNote();
  const updateMutation = useUpdateUgcCampaign();

  const notes = campaign.notesComments || [];

  const handleAdd = () => {
    if (!newNote.trim()) return;
    createMutation.mutate({ campaignId: campaign.id, text: newNote }, {
      onSuccess: () => {
        setNewNote('');
      }
    });
  };

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this note?")) {
      deleteMutation.mutate({ campaignId: campaign.id, id });
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-6">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-10 h-10 bg-Primary/5 rounded-xl flex items-center justify-center">
          <StickyNote className="w-5 h-5 text-Primary" />
        </div>
        <h3 className="text-sm font-bold text-[#1A1A1A]">Notes & Comments</h3>
      </div>

      <div className="space-y-2 mb-4 max-h-[300px] overflow-y-auto custom-scrollbar">
        {campaign.notes && (
          <div className="bg-gray-50 rounded-xl px-4 py-3.5 group">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5 mb-1">
                  <span className="text-[8px] bg-Primary/10 text-Primary font-extrabold px-1.5 py-0.5 rounded-md uppercase tracking-wider">
                    Initial Note
                  </span>
                </div>
                <p className="text-sm text-[#1A1A1A] mb-1 whitespace-pre-wrap">{campaign.notes}</p>
                <p className="text-[10px] text-gray-400">{formatDate(campaign.createdAt)}</p>
              </div>
              <button 
                onClick={() => {
                  if (window.confirm("Are you sure you want to delete the initial campaign note?")) {
                    updateMutation.mutate({
                      id: campaign.id,
                      campaignData: { notes: null }
                    });
                  }
                }} 
                className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 transition-all mt-1 cursor-pointer shrink-0"
                title="Delete Initial Note"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
        {notes.map((note) => (
          <div key={note.id} className="bg-gray-50 rounded-xl px-4 py-3.5 group">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <p className="text-sm text-[#1A1A1A] mb-1 whitespace-pre-wrap">{note.text}</p>
                <p className="text-[10px] text-gray-400">{formatDate(note.createdAt)}</p>
              </div>
              <button onClick={() => handleDelete(note.id)} className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 transition-all mt-1 cursor-pointer shrink-0">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
        {!campaign.notes && notes.length === 0 && (
          <p className="text-xs text-gray-400 text-center py-4">No internal notes added yet.</p>
        )}
      </div>

      <div className="flex items-center gap-3">
        <input
          type="text"
          placeholder="Add a note or revision request..."
          value={newNote}
          onChange={(e) => setNewNote(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
          className="flex-1 bg-white border border-gray-100 rounded-xl py-3 px-4 text-sm focus:border-Primary focus:outline-none transition-all text-[#1A1A1A]"
        />
        <button onClick={handleAdd} className="bg-Primary text-white px-5 py-3 rounded-xl text-sm font-bold hover:bg-Primary/90 transition-all cursor-pointer">Add</button>
      </div>
    </div>
  );
};

export default NotesComments;
