import React, { useState } from 'react';
import { ClipboardList, Trash2, PlusCircle, CheckCircle2, Circle } from 'lucide-react';
import { useCreateCampaignTask, useUpdateCampaignTask, useDeleteCampaignTask } from '@/api/apiHooks/useUgcCampaign';

const Tasks = ({ campaign }) => {
  const [showInput, setShowInput] = useState(false);
  const [newTask, setNewTask] = useState('');
  const [newDate, setNewDate] = useState('2026-04-20');

  const createTaskMutation = useCreateCampaignTask();
  const updateTaskMutation = useUpdateCampaignTask();
  const deleteTaskMutation = useDeleteCampaignTask();

  const handleAdd = () => {
    if (!newTask.trim()) return;
    const taskData = { name: newTask, date: newDate, completed: false };
    createTaskMutation.mutate(
      { campaignId: campaign.id, taskData },
      {
        onSuccess: () => {
          setNewTask('');
          setNewDate('2026-04-20');
          setShowInput(false);
        },
      }
    );
  };

  const toggleComplete = (id, currentCompleted) => {
    updateTaskMutation.mutate({
      campaignId: campaign.id,
      id,
      taskData: { completed: !currentCompleted },
    });
  };

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this task?")) {
      deleteTaskMutation.mutate({ campaignId: campaign.id, id });
    }
  };

  const tasks = campaign.tasks || [];

  const formatDateLabel = (dateStr) => {
    if (!dateStr) return '';
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-10 h-10 bg-Primary/5 rounded-xl flex items-center justify-center">
          <ClipboardList className="w-5 h-5 text-Primary" />
        </div>
        <h3 className="text-sm font-bold text-[#1A1A1A]">Tasks</h3>
      </div>

      <div className="space-y-2 mb-4">
        {tasks.length > 0 ? (
          tasks.map((task) => (
            <div key={task.id} className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-3.5 group">
              <div className="flex items-center gap-3 text-left">
                <button onClick={() => toggleComplete(task.id, task.completed)} className="transition-all cursor-pointer">
                  {task.completed
                    ? <CheckCircle2 className="w-5 h-5 text-Primary" />
                    : <Circle className="w-5 h-5 text-gray-300 hover:text-Primary transition-colors" />
                  }
                </button>
                <span className={`text-sm font-semibold ${task.completed ? 'text-gray-400 line-through' : 'text-[#1A1A1A]'}`}>{task.name}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs text-gray-400 font-medium">{formatDateLabel(task.date)}</span>
                <button onClick={() => handleDelete(task.id)} className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 transition-all cursor-pointer">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        ) : (
          <p className="text-xs text-gray-400 font-medium py-2">No tasks added yet. Click below to add tasks.</p>
        )}
      </div>

      {showInput && (
        <div className="space-y-3 mb-4">
          <input
            type="text"
            placeholder="Task name"
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
            className="w-full bg-white border border-gray-100 rounded-xl py-3 px-4 text-sm focus:border-Primary focus:outline-none transition-all text-[#1A1A1A]"
            autoFocus
          />
          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <input
                type="date"
                value={newDate}
                onChange={(e) => setNewDate(e.target.value)}
                className="w-full bg-white border border-gray-100 rounded-xl py-3 px-4 text-sm focus:border-Primary focus:outline-none transition-all text-[#1A1A1A]"
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
