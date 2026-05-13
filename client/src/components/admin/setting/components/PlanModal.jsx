import React from 'react';
import { X, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const PlanCard = ({ title, price, period, description, features, recommended, buttonText, isDark }) => (
  <div className={`relative flex-1 p-8 rounded-[32px] border ${isDark ? 'bg-[#0A0A0A] border-[#1A1A1A] text-white' : 'bg-white border-gray-100 text-[#1A1A1A]'} flex flex-col h-full shadow-sm`}>
    {recommended && (
      <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-Primary text-white text-[10px] font-bold px-4 py-1.5 rounded-full uppercase tracking-wider z-20 shadow-lg shadow-Primary/30">
        Recommended
      </div>
    )}
    
    <div className="mb-6">
      <h3 className={`text-sm font-bold uppercase tracking-tight mb-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{title}</h3>
      <div className="flex items-baseline gap-1">
        <span className="text-4xl font-bold">${price}</span>
        {period && <span className={`text-sm font-medium ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>/{period}</span>}
      </div>
      <p className={`text-xs mt-3 font-medium leading-relaxed ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{description}</p>
    </div>

    <div className="flex-1 space-y-4 mb-10 pt-6 border-t border-gray-50/10">
      {features.map((feature, idx) => (
        <div key={idx} className="flex items-center gap-3">
          <div className={`p-1 rounded-full ${isDark ? 'bg-white text-black' : 'bg-black text-white'}`}>
            <Check className="w-3 h-3" />
          </div>
          <span className="text-xs font-bold">{feature}</span>
        </div>
      ))}
    </div>

    <button className={`w-full py-4 rounded-2xl font-bold transition-all ${isDark ? 'bg-white text-black hover:bg-gray-100' : 'bg-Primary text-white hover:bg-Primary/90 shadow-lg shadow-Primary/10'}`}>
      {buttonText}
    </button>
  </div>
);

const PlanModal = ({ isOpen, onClose }) => {
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
          className="relative w-full max-w-5xl bg-white rounded-[40px] shadow-2xl p-10 md:p-14 overflow-hidden"
        >
          <button 
            onClick={onClose}
            className="absolute top-8 right-8 p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400 border border-gray-100 z-30 bg-white"
          >
            <X className="w-6 h-6" />
          </button>

          <div className="mb-12">
            <h2 className="text-3xl font-bold text-[#1A1A1A]">Select Plan</h2>
            <div className="w-full border-b border-dashed border-gray-100 mt-6" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
            <PlanCard 
              title="STATER"
              price="0"
              description="Try STAKD risk-free for a short sprint."
              buttonText="Start Free Trial"
              features={[
                "Up to 2 active campaigns",
                "Limited brand review links",
                "Watermarked content previews",
                "Basic campaign planner"
              ]}
            />
            <PlanCard 
              title="PRO"
              price="24"
              period="monthly"
              description="Built for creators working with brands regularly."
              buttonText="Get Started with Pro"
              recommended={true}
              isDark={true}
              features={[
                "Up to 20 active campaigns",
                "Unlimited brand review links",
                "Full approval & feedback system",
                "No STAKD branding on deliveries"
              ]}
            />
            <PlanCard 
              title="GROWTH"
              price="100"
              period="yearly"
              description="Scale your creator business and save more."
              buttonText="Go Yearly & Save"
              features={[
                "Unlimited active campaigns",
                "Unlimited brand review links",
                "Priority support",
                "Best value pricing (save 20%)"
              ]}
            />
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default PlanModal;
