import React, { useState, useEffect } from 'react';
import { ListChecks, Trash2, PlusCircle, ChevronDown, Check } from 'lucide-react';
import { useCreateDeliverable, useDeleteDeliverable, useUpdateDeliverable } from '@/api/apiHooks/useUgcCampaign';

const STAGES = [
  '📝 Scripted',
  '🎥 Filmed',
  '✂️ Edited',
  '🎙️ Voiceover Complete',
  '✅ Completed',
  '📦 Delivered',
  '👍 Approved'
];

const STAGE_CONFIGS = {
  '📝 Scripted': { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
  '🎥 Filmed': { bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-200' },
  '✂️ Edited': { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
  '🎙️ Voiceover Complete': { bg: 'bg-teal-50', text: 'text-teal-700', border: 'border-teal-200' },
  '✅ Completed': { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200' },
  '📦 Delivered': { bg: 'bg-sky-50', text: 'text-sky-700', border: 'border-sky-200' },
  '👍 Approved': { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' }
};

const Deliverables = ({ campaign, readOnly }) => {
  const [showInput, setShowInput] = useState(false);
  const [newItem, setNewItem] = useState('');
  const [activeDropdown, setActiveDropdown] = useState(null);

  const createMutation = useCreateDeliverable();
  const deleteMutation = useDeleteDeliverable();
  const updateMutation = useUpdateDeliverable();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.progress-dropdown-container')) {
        setActiveDropdown(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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

  const handleToggleStage = (itemId, stage, currentProgress) => {
    let newProgress;
    if (currentProgress.includes(stage)) {
      newProgress = currentProgress.filter(s => s !== stage);
    } else {
      newProgress = [...currentProgress, stage];
    }
    updateMutation.mutate({ campaignId: campaign.id, id: itemId, progress: newProgress });
  };

  const items = campaign.deliverables || [];

  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
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
            <div key={item.id} className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-3 group relative min-h-[52px] gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex flex-col sm:flex-row sm:items-center flex-wrap gap-2">
                  <span className="text-sm text-[#1A1A1A] font-semibold break-words">{item.text}</span>
                  {item.progress && item.progress.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {item.progress.map((stage) => {
                        const config = STAGE_CONFIGS[stage] || { bg: 'bg-gray-100', text: 'text-gray-600', border: 'border-gray-200' };
                        return (
                          <span
                            key={stage}
                            className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border ${config.bg} ${config.text} ${config.border} shadow-xs transition-all`}
                          >
                            {stage}
                          </span>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {!readOnly && (
                  <div className="relative progress-dropdown-container">
                    <button
                      onClick={() => setActiveDropdown(activeDropdown === item.id ? null : item.id)}
                      className="flex items-center gap-1 text-xs font-bold text-gray-500 hover:text-Primary bg-white border border-gray-200 hover:border-Primary/30 px-2.5 py-1.5 rounded-xl shadow-xs transition-all cursor-pointer select-none"
                    >
                      <span>Progress</span>
                      <ChevronDown className="w-3.5 h-3.5" />
                    </button>

                    {activeDropdown === item.id && (
                      <div className="absolute right-0 mt-1.5 w-56 bg-white border border-gray-100 rounded-2xl shadow-xl z-50 p-1.5 py-1 animate-in fade-in slide-in-from-top-2 duration-150">
                        {STAGES.map((stage) => {
                          const isSelected = (item.progress || []).includes(stage);
                          return (
                            <button
                              key={stage}
                              onClick={() => handleToggleStage(item.id, stage, item.progress || [])}
                              className="w-full flex items-center justify-between text-left px-3 py-2 text-xs font-semibold rounded-xl hover:bg-gray-50 transition-colors cursor-pointer text-gray-700 select-none"
                            >
                              <span className="flex items-center gap-1.5">{stage}</span>
                              {isSelected ? (
                                <Check className="w-3.5 h-3.5 text-Primary" />
                              ) : (
                                <div className="w-3.5 h-3.5 border border-gray-300 rounded-md" />
                              )}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}

                {!readOnly && (
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="opacity-100 sm:opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 p-1.5 rounded-lg hover:bg-gray-200/50 transition-all cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
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
