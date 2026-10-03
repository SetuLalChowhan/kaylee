import React from 'react';
import { X, Loader2, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const DeleteTaskModal = ({ isOpen, onClose, onConfirm, isDeleting = false, taskName = 'this task' }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div key="delete-task-modal" className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            onClick={isDeleting ? undefined : onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm cursor-pointer"
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 16 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="relative w-full max-w-md bg-white rounded-3xl md:rounded-[32px] shadow-2xl p-6 md:p-8 z-10 border border-gray-100"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4 md:mb-6">
              <h2 className="text-xl md:text-2xl font-bold text-[#1A1A1A]">Delete Task</h2>
              <button 
                onClick={onClose}
                disabled={isDeleting}
                className="p-1.5 md:p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400 border border-gray-100 cursor-pointer disabled:opacity-50"
              >
                <X className="w-5 h-5 md:w-6 md:h-6" />
              </button>
            </div>

            <p className="text-[#1A1A1A] text-sm md:text-base mb-1 md:mb-2">
              Are you sure you want to delete <span className="font-bold text-red-600">"{taskName}"</span>?
            </p>
            <p className="text-gray-400 text-xs md:text-sm mb-6 md:mb-8">This action cannot be undone.</p>

            <div className="flex gap-3 md:gap-4">
              <button
                type="button"
                onClick={onClose}
                disabled={isDeleting}
                className="flex-1 bg-[#F8FAFC] text-[#1A1A1A] py-3 md:py-3.5 rounded-xl md:rounded-2xl font-bold hover:bg-gray-100 transition-colors text-xs md:text-sm cursor-pointer disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={onConfirm}
                disabled={isDeleting}
                className="flex-1 bg-red-600 text-white py-3 md:py-3.5 rounded-xl md:rounded-2xl font-bold hover:bg-red-700 transition-all shadow-lg shadow-red-600/20 text-xs md:text-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    <span>Delete Task</span>
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default DeleteTaskModal;
