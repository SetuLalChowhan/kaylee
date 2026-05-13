import React, { useState } from 'react';
import { Crown, Check, AlertCircle } from 'lucide-react';
import PlanModal from './PlanModal';

const SubscriptionSettings = () => {
  const [isPlanModalOpen, setIsPlanModalOpen] = useState(false);

  return (
    <div className="space-y-8">
      {/* Current Plan Summary */}
      <div className="bg-white border border-gray-100 rounded-[32px] p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-sm">
        <div className="flex items-center gap-6">
          <div className="w-16 h-16 bg-Primary/5 rounded-2xl flex items-center justify-center text-Primary">
            <Crown className="w-8 h-8" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-xl font-bold text-[#1A1A1A]">STATER</h3>
              <span className="text-[10px] font-bold text-Primary bg-Primary/5 px-2.5 py-1 rounded-full uppercase">Current plan</span>
            </div>
            <p className="text-sm font-bold text-[#1A1A1A] mb-0.5">Next Renewal Date</p>
            <p className="text-sm text-gray-400 font-medium tracking-tight">04/25/2026</p>
          </div>
        </div>
      </div>

      {/* Pricing Card (Summary View) */}
      <div className="max-w-sm">
        <div className="bg-white border border-gray-100 rounded-[32px] p-8 shadow-sm">
          <h4 className="text-sm font-bold text-gray-500 uppercase tracking-tight mb-4">STATER</h4>
          <div className="flex items-baseline gap-1 mb-4">
            <span className="text-4xl font-bold text-[#1A1A1A]">$0</span>
          </div>
          <p className="text-xs text-gray-400 font-medium mb-8">Try STAKD risk-free for a short sprint.</p>
          
          <div className="space-y-4 mb-10 pt-8 border-t border-gray-50">
            {[
              "Up to 2 active campaigns",
              "Limited brand review links",
              "Watermarked content previews",
              "Basic campaign planner"
            ].map((f, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="p-1 bg-[#1A1A1A] text-white rounded-full">
                  <Check className="w-3 h-3" />
                </div>
                <span className="text-xs font-bold text-[#1A1A1A]">{f}</span>
              </div>
            ))}
          </div>

          <button 
            onClick={() => setIsPlanModalOpen(true)}
            className="w-full bg-Primary text-white py-4 rounded-2xl font-bold hover:bg-Primary/90 transition-all shadow-lg shadow-Primary/10"
          >
            Upgrade
          </button>
        </div>
      </div>

      {/* Cancel Section */}
      <div className="pt-8 space-y-4">
        <div className="flex items-center gap-2 text-red-500">
          <AlertCircle className="w-5 h-5" />
          <h3 className="text-base font-bold">Cancel Subscription</h3>
        </div>
        <p className="text-sm text-gray-400 font-medium leading-relaxed max-w-xl">
          Subscribe to access advanced features and make the most out of your experience.
        </p>
        <button className="bg-red-50 text-red-500 px-8 py-3 rounded-2xl text-xs font-bold hover:bg-red-100 transition-all">
          Cancel Subscription
        </button>
      </div>

      <PlanModal 
        isOpen={isPlanModalOpen} 
        onClose={() => setIsPlanModalOpen(false)} 
      />
    </div>
  );
};

export default SubscriptionSettings;
