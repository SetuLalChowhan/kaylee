import React from 'react';
import { X, Calendar, ChevronDown, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useForm } from 'react-hook-form';
import { useCreateUgcCampaign, useUpdateUgcCampaign } from '@/api/apiHooks/useUgcCampaign';

const CreateCampaignModal = ({ isOpen, onClose, campaign = null }) => {
  const { register, handleSubmit, reset, formState: { errors } } = useForm();
  const createCampaignMutation = useCreateUgcCampaign();
  const updateCampaignMutation = useUpdateUgcCampaign();
  const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'Local';
  const getLocalDateString = () => {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };
  const today = getLocalDateString();

  React.useEffect(() => {
    if (isOpen) {
      if (campaign) {
        let initialDate = today;
        let initialTime = '17:00';
        if (campaign.deadline) {
          if (campaign.deadline.includes('T')) {
            const parts = campaign.deadline.split('T');
            initialDate = parts[0] || today;
            if (parts[1]) initialTime = parts[1].slice(0, 5);
          } else if (campaign.deadline.includes(' ')) {
            const parts = campaign.deadline.split(' ');
            initialDate = parts[0] || today;
            if (parts[1]) initialTime = parts[1].slice(0, 5);
          } else {
            initialDate = campaign.deadline;
          }
        }
        reset({
          campaignName: campaign.name || '',
          brandName: campaign.brandName || '',
          deadlineDate: initialDate,
          deadlineTime: initialTime,
          amount: campaign.amount || '',
          status: campaign.status || 'Pending',
          notes: campaign.notes || '',
        });
      } else {
        reset({
          campaignName: '',
          brandName: '',
          deadlineDate: today,
          deadlineTime: '17:00',
          amount: '',
          status: 'Pending',
          notes: '',
        });
      }
    }
  }, [campaign, isOpen, reset, today]);

  const onSubmit = (data) => {
    let finalDeadline = data.deadlineDate;
    if (data.deadlineTime) {
      finalDeadline = `${data.deadlineDate}T${data.deadlineTime}:00`;
    }
    const payload = {
      campaignName: data.campaignName,
      brandName: data.brandName,
      deadline: finalDeadline,
      amount: data.amount,
      status: data.status,
      notes: data.notes,
    };
    if (campaign) {
      updateCampaignMutation.mutate(
        { id: campaign.id, campaignData: payload },
        {
          onSuccess: () => {
            onClose();
          },
        }
      );
    } else {
      createCampaignMutation.mutate(payload, {
        onSuccess: () => {
          onClose();
        },
      });
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div key="create-campaign-modal" className="fixed inset-0 z-[1000] flex items-center justify-center p-4 sm:p-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm cursor-pointer"
          />

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] z-10 border border-gray-100"
        >
          {/* Header - Fixed */}
          <div className="p-6 md:p-8 pb-4 bg-white relative z-20">
            <button
              onClick={onClose}
              className="absolute top-6 right-6 w-9 h-9 rounded-full bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-all cursor-pointer shadow-sm"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="pr-10">
              <h2 className="text-2xl md:text-3xl font-bold text-[#1A1A1A] tracking-tight">{campaign ? 'Edit Campaign' : 'Create Campaign'}</h2>
              <p className="text-sm text-gray-500 font-medium mt-1">Provide details for your campaign and deliverables.</p>
              <div className="w-full border-b border-gray-100 mt-4" />
            </div>
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto px-6 md:px-8 pb-6 md:pb-8 custom-scrollbar">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">Campaign Name</label>
                <input
                  {...register('campaignName', { required: 'Campaign name is required' })}
                  type="text"
                  placeholder="e.g. Spring Launch, Back to School"
                  className={`w-full bg-[#F8FAFC] border rounded-xl py-2.5 px-3.5 focus:bg-white focus:border-Primary focus:ring-2 focus:ring-Primary/10 focus:outline-none transition-all text-sm text-[#1A1A1A] placeholder-gray-400 font-medium ${errors.campaignName ? 'border-red-500' : 'border-gray-200'}`}
                />
                {errors.campaignName && <p className="text-xs text-red-500 font-bold mt-1 ml-1">{errors.campaignName.message}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">Brand Name</label>
                <input
                  {...register('brandName', { required: 'Brand name is required' })}
                  type="text"
                  placeholder="e.g. Gymshark, Glossier, Nike"
                  className={`w-full bg-[#F8FAFC] border rounded-xl py-2.5 px-3.5 focus:bg-white focus:border-Primary focus:ring-2 focus:ring-Primary/10 focus:outline-none transition-all text-sm text-[#1A1A1A] placeholder-gray-400 font-medium ${errors.brandName ? 'border-red-500' : 'border-gray-200'}`}
                />
                {errors.brandName && <p className="text-xs text-red-500 font-bold mt-1 ml-1">{errors.brandName.message}</p>}
              </div>

              {/* Due Date & Time with Timezone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">Due Date</label>
                  <input
                    {...register('deadlineDate', { required: 'Due date is required' })}
                    type="date"
                    className={`w-full bg-[#F8FAFC] border rounded-xl py-2.5 px-3.5 focus:bg-white focus:border-Primary focus:ring-2 focus:ring-Primary/10 focus:outline-none transition-all text-sm text-[#1A1A1A] font-medium ${errors.deadlineDate ? 'border-red-500' : 'border-gray-200'}`}
                  />
                  {errors.deadlineDate && <p className="text-xs text-red-500 font-bold mt-1 ml-1">{errors.deadlineDate.message}</p>}
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-semibold text-gray-700">Due Time</label>
                    <span
                      className="text-[10px] font-bold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-md truncate max-w-[130px]"
                      title={`Timezone: ${userTimezone}`}
                    >
                      {userTimezone}
                    </span>
                  </div>
                  <input
                    {...register('deadlineTime')}
                    type="time"
                    className="w-full bg-[#F8FAFC] border border-gray-200 rounded-xl py-2.5 px-3.5 focus:bg-white focus:border-Primary focus:ring-2 focus:ring-Primary/10 focus:outline-none transition-all text-sm text-[#1A1A1A] font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">Amount</label>
                  <input
                    {...register('amount', { required: 'Required' })}
                    type="number"
                    placeholder="Enter amount"
                    className={`w-full bg-[#F8FAFC] border rounded-xl py-2.5 px-3.5 focus:bg-white focus:border-Primary focus:ring-2 focus:ring-Primary/10 focus:outline-none transition-all text-sm text-[#1A1A1A] placeholder-gray-400 font-medium ${errors.amount ? 'border-red-500' : 'border-gray-200'}`}
                  />
                  {errors.amount && <p className="text-xs text-red-500 font-bold mt-1 ml-1">{errors.amount.message}</p>}
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">Status</label>
                  <div className="relative">
                    <select
                      {...register('status', { required: 'Required' })}
                      className={`w-full bg-[#F8FAFC] border rounded-xl py-2.5 pl-3.5 pr-10 focus:bg-white focus:border-Primary focus:ring-2 focus:ring-Primary/10 focus:outline-none transition-all text-sm appearance-none cursor-pointer text-[#1A1A1A] font-semibold ${errors.status ? 'border-red-500' : 'border-gray-200'}`}
                    >
                      <option value="Pending">Pending</option>
                      <option value="Draft">Draft</option>
                      <option value="Under Review">Under Review</option>
                      <option value="Approved">Approved</option>
                      <option value="Completed">Completed</option>
                    </select>
                    <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  </div>
                  {errors.status && <p className="text-xs text-red-500 font-bold mt-1 ml-1">{errors.status.message}</p>}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">Notes (Optional)</label>
                <textarea
                  {...register('notes')}
                  placeholder="Enter notes..."
                  rows={2}
                  className="w-full bg-[#F8FAFC] border border-gray-200 rounded-xl py-2.5 px-3.5 focus:bg-white focus:border-Primary focus:ring-2 focus:ring-Primary/10 focus:outline-none transition-all text-sm text-[#1A1A1A] placeholder-gray-400 font-medium resize-none"
                />
              </div>

              {/* Info Box */}
              <div className="bg-[#F8FAFC] rounded-2xl p-4 border border-gray-100">
                <h4 className="text-xs font-bold text-[#1A1A1A] mb-2">After creating your campaign</h4>
                <ul className="space-y-1">
                  {[
                    "Add deliverables — what content is owed",
                    "Break it into tasks — linked to your Planner",
                    "Upload drafts and finals for brand review",
                    "Track your invoice within the campaign"
                  ].map((text, i) => (
                    <li key={i} className="text-xs text-gray-500 font-medium list-disc ml-4">
                      {text}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={createCampaignMutation.isPending || updateCampaignMutation.isPending}
                  className="px-5 py-2.5 text-sm font-bold text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded-xl transition-all cursor-pointer disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createCampaignMutation.isPending || updateCampaignMutation.isPending}
                  className="bg-Primary text-white px-6 py-3 rounded-xl md:rounded-2xl font-bold text-sm hover:bg-Primary/90 shadow-lg shadow-Primary/20 transition-all cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 min-w-[150px]"
                >
                  {createCampaignMutation.isPending || updateCampaignMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>{campaign ? 'Saving...' : 'Creating...'}</span>
                    </>
                  ) : (
                    <span>{campaign ? 'Save Changes' : 'Create Campaign'}</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </motion.div>
      </div>
    )}
  </AnimatePresence>
  );
};

export default CreateCampaignModal;
