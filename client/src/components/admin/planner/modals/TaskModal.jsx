import React, { useEffect } from 'react';
import { X, Calendar as CalendarIcon, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useForm } from 'react-hook-form';

const TaskModal = ({ isOpen, onClose, onSubmit, task, type = 'add' }) => {
  const { register, handleSubmit, reset, setValue, watch } = useForm();

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
          className="relative w-full max-w-md bg-white rounded-[32px] shadow-2xl overflow-hidden"
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
          <form onSubmit={handleSubmit(onSubmit)} className="p-6 md:p-8 space-y-4 md:space-y-6">
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
                  className="w-full bg-white border border-gray-100 rounded-xl md:rounded-2xl py-3 md:py-4 px-4 md:px-6 focus:border-Primary focus:outline-none transition-all text-xs md:text-sm text-[#1A1A1A] appearance-none"
                />
                <CalendarIcon className="absolute right-4 md:right-6 top-1/2 -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 text-gray-300 pointer-events-none group-focus-within:text-Primary transition-colors" />
              </div>
            </div>

            {/* Campaign */}
            <div>
              <label className="block text-xs md:text-sm font-bold text-[#1A1A1A] mb-2 md:mb-3">Campaign</label>
              <div className="relative group">
                <select
                  {...register('campaign', { required: true })}
                  className="w-full bg-white border border-gray-100 rounded-xl md:rounded-2xl py-3 md:py-4 px-4 md:px-6 focus:border-Primary focus:outline-none transition-all text-xs md:text-sm text-[#1A1A1A] appearance-none"
                >
                  <option value="">Select a campaign</option>
                  <option value="Content Creation">Content Creation</option>
                  <option value="Nike UGC Shoot">Nike UGC Shoot</option>
                  <option value="Coffee Brand Reel Campaign">Coffee Brand Reel Campaign</option>
                  <option value="Summer Skincare Promo">Summer Skincare Promo</option>
                </select>
                <ChevronDown className="absolute right-4 md:right-6 top-1/2 -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 text-gray-300 pointer-events-none group-focus-within:text-Primary transition-colors" />
              </div>
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
