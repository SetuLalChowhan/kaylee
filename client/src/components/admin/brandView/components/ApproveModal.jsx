import { CheckCircle, X, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const ApproveModal = ({ isOpen, isAll, onClose, onConfirm, isPending }) => {
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
          className="relative w-full max-w-md bg-white rounded-3xl md:rounded-[32px] shadow-2xl p-6 md:p-10"
        >
          <button
            onClick={onClose}
            className="absolute top-6 right-6 md:top-8 md:right-8 p-1.5 md:p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400 border border-gray-100 bg-white"
          >
            <X className="w-5 h-5 md:w-6 md:h-6" />
          </button>
          <div className="text-center mb-6 md:mb-8">
            <div className="w-12 h-12 md:w-16 md:h-16 bg-Primary/5 rounded-xl md:rounded-2xl flex items-center justify-center mx-auto mb-3 md:mb-4">
              <CheckCircle className="w-6 h-6 md:w-8 md:h-8 text-Primary" />
            </div>
            <h2 className="text-lg md:text-xl font-bold text-[#1A1A1A] mb-1 md:mb-2">Are you sure?</h2>
            <p className="text-xs md:text-sm text-gray-400">
              {isAll
                ? 'This will approve all media files. This action cannot be undone.'
                : 'This will approve the selected file. This action cannot be undone.'
              }
            </p>
          </div>
          <div className="flex gap-3 md:gap-4">
            <button onClick={onClose} disabled={isPending} className="flex-1 bg-gray-50 text-gray-500 py-3 md:py-4 rounded-xl md:rounded-2xl font-bold hover:bg-gray-100 transition-colors text-xs md:text-sm disabled:opacity-60 disabled:cursor-not-allowed">Cancel</button>
            <button
              onClick={onConfirm}
              disabled={isPending}
              className="flex-1 bg-Primary text-white py-3 md:py-4 rounded-xl md:rounded-2xl font-bold hover:bg-Primary/95 transition-all shadow-lg shadow-Primary/25 text-xs md:text-sm disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-1.5"
            >
              {isPending && <Loader2 className="w-4 h-4 animate-spin text-white" />}
              {isPending ? 'Approving...' : 'Approve'}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default ApproveModal;
