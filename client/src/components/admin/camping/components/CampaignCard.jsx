import React, { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import {
  MoreVertical,
  Edit3,
  Trash2,
  Calendar,
  Check,
  ChevronRight,
  Clock,
  Receipt,
  CheckCircle2,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useUpdateUgcCampaign } from '../../../../api/apiHooks/useUgcCampaign';

const getBrandAvatar = (brandName = '') => {
  const lower = brandName.toLowerCase();
  if (lower.includes('bhumi')) {
    return { bg: 'bg-[#F5EBE1]', text: 'text-[#4A3B32] font-black text-[11px] tracking-wider', label: 'BHUMI' };
  }
  if (lower.includes('activewear')) {
    return { bg: 'bg-[#18181B]', text: 'text-white font-extrabold text-[11px] tracking-wider', label: 'ACTIVE' };
  }
  if (lower.includes('love') || lower.includes('mj')) {
    return { bg: 'bg-[#FFE4E6]', text: 'text-[#E11D48] font-bold text-[11px]', label: 'Love mj' };
  }
  if (lower.includes('polly') || lower.includes('princess')) {
    return { bg: 'bg-[#F3E8FF]', text: 'text-[#7E22CE] font-bold text-[13px]', label: 'P' };
  }
  const initials = brandName
    .split(' ')
    .filter(Boolean)
    .map((w) => w[0])
    .join('')
    .slice(0, 3)
    .toUpperCase();
  return { bg: 'bg-blue-50', text: 'text-Primary font-bold text-xs', label: initials || 'UGC' };
};

const getStatusBadge = (status = '') => {
  const lower = status.toLowerCase();
  if (lower === 'completed' || lower === 'approved') {
    return { label: 'On Track', bg: 'bg-[#ECFDF5] text-[#059669] border-[#A7F3D0]' };
  }
  if (lower === 'under review' || lower === 'active') {
    return { label: 'On Track', bg: 'bg-[#ECFDF5] text-[#059669] border-[#A7F3D0]' };
  }
  if (lower === 'in progress') {
    return { label: 'In Progress', bg: 'bg-[#FFF7ED] text-[#EA580C] border-[#FFEDD5]' };
  }
  if (lower === 'draft') {
    return { label: 'Draft', bg: 'bg-[#F3F4F6] text-[#4B5563] border-[#E5E7EB]' };
  }
  return { label: status || 'On Track', bg: 'bg-[#ECFDF5] text-[#059669] border-[#A7F3D0]' };
};

const formatDueLabel = (dateStr) => {
  if (!dateStr) return 'No deadline';
  const target = new Date(dateStr);
  if (isNaN(target.getTime())) return dateStr;
  const now = new Date();
  const diffDays = Math.ceil((target - now) / (1000 * 60 * 60 * 24));
  if (diffDays < 0) return 'Overdue';
  if (diffDays === 0) return 'Due today';
  if (diffDays === 1) return 'Due in 1 day';
  return `Due in ${diffDays} days`;
};

const formatAmount = (amt) => {
  if (!amt && amt !== 0) return null;
  const str = String(amt).trim();
  if (!str) return null;
  if (str.startsWith('$')) return str;
  const num = parseFloat(str.replace(/[^0-9.]/g, ''));
  if (isNaN(num)) return str;
  return `$${num.toLocaleString()}`;
};

const CampaignCard = ({
  id,
  title,
  brand,
  amount,
  dueDate,
  status = 'Active',
  deliverables = [],
  tasks = [],
  media = [],
  releaseFiles = false,
  campaign = {},
  onEdit,
  onDelete,
}) => {
  const [showOptions, setShowOptions] = useState(false);

  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const updateCampaignMutation = useUpdateUgcCampaign();

  // Merge with cached detail data if available
  const cachedCampaign = queryClient.getQueryData(['ugcCampaign', id]);
  const detail = cachedCampaign?.data || cachedCampaign || campaign || {};

  const effectiveStatus = detail.status || status || 'Active';
  const normStatus = effectiveStatus.toLowerCase().trim();

  const isCompleted = normStatus === 'completed';
  const isApproved = normStatus === 'approved' || isCompleted;

  const brandStyle = getBrandAvatar(brand || title);
  const statusBadge = getStatusBadge(effectiveStatus);
  const dueLabel = formatDueLabel(dueDate || detail.deadline);
  const displayAmount = formatAmount(amount || detail.amount);

  // Fallbacks to detail or campaign object
  const effectiveDeliverables =
    deliverables.length > 0 ? deliverables : (detail.deliverables || []);
  const effectiveTasks =
    tasks.length > 0 ? tasks : (detail.tasks || []);
  const effectiveMedia =
    media.length > 0 ? media : (detail.media || []);
  const effectiveRelease =
    releaseFiles || detail.releaseFiles || false;

  // ── 5 Sequential Lifecycle Milestones (20% progress each) ──
  // 1. Campaign Created
  const isCampaignCreated = true;

  // 2. Content Uploaded: Media exists or deliverables uploaded/filmed
  const isContentUploaded =
    isApproved ||
    effectiveMedia.length > 0 ||
    effectiveDeliverables.some((d) =>
      (d.progress || []).some((p) =>
        ['filmed', 'uploaded', 'edited', 'completed'].some((kw) =>
          (p || '').toLowerCase().includes(kw)
        )
      )
    );

  // 3. Content Approved: Status Approved/Completed, any media approved, or files released
  const hasApprovedMedia =
    effectiveMedia.length > 0 &&
    effectiveMedia.some((m) => (m.status || '').toLowerCase() === 'approved');
  const isContentApproved =
    isApproved ||
    hasApprovedMedia ||
    effectiveRelease;

  // 4. Files Released: Status Completed or releaseFiles is true
  const isFilesReleased = isCompleted || effectiveRelease;

  // 5. Invoice Paid: Payment status is Paid
  const paymentStatusStr = (detail.paymentStatus || campaign.paymentStatus || '').toLowerCase().trim();
  const isInvoicePaid = paymentStatusStr === 'paid';

  const checklist = [
    {
      key: 'created',
      label: 'Campaign Created',
      done: isCampaignCreated,
      subText: 'Done',
    },
    {
      key: 'content',
      label: 'Content Uploaded',
      done: isContentUploaded,
      subText: effectiveMedia.length > 0 ? `${effectiveMedia.length} Media` : (isContentUploaded ? 'Done' : 'Pending'),
    },
    {
      key: 'approved',
      label: 'Content Approved',
      done: isContentApproved,
      subText: isContentApproved ? 'Approved' : 'Pending',
    },
    {
      key: 'released',
      label: 'Files Released',
      done: isFilesReleased,
      subText: isFilesReleased ? 'Released' : 'Locked',
    },
    {
      key: 'paid',
      label: 'Invoice Paid',
      done: isInvoicePaid,
      subText: isInvoicePaid ? 'Paid' : 'Pending',
    },
  ];

  // Dynamic Progress Percentage (20%, 40%, 60%, 80%, 100%)
  const completedChecks = checklist.filter((c) => c.done).length;
  const progressPercent = completedChecks * 20;

  const handleCardClick = () => {
    navigate(`/dashboard/campaigns/${id}`);
  };

  const handleTogglePayment = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const nextStatus = isInvoicePaid ? 'Pending' : 'Paid';
    updateCampaignMutation.mutate({
      id,
      campaignData: { paymentStatus: nextStatus },
    });
    setShowOptions(false);
  };

  return (
    <div
      onMouseLeave={() => setShowOptions(false)}
      onClick={handleCardClick}
      className="bg-white border border-gray-100/90 rounded-[28px] p-6 shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-[0_16px_36px_rgba(0,0,0,0.08)] hover:border-Primary/35 transition-all duration-300 relative group cursor-pointer flex flex-col justify-between min-h-[415px] w-full"
    >
      {/* ── TOP SECTION ── */}
      <div>
        {/* Brand Avatar, Title, Amount & 3-dots Menu */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="min-w-0">
              <div className="mb-1.5">
                <span className="text-[10px] font-extrabold text-Primary bg-blue-50 px-2 py-0.5 rounded-md uppercase tracking-wider border border-blue-100/50 shadow-sm inline-block truncate max-w-full">
                  {brand || 'Brand'}
                </span>
              </div>
              <h3 className="text-base font-extrabold text-[#1A1A1A] truncate tracking-tight group-hover:text-Primary transition-colors">
                {title}
              </h3>
            </div>
          </div>

          {/* Right Action: Amount badge & 3-dots Menu */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {displayAmount && (
              <span className="px-2.5 py-1 rounded-xl text-xs font-black bg-emerald-50 text-emerald-700 border border-emerald-200/60 shadow-xs">
                {displayAmount}
              </span>
            )}

            <div className="relative">
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setShowOptions(!showOptions);
                }}
                className={`p-2 rounded-xl transition-all ${showOptions ? 'bg-gray-100 text-[#1A1A1A]' : 'text-gray-400 hover:bg-gray-50 hover:text-[#1A1A1A]'
                  }`}
                title="Options"
              >
                <MoreVertical className="w-4 h-4" />
              </button>

              {showOptions && (
                <div
                  className="absolute right-0 mt-2 w-44 bg-white rounded-2xl shadow-xl z-50 py-2 overflow-hidden border border-gray-100 transition-all text-xs"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      onEdit && onEdit();
                      setShowOptions(false);
                    }}
                    className="w-full flex items-center gap-2.5 px-4 py-2.5 text-gray-700 hover:bg-gray-50 transition-colors font-semibold"
                  >
                    <Edit3 className="w-3.5 h-3.5 text-gray-400" />
                    <span>Edit Campaign</span>
                  </button>

                  <button
                    onClick={handleTogglePayment}
                    className="w-full flex items-center gap-2.5 px-4 py-2.5 text-gray-700 hover:bg-gray-50 transition-colors font-semibold"
                  >
                    {isInvoicePaid ? (
                      <>
                        <Clock className="w-3.5 h-3.5 text-amber-500" />
                        <span>Mark as Pending</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Mark as Paid</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      navigate('/dashboard/invoices');
                      setShowOptions(false);
                    }}
                    className="w-full flex items-center gap-2.5 px-4 py-2.5 text-gray-700 hover:bg-gray-50 transition-colors font-semibold"
                  >
                    <Receipt className="w-3.5 h-3.5 text-blue-500" />
                    <span>View Invoices</span>
                  </button>

                  <div className="h-px bg-gray-100 my-1" />

                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      onDelete && onDelete();
                      setShowOptions(false);
                    }}
                    className="w-full flex items-center gap-2.5 px-4 py-2.5 text-red-500 hover:bg-red-50 transition-colors font-semibold"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete Campaign</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Status Pills: Operational Status + Invoice Payment Status */}
        <div className="flex items-center gap-2 mb-4 flex-wrap">
          <span
            className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border ${statusBadge.bg}`}
          >
            {statusBadge.label}
          </span>

          {isInvoicePaid ? (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <Check className="w-3 h-3 stroke-[3]" />
              <span>Invoice Paid</span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
              <Clock className="w-3 h-3" />
              <span>Payment Pending</span>
            </span>
          )}
        </div>

        {/* Progress Bar & Percentage */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-semibold text-gray-500">Milestone Progress</span>
            <span className="text-xs font-black text-Primary bg-blue-50/80 px-2 py-0.5 rounded-md">
              {progressPercent}%
            </span>
          </div>
          <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-Primary to-blue-500 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* 5-Milestone Dynamic Checklist */}
        <div className="space-y-2.5 mb-5">
          {checklist.map((item) => (
            <div key={item.key} className="flex items-center justify-between group/item">
              <div className="flex items-center gap-2.5 min-w-0">
                {item.done ? (
                  <div className="w-4 h-4 rounded-full border-2 border-[#10B981] bg-emerald-50 flex items-center justify-center flex-shrink-0">
                    <Check className="w-2.5 h-2.5 text-[#10B981] stroke-[3]" />
                  </div>
                ) : (
                  <div className="w-4 h-4 rounded-full border-2 border-[#3B82F6] flex-shrink-0" />
                )}
                <span
                  className={`text-xs truncate ${item.done ? 'text-[#1A1A1A] font-semibold' : 'text-gray-500 font-medium'
                    }`}
                >
                  {item.label}
                </span>
              </div>

              <span
                className={`text-[10px] font-semibold px-2 py-0.5 rounded-md ${item.done
                    ? 'text-emerald-700 bg-emerald-50/80'
                    : 'text-gray-400 bg-gray-50'
                  }`}
              >
                {item.subText}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* ── BOTTOM BUTTON & FOOTER (Always accessible and visible) ── */}
      <div>
        {/* View Campaign Details Button */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            handleCardClick();
          }}
          className="w-full text-center py-2.5 px-4 rounded-xl bg-blue-50/80 hover:bg-Primary hover:text-white text-Primary text-xs font-bold transition-all mb-3.5 flex items-center justify-center gap-1.5 group/btn cursor-pointer shadow-xs"
        >
          <span>View Campaign Details</span>
          <ChevronRight className="w-3.5 h-3.5 transition-transform duration-200 group-hover/btn:translate-x-0.5" />
        </button>

        {/* Footer: Calendar Icon + Due in X days & quick items count */}
        <div className="pt-3 border-t border-gray-50 flex items-center justify-between">
          <div className={`flex items-center gap-2 text-xs font-bold ${isCompleted ? 'text-emerald-500' : 'text-orange-500'}`}>
            {isCompleted ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            ) : (
              <Calendar className="w-4 h-4 text-gray-500" />
            )}
            <span>{isCompleted ? 'Completed' : dueLabel}</span>
          </div>
          <div className="text-[11px] font-semibold text-gray-400 flex items-center gap-1.5">
            <span>{effectiveDeliverables.length} Deliv</span>
            <span>•</span>
            <span>{effectiveTasks.length} Tasks</span>
            <span>•</span>
            <span>{effectiveMedia.length} Media</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CampaignCard;
