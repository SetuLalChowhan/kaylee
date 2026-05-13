import React from 'react';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const DeleteTaskModal = ({ isOpen, onClose, onConfirm }) => {
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
          className="relative w-full max-w-md bg-white rounded-3xl md:rounded-[32px] shadow-2xl p-6 md:p-8"
        >
          <div className="flex items-center justify-between mb-4 md:mb-6">
            <h2 className="text-xl md:text-2xl font-bold text-[#1A1A1A]">Delete Task</h2>
            <button 
              onClick={onClose}
              className="p-1.5 md:p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400 border border-gray-100"
            >
              <X className="w-5 h-5 md:w-6 md:h-6" />
            </button>
          </div>

          <p className="text-[#1A1A1A] text-sm md:text-base mb-1 md:mb-2">Are you sure you want to delete this task?</p>
          <p className="text-gray-400 text-xs md:text-sm mb-6 md:mb-10">This action cannot be undone.</p>

          <div className="flex gap-3 md:gap-4">
            <button
              onClick={onClose}
              className="flex-1 bg-[#F8FAFC] text-[#1A1A1A] py-3 md:py-4 rounded-xl md:rounded-2xl font-bold hover:bg-gray-100 transition-colors text-xs md:text-sm"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className="flex-1 bg-Primary text-white py-3 md:py-4 rounded-xl md:rounded-2xl font-bold hover:bg-Primary/90 transition-all shadow-lg shadow-Primary/20 text-xs md:text-sm"
            >
              Delete Task
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default DeleteTaskModal;
