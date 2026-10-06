import React from 'react';

const formatDate = (dateString) => {
  if (!dateString) return '';
  const d = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: '2-digit',
    hour: 'numeric',
    minute: '2-digit'
  }).format(d);
};

const CampaignHistory = ({ campaign }) => {
  // Filter out noisy logs like OTP requests, just keep the meaningful interactions
  const relevantLogs = (campaign?.auditRecords || []).filter(log => 
    log.action === 'SESSION_CREATED' || 
    log.action === 'PAGE_VIEW' ||
    log.action === 'APPROVED' ||
    log.action === 'CHANGE_REQUESTED' ||
    log.action === 'FEEDBACK_SUBMITTED' ||
    log.action === 'RATING_SUBMITTED'
  );

  const counts = {
    approved: relevantLogs.filter(l => l.action === 'APPROVED').length,
    changes: relevantLogs.filter(l => l.action === 'CHANGE_REQUESTED').length,
    ratings: relevantLogs.filter(l => l.action === 'RATING_SUBMITTED').length,
  };

  const groupedLogsMap = {};
  relevantLogs.forEach((log) => {
    const key = log.action === 'PAGE_VIEW' 
      ? `${log.email || 'Someone'}-${log.action}`
      : log.id; // unique key for everything else

    if (!groupedLogsMap[key]) {
      groupedLogsMap[key] = { ...log, count: 1 };
    } else {
      groupedLogsMap[key].count += 1;
      if (new Date(log.createdAt) > new Date(groupedLogsMap[key].createdAt)) {
        groupedLogsMap[key].createdAt = log.createdAt;
      }
    }
  });

  const displayLogs = Object.values(groupedLogsMap).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-6">
      <div className="flex justify-between items-center mb-5">
        <h3 className="text-base font-bold text-[#1A1A1A]">Brand View History</h3>
        <div className="flex gap-2 text-[10px] font-bold">
          {counts.approved > 0 && <span className="text-green-600 bg-green-50 px-2 py-1 rounded-md">{counts.approved} Approved</span>}
          {counts.changes > 0 && <span className="text-red-600 bg-red-50 px-2 py-1 rounded-md">{counts.changes} Changes</span>}
          {counts.ratings > 0 && <span className="text-yellow-600 bg-yellow-50 px-2 py-1 rounded-md">{counts.ratings} Ratings</span>}
        </div>
      </div>
      
      <div className="space-y-3">
        {displayLogs.length > 0 ? (
          displayLogs.map((log, index) => {
            let actionText = "viewed your brand";
            let color = "text-gray-600";
            let bg = "bg-gray-50/80 hover:bg-gray-50";

            if (log.action === 'SESSION_CREATED') {
              actionText = "started a session";
              color = "text-blue-600";
              bg = "bg-blue-50/50 hover:bg-blue-50";
            }
            if (log.action === 'APPROVED') {
              actionText = "approved media";
              color = "text-green-600";
              bg = "bg-green-50/50 hover:bg-green-50";
            }
            if (log.action === 'CHANGE_REQUESTED') {
              actionText = "requested changes";
              color = "text-red-600";
              bg = "bg-red-50/50 hover:bg-red-50";
            }
            if (log.action === 'FEEDBACK_SUBMITTED') {
              actionText = "submitted feedback";
              color = "text-orange-600";
              bg = "bg-orange-50/50 hover:bg-orange-50";
            }
            if (log.action === 'RATING_SUBMITTED') {
              actionText = "left a rating";
              color = "text-yellow-600";
              bg = "bg-yellow-50/50 hover:bg-yellow-50";
            }
            
            const who = log.email ? <span className="font-bold text-[#1A1A1A]">{log.email}</span> : <span className="font-bold text-[#1A1A1A]">Someone</span>;

            return (
              <div key={`${log.id}-${index}`} className={`flex justify-between items-center transition-colors rounded-xl p-4 border border-gray-50/50 ${bg}`}>
                <p className={`text-sm ${color} flex items-center gap-2`}>
                  <span>{who} {actionText}</span>
                </p>
                <div className="flex items-center gap-3">
                  {log.count > 1 && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-gray-200/50 text-gray-500">
                      {log.count}x
                    </span>
                  )}
                  <span className="text-xs font-semibold text-gray-400">
                    {formatDate(log.createdAt)}
                  </span>
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center py-8">
            <p className="text-sm text-gray-500">No brand interactions recorded yet.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CampaignHistory;
