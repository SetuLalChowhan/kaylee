import React, { useState, useEffect } from 'react';
import { X, Check, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import useAxiosSecure from '@/hooks/useAxiosSecure';
import axios from 'axios';
import Swal from 'sweetalert2';

const PlanCard = ({ title, price, period, description, features, recommended, buttonText, isDark, onSelect, loading, usersCount }) => {
  const isFoundingMember = title.toUpperCase() === "FOUNDING MEMBER";
  const isSoldOut = isFoundingMember && usersCount >= 200;

  return (
    <div className={`relative flex-1 p-6 sm:p-8 rounded-[32px] border flex flex-col h-full shadow-sm ${
      isDark ? 'bg-[#0A0A0A] border-[#1A1A1A] text-white' : 'bg-white border-gray-100 text-[#1A1A1A]'
    } ${isSoldOut ? 'border-red-200' : ''}`}>
      {recommended && !isSoldOut && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-Primary text-white text-[10px] font-bold px-4 py-1.5 rounded-full uppercase tracking-wider z-20 shadow-lg shadow-Primary/30">
          Recommended
        </div>
      )}
      {isSoldOut && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-red-500 text-white text-[10px] font-bold px-4 py-1.5 rounded-full uppercase tracking-wider z-20 shadow-lg shadow-red-500/30 animate-pulse">
          Sold Out
        </div>
      )}
      
      <div className="mb-6">
        <h3 className={`text-sm font-bold uppercase tracking-tight mb-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{title}</h3>
        <div className="flex items-baseline gap-1">
          <span className="text-4xl font-bold">${price}</span>
          {period && <span className={`text-sm font-medium ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>/{period}</span>}
        </div>
        <p className={`text-xs mt-3 font-medium leading-relaxed ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
          {isSoldOut ? "Sold out! Reached the 200 member limit." : description}
        </p>
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

      <button 
        onClick={() => !isSoldOut && onSelect()}
        disabled={loading || isSoldOut}
        className={`w-full py-4 rounded-2xl font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${
          isSoldOut
            ? 'bg-slate-100 border border-slate-200 text-slate-400 cursor-not-allowed shadow-none'
            : isDark 
              ? 'bg-white text-black hover:bg-gray-100' 
              : 'bg-Primary text-white hover:bg-Primary/90 shadow-lg shadow-Primary/10'
        } ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
      >
        {loading && <Loader2 className="w-4 h-4 animate-spin" />}
        {isSoldOut ? "Sold Out" : buttonText}
      </button>
    </div>
  );
};

