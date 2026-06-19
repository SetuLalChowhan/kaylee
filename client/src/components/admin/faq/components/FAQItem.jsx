import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Edit2, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const FAQItem = ({ question, answer, isAdmin, onEdit, onDelete }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className={`mb-4 bg-white border border-gray-100 rounded-2xl overflow-hidden transition-all ${isOpen ? 'shadow-sm' : 'hover:bg-gray-50'}`}>
      <div className="w-full flex items-center justify-between p-6">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex-1 flex items-center justify-between focus:outline-none pr-4"
        >
          <span className="text-sm font-bold text-[#1A1A1A] text-left">{question}</span>
          {isOpen ? (
            <ChevronUp className="w-5 h-5 text-gray-400 flex-shrink-0 ml-4" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-400 flex-shrink-0 ml-4" />
          )}
        </button>
        
        {isAdmin && (
          <div className="flex items-center gap-2 border-l border-gray-100 pl-4 ml-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit();
              }}
              className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-500 hover:text-Primary transition-colors"
            >
              <Edit2 className="w-4 h-4" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
              className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-500 hover:text-red-500 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
      
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
          >
            <div className="px-6 pb-6 text-xs text-gray-500 leading-relaxed font-medium">
              <div className="pt-4 border-t border-gray-50">
                {answer}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default FAQItem;
