import React, { useState } from 'react';
import { MoreVertical, Edit3, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Link } from 'react-router-dom';
import CommonButton from '@/components/ui/CommonButton';
import { CampaignIcon } from '@/components/icons/CustomIcon';

const CampaignCard = ({ id, title, brand, amount, dueDate, status, progress, onEdit, onDelete }) => {
  const [showOptions, setShowOptions] = useState(false);

  return (
    <Link to={`/dashboard/campaigns/${id || 1}`}
      onMouseLeave={() => setShowOptions(false)}
      className="block bg-white border border-gray-100 rounded-[24px] p-3.5 sm:p-4 hover:shadow-lg hover:shadow-gray-200/40 transition-all duration-300 relative group"
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 bg-blue-50/80 border border-blue-100/80 rounded-xl flex items-center justify-center flex-shrink-0 text-blue-600 shadow-sm group-hover:scale-105 transition-transform duration-300">
            <CampaignIcon className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <h3 className="text-sm font-bold text-[#1A1A1A] truncate">{title}</h3>
            <p className="text-[11px] text-gray-400 font-medium truncate">{brand}</p>
          </div>
        </div>

        <div className="relative flex-shrink-0">
          <button
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); setShowOptions(!showOptions); }}
            className={`p-1.5 rounded-full transition-all ${showOptions ? 'bg-gray-100 text-[#1A1A1A]' : 'text-gray-400 hover:bg-gray-50 hover:text-[#1A1A1A]'}`}
          >
            <MoreVertical className="w-4 h-4" />
          </button>

          <AnimatePresence>
            {showOptions && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 10 }}
                className="absolute right-0 mt-2 w-32 bg-white rounded-2xl shadow-xl z-20 py-2 overflow-hidden border border-gray-50"
              >
                <button
                  onClick={(e) => {
                    e.preventDefault(); e.stopPropagation();
                    onEdit();
                    setShowOptions(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-xs text-gray-700 hover:bg-gray-50 transition-colors font-bold"
                >
                  <Edit3 className="w-4 h-4 text-gray-500" />
                  <span>Edit</span>
                </button>
                <button
                  onClick={(e) => {
                    e.preventDefault(); e.stopPropagation();
                    onDelete();
                    setShowOptions(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-xs text-red-500 hover:bg-red-50 transition-colors font-bold"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Delete</span>
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-3">
        <div className="flex items-center justify-between mb-1.5">
          <div className="h-1.5 flex-1 bg-gray-100 rounded-full overflow-hidden mr-2.5">
            <div
              className="h-full bg-Primary rounded-full transition-all duration-500"
              style={{ width: `${typeof progress === 'number' ? Math.round(progress) : 0}%` }}
            />
          </div>
          <span className="text-[11px] font-bold text-Primary whitespace-nowrap">
            {typeof progress === 'number' ? `${Math.round(progress)}%` : `${progress || 0}%`}
          </span>
        </div>
      </div>

      {/* Footer Info */}
      <div className="flex flex-wrap items-center justify-between gap-y-2 gap-x-2 pt-3 border-t border-gray-50 mt-3">
        <div>
          <p className="text-[9px] text-gray-400 mb-0.5 uppercase tracking-wider font-bold">Amount</p>
          <p className="text-xs font-bold text-[#1A1A1A]">${amount}</p>
        </div>
        <div className="text-right">
          <p className="text-[9px] text-gray-400 mb-0.5 uppercase tracking-wider font-bold">Due Date</p>
          <p className="text-xs font-bold text-[#1A1A1A]">{dueDate}</p>
        </div>
      </div>

      <div className="pt-3">
        <CommonButton
          type="link"
          path={`/dashboard/campaigns/${id}`}
          className="bg-Primary text-white px-3 py-2.5 rounded-xl font-bold flex items-center justify-center gap-1.5 shadow-md shadow-Primary/20 hover:bg-Primary/90 transition-all text-xs w-full"
        >
          View Campaign Details <span className="text-xs">→</span>
        </CommonButton>
      </div>
    </Link>
  );
};

export default CampaignCard;
