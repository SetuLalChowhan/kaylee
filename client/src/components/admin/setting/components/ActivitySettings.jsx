import React from 'react';
import { Activity as ActivityIcon, Clock, CheckCircle2, ShieldAlert } from 'lucide-react';
import { useActivities } from '@/api/apiHooks/useActivity';

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

const ActivitySettings = () => {
  const { data: activities = [], isLoading } = useActivities(50);

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6 md:p-8 shadow-sm">
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
        <div>
          <h2 className="text-xl font-bold text-[#1A1A1A] flex items-center gap-2">
            <ActivityIcon className="w-5 h-5 text-Primary" />
            Recent Activity Log
          </h2>
          <p className="text-gray-500 text-xs md:text-sm mt-1">
            Track all project updates, deliverable approvals, feedback, and payment milestones.
          </p>
        </div>
        <span className="text-xs font-bold bg-gray-100 text-gray-600 px-3 py-1.5 rounded-full">
          {activities.length} Events
        </span>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-Primary"></div>
        </div>
      ) : activities.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-400 font-medium text-sm">No recent activity recorded yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {activities.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between p-4 rounded-xl border border-gray-50 hover:border-gray-100 hover:bg-[#F8FAFC] transition-all"
            >
              <div className="flex items-center gap-4 min-w-0">
                <div
                  className={`w-11 h-11 rounded-full ${item.avatarBg || 'bg-gray-100'} flex items-center justify-center shrink-0 overflow-hidden shadow-xs`}
                >
                  <span className="text-[10px] font-bold text-gray-800 tracking-tight text-center uppercase px-1">
                    {item.avatarText || 'STAKD'}
                  </span>
                </div>
                <div className="min-w-0">
                  <h4 className="text-sm font-semibold text-[#1A1A1A] leading-tight truncate">
                    {item.title}
                  </h4>
                  {item.sub && (
                    <p className="text-xs text-gray-500 font-medium leading-tight mt-0.5">
                      {item.sub}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <span className="text-xs text-gray-400 font-medium flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  {formatTimeAgo(item.createdAt)}
                </span>
                {item.dotColor && (
                  <span className={`w-2.5 h-2.5 rounded-full ${item.dotColor}`} />
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ActivitySettings;
