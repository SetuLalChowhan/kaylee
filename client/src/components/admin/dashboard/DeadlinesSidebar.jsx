import React from 'react';
import { CheckCircle2, Circle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { useUpdateTask } from '@/api/apiHooks/usePlanner';

const DeadlineItem = ({ day, month, title, sub }) => (
  <div className="flex items-center gap-3 mb-4 last:mb-0 group cursor-pointer">
    <div className="flex flex-col items-center justify-center min-w-[32px] py-1 border-r border-gray-100 pr-3 mr-1">
      <span className="text-xs font-bold text-red-500 uppercase leading-none mb-0.5">{day}</span>
      <span className="text-[10px] font-semibold text-gray-400 uppercase leading-none">{month}</span>
    </div>
    <div>
      <h4 className="text-[13px] font-semibold text-[#1A1A1A] group-hover:text-Primary transition-colors leading-tight">{title}</h4>
      <p className="text-[11px] text-gray-400 font-medium">{sub}</p>
    </div>
  </div>
);

const TaskItem = ({ title, sub, date, completed, onToggle }) => (
  <div onClick={onToggle} className="flex items-center gap-3 mb-5 last:mb-0 group cursor-pointer">
    <div className="mt-0.5">
      {completed ? (
        <CheckCircle2 className="w-4 h-4 text-green-500" />
      ) : (
        <Circle className="w-4 h-4 text-gray-200 group-hover:text-Primary transition-colors" />
      )}
    </div>
    <div className="flex-1">
      <h4 className={`text-[13px] font-semibold ${completed ? 'text-gray-400 line-through' : 'text-[#1A1A1A]'} leading-tight`}>
        {title}
      </h4>
      <p className="text-[10px] text-Primary font-medium">{sub}</p>
    </div>
    <span className="text-[13px] font-medium text-[#6F6F6F] whitespace-nowrap">{date}</span>
  </div>
);

const DeadlinesSidebar = ({ deadlines = [], tasks = [] }) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const updateTaskMutation = useUpdateTask();

  const handleToggleTask = (taskId, completed) => {
    if (!taskId) return;
    updateTaskMutation.mutate({
      id: taskId,
      taskData: { completed: !completed }
    }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["dashboardStats"] });
      }
    });
  };

  return (
    <div className="w-full lg:w-[320px] space-y-6 lg:space-y-10">
      {/* Upcoming Deadlines */}
      <div className="bg-white border border-gray-100 p-4 md:p-6 rounded-2xl w-full shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-[#1A1A1A]">Upcoming Deadlines</h2>
          <button 
            onClick={() => navigate('/dashboard/campaigns')}
            className="text-Primary text-sm font-bold hover:underline flex items-center gap-1"
          >
            See all <span className="text-sm">→</span>
          </button>
        </div>
        <div className="space-y-1">
          {deadlines.length > 0 ? (
            deadlines.map((item, index) => (
              <DeadlineItem key={item.id || index} {...item} />
            ))
          ) : (
            <p className="text-gray-400 text-xs text-center py-4 font-medium">No upcoming deadlines.</p>
          )}
        </div>
      </div>

      {/* Pending Tasks */}
      <div className="bg-white border border-gray-100 p-4 md:p-6 rounded-2xl w-full shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-[#1A1A1A]">Pending Tasks</h2>
          <button 
            onClick={() => navigate('/dashboard/planner')}
            className="text-Primary text-sm font-bold hover:underline flex items-center gap-1"
          >
            See all <span className="text-sm">→</span>
          </button>
        </div>
        <div className="space-y-1">
          {tasks.length > 0 ? (
            tasks.map((task, index) => (
              <TaskItem 
                key={task.id || index} 
                {...task} 
                onToggle={() => handleToggleTask(task.id, task.completed)}
              />
            ))
          ) : (
            <p className="text-gray-400 text-xs text-center py-4 font-medium">No pending tasks.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default DeadlinesSidebar;
