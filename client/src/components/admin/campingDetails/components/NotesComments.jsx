import React, { useState } from 'react';
import { StickyNote, Trash2 } from 'lucide-react';

const NotesComments = () => {
  const [notes, setNotes] = useState([
    { id: 1, text: 'Brand wants more energy in the opening shot. Reshoot first 5 seconds.', date: 'Apr 15, 2026' },
  ]);
  const [newNote, setNewNote] = useState('');

  const handleAdd = () => {
    if (!newNote.trim()) return;
    const note = { id: Date.now(), text: newNote, date: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }) };
    setNotes(prev => [...prev, note]);
    console.log('Note Added:', note);
    setNewNote('');
  };

  const handleDelete = (id) => {
    setNotes(prev => prev.filter(n => n.id !== id));
    console.log('Note Deleted:', id);
  };

  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-6">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-10 h-10 bg-Primary/5 rounded-xl flex items-center justify-center">
          <StickyNote className="w-5 h-5 text-Primary" />
        </div>
        <h3 className="text-sm font-bold text-[#1A1A1A]">Notes & Comments</h3>
      </div>

      <div className="space-y-2 mb-4">
        {notes.map((note) => (
          <div key={note.id} className="bg-gray-50 rounded-xl px-4 py-3.5 group">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-[#1A1A1A] mb-1">{note.text}</p>
                <p className="text-[10px] text-gray-400">{note.date}</p>
              </div>
              <button onClick={() => handleDelete(note.id)} className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 transition-all mt-1">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-3">
        <input
          type="text"
          placeholder="Add a note or revision request..."
          value={newNote}
          onChange={(e) => setNewNote(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
          className="flex-1 bg-white border border-gray-100 rounded-xl py-3 px-4 text-sm focus:border-Primary focus:outline-none transition-all"
        />
        <button onClick={handleAdd} className="bg-Primary text-white px-5 py-3 rounded-xl text-sm font-bold hover:bg-Primary/90 transition-all">Add</button>
      </div>
    </div>
  );
};

export default NotesComments;
