import React from 'react';
import { X, Calendar, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useForm } from 'react-hook-form';
import { useCreateUgcCampaign } from '@/api/apiHooks/useUgcCampaign';

const CreateCampaignModal = ({ isOpen, onClose }) => {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const createCampaignMutation = useCreateUgcCampaign();

  const onSubmit = (data) => {
    createCampaignMutation.mutate(data, {
      onSuccess: () => {
        onClose();
      },
    });
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/20 backdrop-blur-sm"
        />
        
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-lg bg-white rounded-3xl md:rounded-[40px] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        >
          {/* Header - Fixed */}
          <div className="p-4 md:p-10 pb-0 bg-white relative z-20">
            <button 
              onClick={onClose}
              className="absolute top-6 right-6 md:top-8 md:right-8 p-1.5 md:p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400 border border-gray-100 bg-white"
            >
              <X className="w-5 h-5 md:w-6 md:h-6" />
            </button>

            <div className="mb-4 md:mb-6">
              <h2 className="text-xl md:text-2xl font-bold text-[#1A1A1A]">Create Campaigns</h2>
              <div className="w-full border-b border-dashed border-gray-100 mt-4 md:mt-6" />
            </div>
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto px-4 md:px-10 pb-4 md:pb-10 custom-scrollbar">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 md:space-y-6">
              <div>
                <label className="block text-xs md:text-sm font-bold text-[#1A1A1A] mb-2 md:mb-3">Campaign Name</label>
                <input
                  {...register('campaignName', { required: 'Campaign name is required' })}
                  type="text"
                  placeholder="e.g. Spring Launch, Back to School"
                  className={`w-full bg-white border rounded-xl md:rounded-2xl py-3 md:py-4 px-4 md:px-6 focus:border-Primary focus:outline-none transition-all text-xs md:text-sm ${errors.campaignName ? 'border-red-500' : 'border-gray-100'}`}
                />
                {errors.campaignName && <p className="text-[10px] text-red-500 font-bold mt-2 ml-2">{errors.campaignName.message}</p>}
              </div>

              <div>
                <label className="block text-xs md:text-sm font-bold text-[#1A1A1A] mb-2 md:mb-3">Brand Name</label>
                <input
                  {...register('brandName', { required: 'Brand name is required' })}
                  type="text"
                  placeholder="e.g. Gymshark, Glossier, Nike"
                  className={`w-full bg-white border rounded-xl md:rounded-2xl py-3 md:py-4 px-4 md:px-6 focus:border-Primary focus:outline-none transition-all text-xs md:text-sm ${errors.brandName ? 'border-red-500' : 'border-gray-100'}`}
                />
                {errors.brandName && <p className="text-[10px] text-red-500 font-bold mt-2 ml-2">{errors.brandName.message}</p>}
              </div>

              <div>
                <label className="block text-xs md:text-sm font-bold text-[#1A1A1A] mb-2 md:mb-3">Deadline</label>
                <div className="relative">
                  <input
                    {...register('deadline', { required: 'Deadline is required' })}
                    type="date"
                    defaultValue="2026-04-25"
                    className={`w-full bg-white border rounded-xl md:rounded-2xl py-3 md:py-4 px-4 md:px-6 focus:border-Primary focus:outline-none transition-all text-xs md:text-sm ${errors.deadline ? 'border-red-500' : 'border-gray-100'}`}
                  />
                </div>
                {errors.deadline && <p className="text-[10px] text-red-500 font-bold mt-2 ml-2">{errors.deadline.message}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4 md:gap-6">
                <div>
                  <label className="block text-xs md:text-sm font-bold text-[#1A1A1A] mb-2 md:mb-3">Amount</label>
                  <input
                    {...register('amount', { required: 'Required' })}
                    type="text"
                    placeholder="Enter amount"
                    className={`w-full bg-white border rounded-xl md:rounded-2xl py-3 md:py-4 px-4 md:px-6 focus:border-Primary focus:outline-none transition-all text-xs md:text-sm ${errors.amount ? 'border-red-500' : 'border-gray-100'}`}
                  />
                  {errors.amount && <p className="text-[10px] text-red-500 font-bold mt-2 ml-2">{errors.amount.message}</p>}
                </div>
                <div>
                  <label className="block text-xs md:text-sm font-bold text-[#1A1A1A] mb-2 md:mb-3">Status</label>
                  <div className="relative">
                    <select
                      {...register('status', { required: 'Required' })}
                      className={`w-full bg-white border rounded-xl md:rounded-2xl py-3 md:py-4 px-4 md:px-6 focus:border-Primary focus:outline-none transition-all text-xs md:text-sm appearance-none cursor-pointer text-[#1A1A1A] ${errors.status ? 'border-red-500' : 'border-gray-100'}`}
                    >
                      <option value="Pending">Pending</option>
                      <option value="Draft">Draft</option>
                      <option value="Under Review">Under Review</option>
                      <option value="Approved">Approved</option>
                      <option value="Completed">Completed</option>
                    </select>
                    <ChevronDown className="absolute right-4 md:right-5 top-1/2 -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 text-gray-400 pointer-events-none" />
                  </div>
                  {errors.status && <p className="text-[10px] text-red-500 font-bold mt-2 ml-2">{errors.status.message}</p>}
                </div>
              </div>

              <div>
                <label className="block text-xs md:text-sm font-bold text-[#1A1A1A] mb-2 md:mb-3">Notes (Optional)</label>
                <textarea
                  {...register('notes')}
                  placeholder="Enter notes..."
                  rows={2}
                  className="w-full bg-white border border-gray-100 rounded-xl md:rounded-2xl py-3 md:py-4 px-4 md:px-6 focus:border-Primary focus:outline-none transition-all text-xs md:text-sm resize-none"
                />
              </div>

              {/* Info Box */}
              <div className="bg-gray-50/50 rounded-2xl md:rounded-3xl p-4 md:p-6 border border-gray-50">
                <h4 className="text-[11px] md:text-[13px] font-bold text-[#1A1A1A] mb-2 md:mb-3">After creating your campaign</h4>
                <ul className="space-y-1 md:space-y-1.5">
                  {[
                    "Add deliverables — what content is owed",
                    "Break it into tasks — linked to your Planner",
                    "Upload drafts and finals for brand review",
                    "Track your invoice within the campaign"
                  ].map((text, i) => (
                    <li key={i} className="text-[10px] md:text-[11px] text-gray-400 font-medium list-disc ml-4">
                      {text}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="flex items-center gap-3 md:gap-4 pt-2 md:pt-4">
                <button 
                  type="button"
                  onClick={onClose}
                  className="flex-1 bg-gray-50 text-gray-500 py-3 md:py-4 rounded-xl md:rounded-2xl font-bold hover:bg-gray-100 transition-all text-xs md:text-sm"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="flex-1 bg-Primary text-white py-3 md:py-4 rounded-xl md:rounded-2xl font-bold hover:bg-Primary/90 transition-all shadow-lg shadow-Primary/20 text-xs md:text-sm"
                >
                  Create Campaign
                </button>
              </div>
            </form>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default CreateCampaignModal;
