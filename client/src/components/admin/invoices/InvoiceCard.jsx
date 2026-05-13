import React, { useState } from 'react';
import { MoreVertical, Edit3, Trash2, Receipt } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const InvoiceCard = ({ invoice, onEdit, onDelete }) => {
  const [showOptions, setShowOptions] = useState(false);

  const getStatusColor = (status) => {
    switch (status) {
      case 'Paid': return 'bg-green-50 text-green-500';
      case 'Pending': return 'bg-orange-50 text-orange-500';
      case 'Overdue': return 'bg-red-50 text-red-500';
      default: return 'bg-gray-50 text-gray-500';
    }
  };

  return (
    <div className="bg-white border border-gray-100 rounded-[32px] p-8 hover:shadow-lg hover:shadow-gray-200/50 transition-all duration-300 relative group">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-Primary/5 rounded-2xl flex items-center justify-center">
            <Receipt className="w-6 h-6 text-Primary" />
          </div>
          <div>
            <h3 className="text-base font-bold text-[#1A1A1A]">{invoice.invoiceNo}</h3>
            <p className="text-xs text-Primary font-semibold">{invoice.campaign}</p>
          </div>
        </div>

        <div className="relative">
          <button 
            onClick={() => setShowOptions(!showOptions)}
            className={`p-2 rounded-full transition-all border border-transparent ${showOptions ? 'bg-gray-100 text-[#1A1A1A]' : 'text-gray-400 hover:bg-gray-50'}`}
          >
            <MoreVertical className="w-5 h-5" />
          </button>

          <AnimatePresence>
            {showOptions && (
              <>
                <div 
                  className="fixed inset-0 z-10" 
                  onClick={() => setShowOptions(false)}
                />
                <motion.div
                  initial={{ opacity: 0, scale: 0.9, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, y: 10 }}
                  className="absolute right-0 mt-2 w-48 bg-white border border-gray-100 rounded-2xl shadow-xl z-20 py-2 overflow-hidden"
                >
                  <button 
                    onClick={() => {
                      onEdit(invoice);
                      setShowOptions(false);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-600 hover:bg-gray-50 hover:text-Primary transition-colors"
                  >
                    <Edit3 className="w-4 h-4" />
                    <span className="font-semibold">Edit</span>
                  </button>
                  <button 
                    onClick={() => {
                      onDelete(invoice);
                      setShowOptions(false);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-500 hover:bg-red-50/50 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span className="font-semibold">Delete</span>
                  </button>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-50">
        <div>
          <p className="text-[10px] text-gray-400 mb-1 uppercase tracking-wider font-bold">Issue Date</p>
          <p className="text-sm font-bold text-[#1A1A1A]">{invoice.issueDate}</p>
        </div>
        <div>
          <p className="text-[10px] text-gray-400 mb-1 uppercase tracking-wider font-bold">Due Date</p>
          <p className="text-sm font-bold text-[#1A1A1A]">{invoice.dueDate}</p>
        </div>
        <div className="text-right">
          <p className="text-[10px] text-gray-400 mb-1 uppercase tracking-wider font-bold">Status</p>
          <span className={`inline-block text-[10px] font-bold px-3 py-1 rounded-full ${getStatusColor(invoice.status)}`}>
            {invoice.status}
          </span>
        </div>
      </div>
    </div>
  );
};

export default InvoiceCard;
