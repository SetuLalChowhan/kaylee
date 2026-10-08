import React, { useState, useMemo } from 'react';
import { CheckCircle2, Circle, Calendar, CalendarDays, AlertCircle, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { useUpdateTask } from '@/api/apiHooks/usePlanner';
import { useActivities } from '@/api/apiHooks/useActivity';

const DeadlineItem = ({ day, month, title, sub, onClick }) => (
  <div onClick={onClick} className="flex items-center gap-3 mb-4 last:mb-0 group cursor-pointer">
    <div className="flex flex-col items-center justify-center min-w-[32px] py-1 border-r border-gray-100 pr-3 mr-1">
      <span className="text-xs font-bold text-Primary uppercase leading-none mb-0.5">{day}</span>
      <span className="text-[10px] font-semibold text-gray-400 uppercase leading-none">{month}</span>
    </div>
    <div className="flex-1 min-w-0">
      <h4 className="text-[13px] font-semibold text-[#1A1A1A] group-hover:text-Primary transition-colors leading-tight truncate">{title}</h4>
      <p className="text-[11px] text-gray-400 font-medium truncate">{sub}</p>
    </div>
  </div>
);

const OverdueDeadlineItem = ({ day, month, title, sub, overdueDays, onClick }) => (
  <div
    onClick={onClick}
    className="flex items-center gap-3 p-2.5 rounded-xl bg-red-50/50 hover:bg-red-50 border border-red-100/80 transition-all cursor-pointer group mb-2.5 last:mb-0"
  >
    <div className="flex flex-col items-center justify-center min-w-[34px] py-1 px-1.5 bg-red-100/80 rounded-lg text-red-600 shrink-0">
      <span className="text-xs font-bold uppercase leading-none mb-0.5">{day}</span>
      <span className="text-[9px] font-bold uppercase leading-none">{month}</span>
    </div>
    <div className="flex-1 min-w-0">
      <h4 className="text-[12px] font-bold text-gray-900 group-hover:text-red-600 transition-colors leading-tight truncate">
        {title}
      </h4>
      <p className="text-[11px] text-gray-500 font-medium truncate">{sub}</p>
    </div>
    <div className="shrink-0">
      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-red-600 bg-white border border-red-200 px-2 py-0.5 rounded-md shadow-2xs whitespace-nowrap">
        <AlertCircle className="w-2.5 h-2.5 text-red-500" />
        {overdueDays ? `${overdueDays}d late` : 'Overdue'}
      </span>
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
    <div className="flex-1 min-w-0">
      <h4 className={`text-[13px] font-semibold ${completed ? 'text-gray-400 line-through' : 'text-[#1A1A1A]'} leading-tight truncate`}>
        {title}
      </h4>
      <p className="text-[10px] text-Primary font-medium truncate">{sub}</p>
    </div>
    <span className="text-[13px] font-medium text-[#6F6F6F] whitespace-nowrap shrink-0">{date}</span>
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
    <div className="flex-1 min-w-0">
      <h4 className="text-[13px] font-semibold text-[#1A1A1A] leading-tight truncate">{title}</h4>
      {sub && <p className="text-[11px] text-gray-500 font-medium leading-tight mt-0.5 truncate">{sub}</p>}
    </div>
    <div className="flex items-center gap-1.5 shrink-0">
      <span className="text-[12px] text-gray-400 font-normal">{time}</span>
      {dotColor && <span className={`w-2 h-2 rounded-full ${dotColor}`} />}
    </div>
  </div>
);

const DeadlinesSidebar = ({ deadlines = [], upcomingDeadlines, overdueDeadlines, tasks = [] }) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const updateTaskMutation = useUpdateTask();
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

  // Resolve upcoming deadlines (exclude overdue)
  const resolvedUpcoming = useMemo(() => {
    if (Array.isArray(upcomingDeadlines)) return upcomingDeadlines;
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
    return deadlines.filter(d => {
      if (d.isOverdue === true) return false;
      if (d.rawDate) {
        const dt = new Date(d.rawDate);
        if (!isNaN(dt.getTime()) && dt.getTime() < todayStart.getTime()) return false;
      }
      return true;
    });
  }, [upcomingDeadlines, deadlines]);

  // Resolve overdue deadlines
  const resolvedOverdue = useMemo(() => {
    if (Array.isArray(overdueDeadlines)) return overdueDeadlines;
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
    return deadlines.filter(d => {
      if (d.isOverdue === true) return true;
      if (d.rawDate) {
        const dt = new Date(d.rawDate);
        if (!isNaN(dt.getTime()) && dt.getTime() < todayStart.getTime()) return true;
      }
      return false;
    });
  }, [overdueDeadlines, deadlines]);

  // Filter tasks: today only unless showAllTasks is true
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

  const handleToggleTask = (taskId, currentCompleted) => {
    if (!taskId) return;
    const newCompleted = !currentCompleted;
    setOptimisticCompleted(prev => ({ ...prev, [taskId]: newCompleted }));
    updateTaskMutation.mutate({
      id: taskId,
      taskData: { completed: newCompleted }
    }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['dashboardStats'] });
        setOptimisticCompleted(prev => {
          const next = { ...prev };
          delete next[taskId];
          return next;
        });
      },
      onError: () => {
        setOptimisticCompleted(prev => {
          const next = { ...prev };
          delete next[taskId];
          return next;
        });
      }
    });
  };

  return (
    <div className="w-full lg:w-[275px] xl:w-[295px] space-y-4 font-urbanist">

      {/* 1. Today's Priorities */}
      <div className="bg-[#FFFFFF] border border-gray-100 p-4 lg:p-4.5 rounded-2xl w-full shadow-sm">
        <div className="flex items-center justify-between mb-3.5">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-[#1A1A1A]">Today's Priorities</h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate('/dashboard/planner')}
              className="text-Primary text-xs font-bold hover:underline flex items-center gap-1 cursor-pointer"
            >
              See all <span className="text-xs">→</span>
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

      {/* 2. Upcoming Deadlines (Only strictly active / future or today deadlines) */}
      <div className="bg-white border border-gray-100 p-4 lg:p-4.5 rounded-2xl w-full shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold text-[#1A1A1A]">Upcoming Deadlines</h2>
          <button
            onClick={() => navigate('/dashboard/campaigns')}
            className="text-Primary text-xs font-bold hover:underline flex items-center gap-1 cursor-pointer"
          >
            See all <span className="text-xs">→</span>
          </button>
        </div>
        <div className="space-y-1">
          {resolvedUpcoming.length > 0 ? (
            resolvedUpcoming.map((item, index) => (
              <DeadlineItem
                key={item.id || index}
                {...item}
                onClick={() => navigate('/dashboard/campaigns')}
              />
            ))
          ) : (
            <p className="text-gray-400 text-xs text-center py-4 font-medium">No upcoming deadlines.</p>
          )}
        </div>
      </div>

      {/* 3. Overdue Deadlines Section (Separated into its own dedicated section below Upcoming Deadlines) */}
      {resolvedOverdue.length > 0 && (
        <div className="bg-white border border-red-100 p-4 lg:p-4.5 rounded-2xl w-full shadow-sm">
          <div className="flex items-center justify-between mb-3.5">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              <h2 className="text-base font-bold text-[#1A1A1A]">Overdue Deadlines</h2>
              <span className="bg-red-100 text-red-600 text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                {resolvedOverdue.length}
              </span>
            </div>
            <button
              onClick={() => navigate('/dashboard/campaigns')}
              className="text-red-500 text-xs font-bold hover:underline flex items-center gap-1 cursor-pointer"
            >
              Action <span className="text-xs">→</span>
            </button>
          </div>
          <div>
            {resolvedOverdue.map((item, index) => (
              <OverdueDeadlineItem
                key={item.id || index}
                {...item}
                onClick={() => navigate('/dashboard/campaigns')}
              />
            ))}
          </div>
        </div>
      )}

      {/* 4. Recent Activity */}
      <div className="bg-white border border-gray-100 p-4 lg:p-4.5 rounded-2xl w-full shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold text-[#1A1A1A]">Recent Activity</h2>
          <button
            onClick={() => navigate('/dashboard/settings?tab=Activity')}
            className="text-Primary text-xs font-bold hover:underline flex items-center gap-1 cursor-pointer"
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
