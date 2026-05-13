import React from 'react';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const DeleteInvoiceModal = ({ isOpen, onClose, onConfirm }) => {
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
          className="relative w-full max-w-md bg-white rounded-[40px] shadow-2xl p-10"
        >
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-[#1A1A1A]">Delete Invoice</h2>
            <button 
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400 border border-gray-100"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <p className="text-[#1A1A1A] text-lg mb-2">Are you sure you want to delete this invoice?</p>
          <p className="text-gray-400 text-sm mb-12 leading-relaxed">
            This action cannot be undone. All data associated with this invoice will be permanently removed.
          </p>

          <div className="flex gap-4">
            <button
              onClick={onClose}
              className="flex-1 bg-gray-50 text-gray-500 py-5 rounded-2xl font-bold hover:bg-gray-100 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className="flex-1 bg-Primary text-white py-5 rounded-2xl font-bold hover:bg-Primary/90 transition-all shadow-lg shadow-Primary/20"
            >
              Delete Invoice
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default DeleteInvoiceModal;
