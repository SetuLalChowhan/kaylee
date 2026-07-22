import React, { useEffect, useState, useRef } from 'react';
import { X, Calendar as CalendarIcon, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useForm } from 'react-hook-form';
import { useCampaigns } from '@/api/apiHooks/useCampaign';

const TaskModal = ({ isOpen, onClose, onSubmit, task, type = 'add' }) => {
  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm();
  const { data: campaigns = [] } = useCampaigns();

  const [isOpenDropdown, setIsOpenDropdown] = useState(false);
  const dropdownRef = useRef(null);

  const selectedCampaign = watch('campaign') || '';

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpenDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredCampaigns = campaigns.filter((c) =>
    c.title?.toLowerCase().includes(selectedCampaign.toLowerCase())
  );

  useEffect(() => {
    if (task) {
      reset({
        name: task.name || '',
        date: task.date || '',
        campaign: task.campaign || '',
      });
    } else {
      reset({ name: '', date: '', campaign: '' });
    }
  }, [task, reset]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 sm:p-6">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/50 backdrop-blur-sm cursor-pointer"
        />
        
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] z-10 border border-gray-100"
        >
          {/* Header */}
          <div className="p-6 md:p-8 pb-4 bg-white relative z-20">
            <button 
              onClick={onClose}
              className="absolute top-6 right-6 w-9 h-9 rounded-full bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-all cursor-pointer shadow-sm"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="pr-10">
              <h2 className="text-2xl md:text-3xl font-bold text-[#1A1A1A] tracking-tight">{type === 'add' ? 'Add Task' : 'Edit Task'}</h2>
              <p className="text-sm text-gray-500 font-medium mt-1">Schedule and assign tasks for your campaigns.</p>
              <div className="w-full border-b border-gray-100 mt-4" />
            </div>
          </div>

          {/* Form */}
          <div className="flex-1 overflow-y-auto px-6 md:px-8 pb-6 md:pb-8 custom-scrollbar">
            <form onSubmit={handleSubmit(onSubmit)} className={`space-y-4 transition-all duration-200 ${isOpenDropdown ? 'pb-36' : ''}`}>
              {/* Task Name */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">Task Name</label>
                <input
                  {...register('name', { required: true })}
                  type="text"
                  placeholder="e.g. Shoot video, Edit draft"
                  className="w-full bg-[#F8FAFC] border border-gray-200 rounded-xl py-2.5 px-3.5 focus:bg-white focus:border-Primary focus:ring-2 focus:ring-Primary/10 focus:outline-none transition-all text-sm text-[#1A1A1A] placeholder-gray-400 font-medium"
                />
              </div>

              {/* Date */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">Date</label>
                <input
                  {...register('date', { required: true })}
                  type="date"
                  className="w-full bg-[#F8FAFC] border border-gray-200 rounded-xl py-2.5 px-3.5 focus:bg-white focus:border-Primary focus:ring-2 focus:ring-Primary/10 focus:outline-none transition-all text-sm text-[#1A1A1A] font-medium"
                />
              </div>

              {/* Campaign */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">Campaign</label>
                <div className="relative" ref={dropdownRef}>
                  <input
                    {...register('campaign', { required: 'Please select or type a campaign name' })}
                    type="text"
                    placeholder="Select or type a campaign"
                    onFocus={() => setIsOpenDropdown(true)}
                    autoComplete="off"
                    className={`w-full bg-[#F8FAFC] border rounded-xl py-2.5 px-3.5 focus:bg-white focus:border-Primary focus:ring-2 focus:ring-Primary/10 focus:outline-none transition-all text-sm text-[#1A1A1A] placeholder-gray-400 font-medium ${
                      errors.campaign ? 'border-red-500' : 'border-gray-200'
                    }`}
                  />
                  <ChevronDown className={`absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none transition-transform duration-200 ${isOpenDropdown ? 'rotate-180 text-Primary' : ''}`} />
                  
                  <AnimatePresence>
                    {isOpenDropdown && (
                      <motion.div
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        transition={{ duration: 0.15 }}
                        className="absolute z-50 left-0 right-0 mt-1.5 bg-white border border-gray-100 rounded-xl shadow-xl max-h-48 overflow-y-auto custom-scrollbar"
                      >
                        {filteredCampaigns.length > 0 ? (
                          <div className="py-1">
                            {filteredCampaigns.map((c) => (
                              <button
                                key={c.id}
                                type="button"
                                onClick={() => {
                                  setValue('campaign', c.title, { shouldValidate: true });
                                  setIsOpenDropdown(false);
                                }}
                                className="w-full text-left px-4 py-2 hover:bg-gray-50 text-sm text-[#1A1A1A] font-medium transition-colors cursor-pointer"
                              >
                                {c.title}
                              </button>
                            ))}
                          </div>
                        ) : (
                          <div className="px-4 py-3 text-sm text-gray-400 font-medium italic">
                            No matching campaigns. Keep typing to add manually.
                          </div>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
                {errors.campaign && <p className="text-xs text-red-500 font-bold mt-1 ml-1">{errors.campaign.message}</p>}
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-2.5 text-sm font-bold text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded-xl transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-Primary text-white px-6 py-3 rounded-xl md:rounded-2xl font-bold text-sm hover:bg-Primary/90 shadow-lg shadow-Primary/20 transition-all cursor-pointer"
                >
                  {type === 'add' ? 'Save Task' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default TaskModal;
