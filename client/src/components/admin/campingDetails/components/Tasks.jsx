import React, { useState } from 'react';
import { ClipboardList, Trash2, PlusCircle, CheckCircle2, Circle, Calendar } from 'lucide-react';

const Tasks = () => {
  const [tasks, setTasks] = useState([
    { id: 1, name: 'Upload first draft', date: 'Apr 15, 2026', completed: false },
    { id: 2, name: 'Upload first draft', date: 'Apr 15, 2026', completed: true },
  ]);
  const [showInput, setShowInput] = useState(false);
  const [newTask, setNewTask] = useState('');
  const [newDate, setNewDate] = useState('2026-04-20');

  const handleAdd = () => {
    if (!newTask.trim()) return;
    const task = { id: Date.now(), name: newTask, date: new Date(newDate).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }), completed: false };
    setTasks(prev => [...prev, task]);
    console.log('Task Added:', task);
    setNewTask('');
    setNewDate('2026-04-20');
    setShowInput(false);
  };

  const toggleComplete = (id) => {
    setTasks(prev => prev.map(t => {
      if (t.id === id) {
        const updated = { ...t, completed: !t.completed };
        console.log('Task Toggled:', updated);
        return updated;
      }
      return t;
    }));
  };

  const handleDelete = (id) => {
    setTasks(prev => prev.filter(t => t.id !== id));
    console.log('Task Deleted:', id);
  };

  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-6">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-10 h-10 bg-Primary/5 rounded-xl flex items-center justify-center">
          <ClipboardList className="w-5 h-5 text-Primary" />
        </div>
        <h3 className="text-sm font-bold text-[#1A1A1A]">Tasks</h3>
      </div>

      <div className="space-y-2 mb-4">
        {tasks.map((task) => (
          <div key={task.id} className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-3.5 group">
            <div className="flex items-center gap-3">
              <button onClick={() => toggleComplete(task.id)} className="transition-all">
                {task.completed
                  ? <CheckCircle2 className="w-5 h-5 text-Primary" />
                  : <Circle className="w-5 h-5 text-gray-300 hover:text-Primary transition-colors" />
                }
              </button>
              <span className={`text-sm ${task.completed ? 'text-gray-400 line-through' : 'text-[#1A1A1A]'}`}>{task.name}</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs text-gray-400">{task.date}</span>
              <button onClick={() => handleDelete(task.id)} className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 transition-all">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {showInput && (
        <div className="space-y-3 mb-4">
          <input
            type="text"
            placeholder="Task name"
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
            className="w-full bg-white border border-gray-100 rounded-xl py-3 px-4 text-sm focus:border-Primary focus:outline-none transition-all"
            autoFocus
          />
          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <input
                type="date"
                value={newDate}
                onChange={(e) => setNewDate(e.target.value)}
                className="w-full bg-white border border-gray-100 rounded-xl py-3 px-4 text-sm focus:border-Primary focus:outline-none transition-all"
              />
            </div>
            <button onClick={handleAdd} className="bg-Primary text-white px-5 py-3 rounded-xl text-sm font-bold hover:bg-Primary/90 transition-all">Add</button>
            <button onClick={() => { setShowInput(false); setNewTask(''); }} className="text-sm text-gray-500 font-medium hover:text-[#1A1A1A] transition-colors">Cancel</button>
          </div>
        </div>
      )}

      <button onClick={() => setShowInput(true)} className="flex items-center gap-2 text-Primary text-sm font-bold hover:underline">
        <PlusCircle className="w-4 h-4" />
        Add Task
      </button>
    </div>
  );
};

export default Tasks;
