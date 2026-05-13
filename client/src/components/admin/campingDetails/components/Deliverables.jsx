import React, { useState } from 'react';
import { ListChecks, Trash2, PlusCircle } from 'lucide-react';

const Deliverables = () => {
  const [items, setItems] = useState([
    { id: 1, text: 'Shoot product video' },
    { id: 2, text: 'Capture product photos' },
  ]);
  const [showInput, setShowInput] = useState(false);
  const [newItem, setNewItem] = useState('');

  const handleAdd = () => {
    if (!newItem.trim()) return;
    const item = { id: Date.now(), text: newItem };
    setItems(prev => [...prev, item]);
    console.log('Deliverable Added:', item);
    setNewItem('');
    setShowInput(false);
  };

  const handleDelete = (id) => {
    setItems(prev => prev.filter(i => i.id !== id));
    console.log('Deliverable Deleted:', id);
  };

  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-6">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-10 h-10 bg-Primary/5 rounded-xl flex items-center justify-center">
          <ListChecks className="w-5 h-5 text-Primary" />
        </div>
        <h3 className="text-sm font-bold text-[#1A1A1A]">Deliverables</h3>
      </div>

      <div className="space-y-2 mb-4">
        {items.map((item) => (
          <div key={item.id} className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-3.5 group">
            <span className="text-sm text-[#1A1A1A]">{item.text}</span>
            <button
              onClick={() => handleDelete(item.id)}
              className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 transition-all"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>

      {showInput && (
        <div className="flex items-center gap-3 mb-4">
          <input
            type="text"
            placeholder="e.g. Upload video, Edit content"
            value={newItem}
            onChange={(e) => setNewItem(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
            className="flex-1 bg-white border border-gray-100 rounded-xl py-3 px-4 text-sm focus:border-Primary focus:outline-none transition-all"
            autoFocus
          />
          <button onClick={handleAdd} className="bg-Primary text-white px-5 py-3 rounded-xl text-sm font-bold hover:bg-Primary/90 transition-all">Add</button>
          <button onClick={() => { setShowInput(false); setNewItem(''); }} className="text-sm text-gray-500 font-medium hover:text-[#1A1A1A] transition-colors">Cancel</button>
        </div>
      )}

      <button
        onClick={() => setShowInput(true)}
        className="flex items-center gap-2 text-Primary text-sm font-bold hover:underline"
      >
        <PlusCircle className="w-4 h-4" />
        Add Deliverable
      </button>
    </div>
  );
};

export default Deliverables;
