import React, { useState } from 'react';
import { MoreVertical, CheckCircle2, Circle, Edit3, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'motion/react';

const TaskListItem = ({ task, onEdit, onDelete, onToggle }) => {
  const [showOptions, setShowOptions] = useState(false);

  return (
    <div className="flex items-center justify-between lg:p-6 p-4 hover:bg-gray-50 transition-all group border-b border-gray-50 last:border-b-0">
      <div className="flex items-center gap-6">
        <button
          onClick={() => onToggle(task.id)}
          className="transition-transform hover:scale-110"
        >
          {task.completed ? (
            <CheckCircle2 className="lg:w-6 lg:h-6 w-5 h-5 text-green-500" />
          ) : (
            <Circle className="lg:w-6 lg:h-6 w-5 h-5 text-gray-200 hover:text-Primary transition-colors" />
          )}
        </button>
        <div>
          <h4 className={`lg:text-base text-sm font-bold ${task.completed ? 'text-gray-400 line-through' : 'text-[#1A1A1A]'}`}>
            {task.name}
          </h4>
          <p className="text-xs text-Primary font-semibold">{task.campaign}</p>
        </div>
      </div>

      <div className="flex items-center lg:gap-10 gap-6">
        <span className="text-sm font-medium text-gray-400">
          {format(new Date(task.date), 'EEE, MMM d')}
        </span>

        <div className="relative">
          <button
            onClick={() => setShowOptions(!showOptions)}
            className={`p-2 rounded-full transition-all border border-transparent hover:border-gray-100 hover:shadow-sm ${showOptions ? 'bg-white text-Primary shadow-sm' : 'text-gray-400 hover:bg-white'}`}
          >
            <MoreVertical className="w-5 h-5" />
          </button>

          <AnimatePresence>
            {showOptions && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setShowOptions(false)}
                />
                <motion.div
                  initial={{ opacity: 0, scale: 0.9, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, y: 10 }}
                  className="absolute right-0 mt-2 w-48 bg-white border border-gray-100 rounded-2xl shadow-xl z-20 py-2 overflow-hidden"
                >
                  <button
                    onClick={() => {
                      onEdit(task);
                      setShowOptions(false);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-600 hover:bg-gray-50 hover:text-Primary transition-colors"
                  >
                    <Edit3 className="w-4 h-4" />
                    <span className="font-semibold">Edit Task</span>
                  </button>
                  <button
                    onClick={() => {
                      onDelete(task);
                      setShowOptions(false);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-500 hover:bg-red-50/50 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span className="font-semibold">Delete Task</span>
                  </button>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

const TaskList = ({ tasks, onEdit, onDelete, onToggle }) => {
  return (
    <div className="bg-white rounded-[32px] border border-gray-50 shadow-sm mb-10 relative">
      <div className="lg:p-8 p-4 border-b border-gray-50 rounded-t-[32px]">
        <h2 className="xlg:text-xl text-lg font-bold text-[#1A1A1A]">All task this week</h2>
      </div>

      <div className="flex flex-col">
        {tasks.length > 0 ? (
          tasks.map((task, index) => (
            <div
              key={task.id}
              className={`${index === tasks.length - 1 ? 'rounded-b-[32px]' : ''}`}
            >
              <TaskListItem
                task={task}
                onEdit={onEdit}
                onDelete={onDelete}
                onToggle={onToggle}
              />
            </div>
          ))
        ) : (
          <div className="xl:p-20 lg:p-10 p-6 text-center text-gray-400 font-medium rounded-b-[32px]">
            No tasks scheduled for this week
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskList;
