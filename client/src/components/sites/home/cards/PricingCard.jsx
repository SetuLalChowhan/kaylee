import React from 'react';
import { motion } from 'motion/react';
import { Check, Loader2 } from 'lucide-react';
import CommonButton from '@/components/ui/CommonButton';

const PricingCard = ({ 
  title, 
  price, 
  description, 
  features, 
  buttonText, 
  isRecommended, 
  isDark, 
  priceSuffix = "/monthly", 
  index,
  onSelect,
  loading
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      className={`relative p-6 lg:p-10 rounded-[24px] border transition-all duration-500 h-full flex flex-col ${
        isDark 
          ? 'bg-[#010101] border-[#010101] text-white shadow-2xl' 
          : 'bg-white border-[#F2F2F2] text-[#1A1A1A] shadow-sm'
      }`}
    >
      {isRecommended && (
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-Primary text-white px-5 py-1.5 rounded-full text-[10px] font-bold tracking-widest uppercase">
          Recommended
        </div>
      )}

      <div className="mb-6">
        <h3 className={`text-xs font-bold tracking-[0.2em] uppercase mb-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
          {title}
        </h3>
        <div className="flex items-baseline gap-1 mb-4">
          <span className="text-[40px] lg:text-[56px] font-bold tracking-tight">${price}</span>
          <span className={`text-[12px] font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{priceSuffix}</span>
        </div>
        <p className={`text-[14px] lg:text-[16px] leading-relaxed ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
          {description}
        </p>
      </div>

      <div className={`w-full h-[1px] my-8 ${isDark ? 'bg-white/10' : 'bg-gray-100'}`} />

      <div className="flex-1 mb-10">
        <ul className="space-y-5">
          {features.map((feature, idx) => (
            <li key={idx} className="flex items-center gap-3">
              <div className={`flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center ${isDark ? 'bg-white text-black' : 'bg-[#010101] text-white'}`}>
                <Check className="w-3 h-3 stroke-[3px]" />
              </div>
              <span className={`text-[14px] lg:text-[16px] font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                {feature}
              </span>
            </li>
          ))}
        </ul>
      </div>

      <button
        onClick={onSelect}
        disabled={loading}
        className={`w-full py-4 lg:py-5 rounded-xl font-bold text-[14px] lg:text-[16px] transition-all cursor-pointer text-center flex items-center justify-center gap-2 ${
          isDark 
            ? 'bg-white text-black hover:bg-gray-100' 
            : 'bg-Primary text-white hover:bg-Primary/90 shadow-lg shadow-Primary/20'
        } ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
      >
        {loading && <Loader2 className="w-4 h-4 animate-spin" />}
        {buttonText}
      </button>
    </motion.div>
  );
};

export default PricingCard;
