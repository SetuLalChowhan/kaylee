import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Minus } from 'lucide-react';

const FAQItem = ({ question, answer, isOpen, onClick }) => {
  return (
    <div className="border-b border-gray-100 last:border-0">
      <button
        onClick={onClick}
        className="w-full py-3 md:py-6 flex items-center justify-between gap-4 text-left group"
      >
        <span className={`text-sm sm:text-base md:text-lg lg:text-[20px] font-bold transition-colors duration-300 ${isOpen ? 'text-[#1A1A1A]' : 'text-[#4F4F4F] group-hover:text-[#1A1A1A]'}`}>
          {question}
        </span>
        <div className={`flex-shrink-0 w-6 h-6 flex items-center justify-center transition-all duration-300 ${isOpen ? 'text-[#1A1A1A]' : 'text-[#4F4F4F]'}`}>
          {isOpen ? <Minus className="w-4 h-4 md:w-5 md:h-5" /> : <Plus className="w-4 h-4 md:w-5 md:h-5" />}
        </div>
      </button>
      
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <p className="pb-3 md:pb-6 text-[#666] text-xs sm:text-sm md:text-base lg:text-[18px] leading-relaxed max-w-[95%]">
              {answer}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default FAQItem;