const PlanModal = ({ isOpen, onClose }) => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [checkoutLoadingId, setCheckoutLoadingId] = useState(null);
  const [billingTab, setBillingTab] = useState("monthly");
  const axiosSecure = useAxiosSecure();

  const fallbackPlans = [
    {
      title: "FREE",
      price: "0",
      description: "Explore the platform with basic features.",
      buttonText: "Start Free Trial",
      billingCycle: "monthly",
      features: [
        "1 active campaign limit",
        "Limited brand review links",
        "Watermarked content previews",
        "Basic campaign planner"
      ]
    },
    {
      title: "FOUNDING MEMBER",
      price: "19.99",
      period: "monthly",
      description: "Special introductory subscription rate for the first 200 users.",
      buttonText: "Join as Founding Member",
      billingCycle: "monthly",
      recommended: true,
      isDark: true,
      features: [
        "Unlimited active campaigns",
        "Unlimited brand review links",
        "Full approval & feedback system",
        "No STAKD branding on deliveries",
        "Priority support"
      ]
    },
    {
      title: "FOUNDING MEMBER YEARLY",
      price: "199.99",
      period: "yearly",
      description: "Annual introductory subscription rate for founding members.",
      buttonText: "Join as Founding Member (Yearly)",
      billingCycle: "yearly",
      recommended: false,
      isDark: false,
      features: [
        "Unlimited active campaigns",
        "Unlimited brand review links",
        "Full approval & feedback system",
        "No STAKD branding on deliveries",
        "Priority support"
      ]
    }
  ];

  useEffect(() => {
    if (!isOpen) return;

    const fetchPlans = async () => {
      try {
        const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3000/api";
        const res = await axios.get(`${apiUrl}/plans`);
        if (res.data?.status === "success" && res.data?.data?.length > 0) {
          const parsed = res.data.data.map(p => ({
            ...p,
            features: typeof p.features === 'string' ? JSON.parse(p.features) : p.features,
            recommended: p.isRecommended,
            period: p.priceSuffix ? p.priceSuffix.replace("/", "").trim() : ""
          }));
          setPlans(parsed);
        }
      } catch (err) {
        console.error("Failed to fetch plans:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPlans();
  }, [isOpen]);

  const handleCheckout = async (plan) => {
    setCheckoutLoadingId(plan.id || plan.title);
    try {
      const res = await axiosSecure.post('/subscriptions/checkout', { planId: plan.id });
      if (res.data?.url) {
        if (plan.price === 0) {
          window.location.href = res.data.url;
        } else {
          window.open(res.data.url, '_blank');
        }
      }
    } catch (err) {
      console.error("Checkout session creation failed:", err);
      Swal.fire({
        title: "Subscription Notice",
        text: err.response?.data?.message || "Failed to initiate payment session. Please try again.",
        icon: "info",
        confirmButtonText: "OK",
        confirmButtonColor: "#005BD6"
      });
    } finally {
      setCheckoutLoadingId(null);
    }
  };

  if (!isOpen) return null;

  const displayPlans = plans.length > 0 ? plans : fallbackPlans;
  const filteredDisplayPlans = displayPlans.filter((p) => {
    const cycle = (p.billingCycle || "monthly").toLowerCase();
    const isFree = Number(p.price) === 0 || p.slug === "free" || p.title.toUpperCase() === "FREE";
    if (isFree) return true;
    return cycle === billingTab;
  });

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
          className="relative w-full max-w-5xl bg-white rounded-3xl md:rounded-[40px] shadow-2xl p-6 md:p-10 max-h-[90vh] overflow-y-auto custom-scrollbar"
        >
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 md:top-8 md:right-8 p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400 border border-gray-100 z-30 bg-white"
          >
            <X className="w-5 h-5 md:w-6 md:h-6" />
          </button>

          <div className="mb-6 md:mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-[#1A1A1A] font-outfit">Select Plan</h2>
              <p className="text-xs text-gray-400 font-medium mt-1">Choose a subscription tier to scale your workspace.</p>
            </div>

            {/* Billing Tab Switcher */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200/60 shadow-inner shrink-0">
              <button
                type="button"
                onClick={() => setBillingTab("monthly")}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  billingTab === "monthly"
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-500 hover:text-gray-900"
                }`}
              >
                Monthly
              </button>
              <button
                type="button"
                onClick={() => setBillingTab("yearly")}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  billingTab === "yearly"
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-500 hover:text-gray-900"
                }`}
              >
                Yearly
              </button>
            </div>
          </div>
          <div className="w-full border-b border-dashed border-gray-100 mb-6 md:mb-8" />

          {loading ? (
            <div className="py-20 flex items-center justify-center">
              <Loader2 className="w-8 h-8 text-Primary animate-spin" />
            </div>
          ) : filteredDisplayPlans.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10 font-outfit">
              {filteredDisplayPlans.map((plan, index) => (
                <PlanCard 
                  key={plan.id || index}
                  {...plan}
                  loading={checkoutLoadingId === (plan.id || plan.title)}
                  onSelect={() => handleCheckout(plan)}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 max-w-md mx-auto p-8 rounded-3xl bg-slate-50 border border-slate-100 flex flex-col items-center">
              <h3 className="text-base font-bold text-[#1A1A1A] mb-1">No plans available for {billingTab} billing</h3>
              <p className="text-gray-400 text-xs">Switch to {billingTab === "monthly" ? "yearly" : "monthly"} billing to view active plans.</p>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default PlanModal;
