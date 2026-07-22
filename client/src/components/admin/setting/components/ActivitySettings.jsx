import React, { useState, useEffect } from 'react';
import { Activity as ActivityIcon, Clock, ChevronDown, CheckCircle2, ShieldAlert, Sparkles } from 'lucide-react';
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

const getTypeBadge = (type) => {
  switch (type?.toUpperCase()) {
    case 'CAMPAIGN':
      return <span className="text-[10px] font-bold bg-blue-50 text-blue-600 px-2 py-0.5 rounded-md border border-blue-100">CAMPAIGN</span>;
    case 'PAYMENT':
      return <span className="text-[10px] font-bold bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-md border border-emerald-100">PAYMENT</span>;
    case 'TASK':
      return <span className="text-[10px] font-bold bg-amber-50 text-amber-600 px-2 py-0.5 rounded-md border border-amber-100">TASK</span>;
    case 'DELIVERABLE':
      return <span className="text-[10px] font-bold bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-md border border-indigo-100">DELIVERABLE</span>;
    case 'SUBSCRIPTION':
      return <span className="text-[10px] font-bold bg-purple-50 text-purple-600 px-2 py-0.5 rounded-md border border-purple-100">PLAN</span>;
    default:
      return <span className="text-[10px] font-bold bg-gray-50 text-gray-500 px-2 py-0.5 rounded-md border border-gray-100">GENERAL</span>;
  }
};

const ActivitySettings = () => {
  const [page, setPage] = useState(1);
  const [accumulatedActivities, setAccumulatedActivities] = useState([]);
  const limit = 15;

  const { data: response, isLoading, isFetching } = useActivities(page, limit);

  const activities = response?.activities || [];
  const pagination = response?.pagination || { hasMore: false, total: 0 };

  useEffect(() => {
    if (activities.length > 0) {
      if (page === 1) {
        setAccumulatedActivities(activities);
      } else {
        setAccumulatedActivities((prev) => {
          const existingIds = new Set(prev.map((a) => a.id));
          const newUnique = activities.filter((a) => !existingIds.has(a.id));
          return [...prev, ...newUnique];
        });
      }
    }
  }, [activities, page]);

  const handleViewMore = () => {
    if (pagination.hasMore && !isFetching) {
      setPage((prev) => prev + 1);
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-gray-100 p-6 md:p-8 shadow-sm">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-5 border-b border-gray-100">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-[#1A1A1A] flex items-center gap-2.5 tracking-tight">
            <ActivityIcon className="w-6 h-6 text-Primary" />
            Recent Activity Log
          </h2>
          <p className="text-gray-500 text-xs md:text-sm font-medium mt-1">
            Real-time activity tracking for campaign changes, deliverables, tasks, invoices, and subscriptions.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold bg-Primary/10 text-Primary px-3 py-1.5 rounded-full border border-Primary/10">
            {pagination.total || accumulatedActivities.length} Events Total
          </span>
        </div>
      </div>

      {isLoading && page === 1 ? (
        <div className="flex flex-col items-center justify-center py-16">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-Primary mb-3" />
          <p className="text-xs font-medium text-gray-400">Loading activity history...</p>
        </div>
      ) : accumulatedActivities.length === 0 ? (
        <div className="text-center py-16 bg-[#F8FAFC] rounded-2xl border border-dashed border-gray-200">
          <Sparkles className="w-8 h-8 text-gray-300 mx-auto mb-2" />
          <p className="text-gray-500 font-bold text-sm">No recent activity recorded yet</p>
          <p className="text-xs text-gray-400 font-medium mt-1">Your actions and updates will appear here automatically.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {accumulatedActivities.map((item) => (
            <div
              key={item.id}
              className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-2xl border border-gray-100 bg-[#F8FAFC] hover:bg-white hover:shadow-xs transition-all gap-3"
            >
              <div className="flex items-start sm:items-center gap-3.5 min-w-0 flex-1">
                {/* {item.avatarBg && (
                  <div
                    className={`w-10 h-10 rounded-xl ${item.avatarBg} flex items-center justify-center shrink-0 border border-black/5 shadow-xs`}
                  >
                    <span className="text-[10px] font-bold text-gray-800 tracking-tight text-center uppercase px-1 truncate max-w-[36px]">
                      {item.avatarText || 'LOG'}
                    </span>
                  </div>
                )} */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="text-sm font-bold text-[#1A1A1A] leading-snug">
                      {item.title?.replace(' → undefined', '') || 'Activity logged'}
                    </h4>
                    {getTypeBadge(item.type)}
                  </div>
                  {item.sub && (
                    <p className="text-xs text-gray-500 font-medium leading-relaxed mt-0.5">
                      {item.sub}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-gray-200/40">
                <span className="text-xs text-gray-400 font-semibold flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-gray-400" />
                  {formatTimeAgo(item.createdAt)}
                </span>
                {item.dotColor && (
                  <span className={`w-2.5 h-2.5 rounded-full ${item.dotColor} shadow-xs`} />
                )}
              </div>
            </div>
          ))}

          {/* View More Pagination Button */}
          {pagination.hasMore && (
            <div className="pt-6 flex justify-center">
              <button
                type="button"
                onClick={handleViewMore}
                disabled={isFetching}
                className="bg-white border border-gray-200 text-[#1A1A1A] px-6 py-3 rounded-2xl text-xs md:text-sm font-bold hover:bg-gray-50 hover:border-Primary/30 transition-all shadow-xs flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isFetching ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-Primary" />
                    <span>Loading more...</span>
                  </>
                ) : (
                  <>
                    <span>View More Activities</span>
                    <ChevronDown className="w-4 h-4 text-gray-400" />
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ActivitySettings;
