import React, { useState } from 'react';
import { MoreVertical, Folder, Edit3, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Link } from 'react-router-dom';

const CampaignCard = ({ id, title, brand, amount, dueDate, status, progress, onEdit, onDelete }) => {
  const [showOptions, setShowOptions] = useState(false);

  return (
    <Link to={`/dashboard/campaigns/${id || 1}`}
      onMouseLeave={() => setShowOptions(false)}
      className="block bg-white border border-gray-100 rounded-[32px] p-5  hover:shadow-lg hover:shadow-gray-200/50 transition-all duration-300 relative group"
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-Primary/5 rounded-2xl flex items-center justify-center">
            <Folder className="w-6 h-6 text-Primary" />
          </div>
          <div>
            <h3 className="text-base font-bold text-[#1A1A1A]">{title}</h3>
            <p className="text-xs text-gray-400 font-medium">{brand}</p>
          </div>
        </div>

        <div className="relative">
          <button
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); setShowOptions(!showOptions); }}
            className={`p-2 rounded-full transition-all ${showOptions ? 'bg-gray-100 text-[#1A1A1A]' : 'text-gray-400 hover:bg-gray-50 hover:text-[#1A1A1A]'}`}
          >
            <MoreVertical className="w-5 h-5" />
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
      <div className="lg:mb-8 mb-6">
        <div className="flex items-center justify-between mb-2">
          <div className="h-1.5 flex-1 bg-gray-100 rounded-full overflow-hidden mr-3">
            <div
              className="h-full bg-Primary rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
          <span className="text-[10px] font-bold text-gray-400">
            {progress === 100 ? '6/6' : (progress > 80 ? '5/6' : (progress > 50 ? '2/6' : '1/2'))}
          </span>
        </div>
      </div>

      {/* Footer Info */}
      <div className="flex flex-wrap items-center justify-between gap-y-4 gap-x-2 pt-4 border-t border-gray-50 mt-4">
        <div>
          <p className="text-[10px] text-gray-400 mb-1 uppercase tracking-wider font-bold">Amount</p>
          <p className="text-sm font-bold text-[#1A1A1A]">${amount}</p>
        </div>
        <div className="text-center sm:text-left">
          <p className="text-[10px] text-gray-400 mb-1 uppercase tracking-wider font-bold">Due Date</p>
          <p className="text-sm font-bold text-[#1A1A1A]">{dueDate}</p>
        </div>
        <div className="text-right">
          <p className="text-[10px] text-gray-400 mb-1 uppercase tracking-wider font-bold">Status</p>
          <span className={`inline-block text-[10px] font-bold px-3 py-1 rounded-full ${status === 'Pending' ? 'bg-yellow-50 text-yellow-600' :
            status === 'Draft' ? 'bg-gray-100 text-gray-500' :
              status === 'Under Review' ? 'bg-orange-50 text-orange-500' :
                status === 'Approved' ? 'bg-green-50 text-green-500' :
                  status === 'Completed' ? 'bg-blue-50 text-Primary' :
                    'bg-gray-100 text-gray-500'
            }`}>
            {status}
          </span>
        </div>
      </div>
    </Link>
  );
};

export default CampaignCard;
