import React, { useState } from 'react';
import { ListChecks, Trash2, PlusCircle } from 'lucide-react';
import { useCreateDeliverable, useDeleteDeliverable } from '@/api/apiHooks/useUgcCampaign';

const Deliverables = ({ campaign, readOnly }) => {
  const [showInput, setShowInput] = useState(false);
  const [newItem, setNewItem] = useState('');

  const createMutation = useCreateDeliverable();
  const deleteMutation = useDeleteDeliverable();

  const handleAdd = () => {
    if (!newItem.trim()) return;
    createMutation.mutate(
      { campaignId: campaign.id, text: newItem },
      {
        onSuccess: () => {
          setNewItem('');
          setShowInput(false);
        },
      }
    );
  };

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this deliverable?")) {
      deleteMutation.mutate({ campaignId: campaign.id, id });
    }
  };

  const items = campaign.deliverables || [];

  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm ">
      <div className="flex items-start gap-3 mb-5">
        <div className="w-10 h-10 bg-Primary/5 rounded-xl flex items-center justify-center shrink-0">
          <ListChecks className="w-5 h-5 text-Primary" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-[#1A1A1A]">Deliverables</h3>
          <p className="text-xs text-gray-400 font-medium mt-0.5">Campaign deliverable requirements</p>
        </div>
      </div>

      <div className="space-y-2 mb-4">
        {items.length > 0 ? (
          items.map((item) => (
            <div key={item.id} className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-3.5 group">
              <span className="text-sm text-[#1A1A1A] font-semibold">{item.text}</span>
              {!readOnly && (
                <button
                  onClick={() => handleDelete(item.id)}
                  className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 transition-all cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          ))
        ) : (
          <p className="text-xs text-gray-400 font-medium py-2">No deliverables added yet.</p>
        )}
      </div>

      {!readOnly && showInput && (
        <div className="flex items-center gap-3 mb-4">
          <input
            type="text"
            placeholder="e.g. Shoot vertical video, Product lifestyle photos"
            value={newItem}
            onChange={(e) => setNewItem(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
            className="flex-1 bg-white border border-gray-100 rounded-xl py-3 px-4 text-sm focus:border-Primary focus:outline-none transition-all text-[#1A1A1A]"
            autoFocus
          />
          <button onClick={handleAdd} className="bg-Primary text-white px-5 py-3 rounded-xl text-sm font-bold hover:bg-Primary/90 transition-all cursor-pointer">Add</button>
          <button onClick={() => { setShowInput(false); setNewItem(''); }} className="text-sm text-gray-500 font-medium hover:text-[#1A1A1A] transition-colors cursor-pointer">Cancel</button>
        </div>
      )}

      {!readOnly && (
        <button
          onClick={() => setShowInput(true)}
          className="flex items-center gap-2 text-Primary text-sm font-bold hover:underline cursor-pointer"
        >
          <PlusCircle className="w-4 h-4" />
          Add Deliverable
        </button>
      )}
    </div>
  );
};

export default Deliverables;
