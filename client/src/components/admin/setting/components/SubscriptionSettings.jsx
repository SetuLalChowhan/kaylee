import React, { useState, useEffect } from 'react';
import { Crown, Check, AlertCircle, Loader2 } from 'lucide-react';
import PlanModal from './PlanModal';
import useAxiosSecure from '@/hooks/useAxiosSecure';

const SubscriptionSettings = () => {
  const [isPlanModalOpen, setIsPlanModalOpen] = useState(false);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const axiosSecure = useAxiosSecure();

  const fetchPlanDetails = async () => {
    try {
      const res = await axiosSecure.get('/subscriptions/my-plan');
      if (res.data?.status === 'success') {
        const payload = res.data.data;
        if (payload.plan && typeof payload.plan.features === 'string') {
          payload.plan.features = JSON.parse(payload.plan.features);
        }
        setData(payload);
      }
    } catch (err) {
      console.error("Failed to load subscription status:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlanDetails();
  }, []);

  const handleCancelSubscription = async () => {
    alert("To cancel or update your subscription, please contact support or update via your Stripe Customer Portal.");
  };

  if (loading) {
    return (
      <div className="py-20 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-Primary animate-spin" />
      </div>
    );
  }

  const plan = data?.plan || {
    title: "STATER",
    description: "Try STAKD risk-free for a short sprint.",
    price: 0,
    priceSuffix: "",
    features: [
      "Up to 2 active campaigns",
      "Limited brand review links",
      "Watermarked content previews",
      "Basic campaign planner"
    ],
    campaignLimit: 2
  };

  const campaignCount = data?.campaignCount ?? 0;
  const campaignLimit = data?.campaignLimit ?? 2;
  const usagePercentage = Math.min(100, Math.round((campaignCount / campaignLimit) * 100));

  return (
    <div className="space-y-8 font-outfit animate-fade-in">
      {/* Current Plan Summary */}
      <div className="bg-white border border-gray-100 rounded-[32px] p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-sm">
        <div className="flex items-center gap-6">
          <div className="w-16 h-16 bg-Primary/5 rounded-2xl flex items-center justify-center text-Primary">
            <Crown className="w-8 h-8" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-xl font-bold text-[#1A1A1A]">{plan.title}</h3>
              <span className="text-[10px] font-bold text-Primary bg-Primary/5 px-2.5 py-1 rounded-full uppercase">Current plan</span>
            </div>
            <p className="text-sm font-bold text-[#1A1A1A] mb-0.5">Campaign Usage</p>
            <p className="text-sm text-gray-400 font-medium tracking-tight">
              {campaignCount} of {campaignLimit === 999999 ? "unlimited" : campaignLimit} campaigns active ({usagePercentage}% used)
            </p>
          </div>
        </div>

        {/* Progress Bar */}
        {campaignLimit !== 999999 && (
          <div className="w-full md:w-64">
            <div className="flex justify-between text-xs font-bold text-[#1A1A1A] mb-2">
              <span>Usage limit</span>
              <span>{usagePercentage}%</span>
            </div>
            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
              <div 
                className={`h-full rounded-full transition-all duration-500 ${usagePercentage > 85 ? 'bg-red-500' : 'bg-Primary'}`}
                style={{ width: `${usagePercentage}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Pricing Card (Summary View) */}
      <div className="max-w-sm">
        <div className="bg-white border border-gray-100 rounded-[32px] p-8 shadow-sm">
          <h4 className="text-sm font-bold text-gray-500 uppercase tracking-tight mb-4">{plan.title}</h4>
          <div className="flex items-baseline gap-1 mb-4">
            <span className="text-4xl font-bold text-[#1A1A1A]">${plan.price}</span>
            {plan.priceSuffix && (
              <span className="text-sm text-gray-400 font-medium">{plan.priceSuffix}</span>
            )}
          </div>
          <p className="text-xs text-gray-400 font-medium mb-8 leading-relaxed">{plan.description}</p>
          
          <div className="space-y-4 mb-10 pt-8 border-t border-gray-50">
            {plan.features.map((f, i) => (
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
            className="w-full bg-Primary text-white py-4 rounded-2xl font-bold hover:bg-Primary/90 transition-all shadow-lg shadow-Primary/10 cursor-pointer"
          >
            Upgrade Plan
          </button>
        </div>
      </div>

      {/* Cancel Section */}
      {plan.price > 0 && (
        <div className="pt-8 space-y-4">
          <div className="flex items-center gap-2 text-red-500">
            <AlertCircle className="w-5 h-5" />
            <h3 className="text-base font-bold">Manage Subscription</h3>
          </div>
          <p className="text-sm text-gray-400 font-medium leading-relaxed max-w-xl">
            You are currently on a paid subscription. You can upgrade, downgrade, or manage billing from Stripe.
          </p>
          <button 
            onClick={handleCancelSubscription}
            className="bg-red-50 text-red-500 px-8 py-3 rounded-2xl text-xs font-bold hover:bg-red-100 transition-all cursor-pointer"
          >
            Cancel Subscription
          </button>
        </div>
      )}

      <PlanModal 
        isOpen={isPlanModalOpen} 
        onClose={() => {
          setIsPlanModalOpen(false);
          fetchPlanDetails();
        }} 
      />
    </div>
  );
};

export default SubscriptionSettings;
