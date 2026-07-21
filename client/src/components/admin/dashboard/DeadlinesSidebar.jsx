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

const STATIC_RECENT_ACTIVITIES = [
  {
    id: 1,
    title: 'Love MJ approved',
    sub: 'Deliverable 2 ',
    time: '2h ago',
    avatarBg: 'bg-[#FCE4EC]',
    avatarContent: (
      <span className="text-[9px] font-medium text-[#C2185B] leading-[10px] text-center font-serif">
        Love<br /><span className="italic font-sans">mj</span>
      </span>
    ),
    dotColor: null
  },
  {
    id: 2,
    title: 'BHUMI payment received',
    sub: '$850.00',
    time: '5h ago',
    avatarBg: 'bg-[#F4EBE1]',
    avatarContent: <span className="text-[9px] font-bold text-[#5D4037] tracking-tighter">BHUMI</span>,
    dotColor: 'bg-emerald-500'
  },
  {
    id: 3,
    title: 'Activewear shipped',
    sub: 'products ',
    time: '1d ago',
    avatarBg: 'bg-black',
    avatarContent: <span className="text-[8px] font-bold text-white tracking-widest uppercase">ACTIVE</span>,
    dotColor: 'bg-blue-500'
  },
  {
    id: 4,
    title: 'Princess Polly left',
    sub: 'feedback ',
    time: '2d ago',
    avatarBg: 'bg-[#F3E8FF]',
    avatarContent: (
      <svg className="w-3.5 h-3.5 text-[#8E24AA]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 12c2.5-4 7.5-4 10 0s7.5 4 10 0" />
      </svg>
    ),
    dotColor: 'bg-purple-500'
  }
];

const ActivityItem = ({ title, sub, time, avatarBg, avatarContent, dotColor }) => (
  <div className="flex items-center gap-3 mb-4 last:mb-0 group cursor-pointer">
    <div className={`w-10 h-10 rounded-full ${avatarBg} flex items-center justify-center shrink-0 overflow-hidden`}>
      {avatarContent}
    </div>
    <div className="flex-1 min-w-0">
      <h4 className="text-[13px] font-semibold text-[#1A1A1A] leading-tight truncate">{title}</h4>
      <p className="text-[11px] text-gray-500 font-medium leading-tight mt-0.5">{sub}</p>
    </div>
    <div className="flex items-center gap-1.5 shrink-0">
      <span className="text-[12px] text-gray-400 font-normal">{time}</span>

    </div>
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
    <div className="w-full lg:w-[320px] space-y-6 ">
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

      {/* Recent Activity */}
      <div className="bg-white border border-gray-100 p-4 md:p-6 rounded-2xl w-full shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-[#1A1A1A]">Recent Activity</h2>
          <button
            onClick={() => navigate('/dashboard/activity')}
            className="text-Primary text-sm font-bold hover:underline flex items-center gap-1"
          >
            View all
          </button>
        </div>
        <div className="space-y-1">
          {STATIC_RECENT_ACTIVITIES.map((activity) => (
            <ActivityItem key={activity.id} {...activity} />
          ))}
        </div>
      </div>

      {/* Pending Tasks */}
      <div className="bg-[#FFFFFF] border border-gray-100 p-4 md:p-6 rounded-2xl w-full shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-[#1A1A1A]">Todays Priorities</h2>
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
