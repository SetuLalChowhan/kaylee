import React, { useState, useMemo } from 'react';
import { CheckCircle2, Circle, Calendar, CalendarDays } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { useUpdateTask } from '@/api/apiHooks/usePlanner';
import { useActivities } from '@/api/apiHooks/useActivity';

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

const formatTimeAgo = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now - date) / 1000);
  if (diffInSeconds < 60) return 'Just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  const days = Math.floor(diffInSeconds / 86400);
  return `${days}d ago`;
};

const ActivityItem = ({ title, sub, time, avatarBg, avatarContent, avatarText, dotColor }) => (
  <div className="flex items-center gap-3 mb-4 last:mb-0 group cursor-pointer">
    {/* <div className={`w-10 h-10 rounded-full ${avatarBg || 'bg-gray-100'} flex items-center justify-center shrink-0 overflow-hidden shadow-xs`}>
      {avatarContent || <span className="text-[9px] font-bold text-gray-700 tracking-tighter uppercase px-1 text-center">{avatarText || 'STAKD'}</span>}
    </div> */}
    <div className="flex-1 min-w-0">
      <h4 className="text-[13px] font-semibold text-[#1A1A1A] leading-tight truncate">{title}</h4>
      {sub && <p className="text-[11px] text-gray-500 font-medium leading-tight mt-0.5">{sub}</p>}
    </div>
    <div className="flex items-center gap-1.5 shrink-0">
      <span className="text-[12px] text-gray-400 font-normal">{time}</span>
      {dotColor && <span className={`w-2 h-2 rounded-full ${dotColor}`} />}
    </div>
  </div>
);

const DeadlinesSidebar = ({ deadlines = [], tasks = [] }) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: activityRes } = useActivities(1, 5);
  const dynamicActivities = activityRes?.activities || (Array.isArray(activityRes) ? activityRes : []);
  const [showAllTasks, setShowAllTasks] = useState(false);
  // Optimistic completed state: tracks which task IDs the user just toggled
  const [optimisticCompleted, setOptimisticCompleted] = useState({});

  const displayActivities = dynamicActivities.map(act => ({
    id: act.id,
    title: act.title?.replace(' → undefined', '') || 'Activity logged',
    sub: act.sub,
    time: formatTimeAgo(act.createdAt),
    avatarBg: act.avatarBg,
    avatarText: act.avatarText,
    dotColor: act.dotColor
  }));

  // Filter tasks: today only unless showAllTasks is true
  // Use local date (NOT toISOString which is UTC and can be yesterday for UTC+ timezones)
  const todayStr = useMemo(() => {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const d = String(now.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }, []);

  // Merge server tasks with optimistic completed overrides
  const mergedTasks = useMemo(() =>
    tasks.map(t => ({
      ...t,
      completed: optimisticCompleted.hasOwnProperty(t.id)
        ? optimisticCompleted[t.id]
        : t.completed
    }))
    , [tasks, optimisticCompleted]);

  const todayTasks = useMemo(() =>
    mergedTasks.filter(t => {
      const raw = t.rawDate || t.date;
      if (!raw) return false;
      const taskLocalDate = raw.includes('T') || raw.includes('-')
        ? new Date(raw).toLocaleDateString('en-CA')
        : null;
      return taskLocalDate === todayStr;
    })
    , [mergedTasks, todayStr]);
  const displayTasks = showAllTasks ? mergedTasks : todayTasks;
  const todayCount = todayTasks.filter(t => !t.completed).length;

  const handleToggleTask = (taskId, currentCompleted) => {
    if (!taskId) return;
    const newCompleted = !currentCompleted;
    // Optimistically update UI immediately
    setOptimisticCompleted(prev => ({ ...prev, [taskId]: newCompleted }));
    updateTaskMutation.mutate({
      id: taskId,
      taskData: { completed: newCompleted }
    }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['dashboardStats'] });
        // Clear optimistic override once server confirms — let real data take over
        setOptimisticCompleted(prev => {
          const next = { ...prev };
          delete next[taskId];
          return next;
        });
      },
      onError: () => {
        // Revert optimistic update on failure
        setOptimisticCompleted(prev => {
          const next = { ...prev };
          delete next[taskId];
          return next;
        });
      }
    });
  };

  return (
    <div className="w-full xl:w-[320px] lg:w-[300px] space-y-6 ">

      {/* Pending Tasks */}
      <div className="bg-[#FFFFFF] border border-gray-100 p-4 md:p-6 rounded-2xl w-full shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-[#1A1A1A]">Today's Priorities</h2>
            {/* {todayCount > 0 && (
              <span className="text-[10px] font-bold bg-Primary/10 text-Primary px-2 py-0.5 rounded-full">
                {todayCount} due
              </span>
            )} */}
          </div>
          <div className="flex items-center gap-2">
            {/* <button
              onClick={() => setShowAllTasks(v => !v)}
              title={showAllTasks ? 'Show today only' : 'Show all tasks'}
              className={`p-1.5 rounded-lg transition-all border ${showAllTasks ? 'bg-Primary/10 border-Primary/20 text-Primary' : 'border-gray-100 text-gray-400 hover:text-Primary hover:bg-Primary/5'}`}
            >
              {showAllTasks ? <CalendarDays className="w-3.5 h-3.5" /> : <Calendar className="w-3.5 h-3.5" />}
            </button> */}
            <button
              onClick={() => navigate('/dashboard/planner')}
              className="text-Primary text-sm font-bold hover:underline flex items-center gap-1"
            >
              See all <span className="text-sm">→</span>
            </button>
          </div>
        </div>
        {!showAllTasks && (
          <p className="text-[10px] text-gray-400 font-medium mb-3 flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
          </p>
        )}
        <div className="space-y-1">
          {displayTasks.length > 0 ? (
            displayTasks.map((task, index) => (
              <TaskItem
                key={task.id || index}
                {...task}
                onToggle={() => handleToggleTask(task.id, task.completed)}
              />
            ))
          ) : (
            <p className="text-gray-400 text-xs text-center py-4 font-medium">
              {showAllTasks ? 'No pending tasks.' : 'No tasks due today ✨'}
            </p>
          )}
        </div>
      </div>
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
            onClick={() => navigate('/dashboard/settings?tab=Activity')}
            className="text-Primary text-sm font-bold hover:underline flex items-center gap-1"
          >
            View all
          </button>
        </div>
        <div className="space-y-1">
          {displayActivities.length > 0 ? (
            displayActivities.map((activity) => (
              <ActivityItem key={activity.id} {...activity} />
            ))
          ) : (
            <p className="text-gray-400 text-xs text-center py-4 font-medium">No recent activity.</p>
          )}
        </div>
      </div>


    </div>
  );
};

export default DeadlinesSidebar;
