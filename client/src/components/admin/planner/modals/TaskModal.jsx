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
          className="relative w-full max-w-md bg-white rounded-[32px] shadow-2xl"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 md:p-8 border-b border-gray-50">
            <h2 className="text-xl md:text-2xl font-bold text-[#1A1A1A]">{type === 'add' ? 'Add Task' : 'Edit Task'}</h2>
            <button 
              onClick={onClose}
              className="p-1.5 md:p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400 border border-gray-100"
            >
              <X className="w-5 h-5 md:w-6 md:h-6" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className={`p-6 md:p-8 space-y-4 md:space-y-6 transition-all duration-200 ${isOpenDropdown ? 'pb-36' : ''}`}>
            {/* Task Name */}
            <div>
              <label className="block text-xs md:text-sm font-bold text-[#1A1A1A] mb-2 md:mb-3">Task Name</label>
              <input
                {...register('name', { required: true })}
                type="text"
                placeholder="e.g. Shoot video, Edit draft"
                className="w-full bg-white border border-gray-100 rounded-xl md:rounded-2xl py-3 md:py-4 px-4 md:px-6 focus:border-Primary focus:outline-none transition-all text-xs md:text-sm text-[#1A1A1A] placeholder:text-gray-300"
              />
            </div>

            {/* Date */}
            <div>
              <label className="block text-xs md:text-sm font-bold text-[#1A1A1A] mb-2 md:mb-3">Date</label>
              <div className="relative group">
                <input
                  {...register('date', { required: true })}
                  type="date"
                  className="w-full bg-white border border-gray-100 rounded-xl md:rounded-2xl py-3 md:py-4 px-4 md:px-6 focus:border-Primary focus:outline-none transition-all text-xs md:text-sm text-[#1A1A1A]"
                />
              </div>
            </div>

            {/* Campaign */}
            <div>
              <label className="block text-xs md:text-sm font-bold text-[#1A1A1A] mb-2 md:mb-3">Campaign</label>
              <div className="relative" ref={dropdownRef}>
                <input
                  {...register('campaign', { required: 'Please select or type a campaign name' })}
                  type="text"
                  placeholder="Select or type a campaign"
                  onFocus={() => setIsOpenDropdown(true)}
                  autoComplete="off"
                  className={`w-full bg-white border rounded-xl md:rounded-2xl py-3 md:py-4 px-4 md:px-6 focus:border-Primary focus:outline-none transition-all text-xs md:text-sm text-[#1A1A1A] placeholder:text-gray-300 ${
                    errors.campaign ? 'border-red-500' : 'border-gray-100'
                  }`}
                />
                <ChevronDown className={`absolute right-4 md:right-6 top-1/2 -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 text-gray-300 pointer-events-none transition-transform duration-200 ${isOpenDropdown ? 'rotate-180 text-Primary' : ''}`} />
                
                <AnimatePresence>
                  {isOpenDropdown && (
                    <motion.div
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.15 }}
                      className="absolute z-50 left-0 right-0 mt-1.5 bg-white border border-gray-100 rounded-xl md:rounded-2xl shadow-xl max-h-48 overflow-y-auto custom-scrollbar"
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
                              className="w-full text-left px-4 md:px-6 py-2 hover:bg-gray-50 text-xs md:text-sm text-[#1A1A1A] font-medium transition-colors"
                            >
                              {c.title}
                            </button>
                          ))}
                        </div>
                      ) : (
                        <div className="px-4 md:px-6 py-3 text-xs md:text-sm text-gray-400 font-medium italic">
                          No matching campaigns. Keep typing to add manually.
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              {errors.campaign && <p className="text-[10px] text-red-500 font-bold mt-2 ml-2">{errors.campaign.message}</p>}
            </div>

            {/* Actions */}
            <div className="flex gap-3 md:gap-4 pt-2 md:pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 bg-[#F8FAFC] text-[#1A1A1A] py-3 md:py-4 rounded-xl md:rounded-2xl font-bold hover:bg-gray-100 transition-colors text-xs md:text-sm"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 bg-Primary text-white py-3 md:py-4 rounded-xl md:rounded-2xl font-bold hover:bg-Primary/90 transition-all shadow-lg shadow-Primary/20 text-xs md:text-sm"
              >
                {type === 'add' ? 'Save Task' : 'Save Changes'}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default TaskModal;
