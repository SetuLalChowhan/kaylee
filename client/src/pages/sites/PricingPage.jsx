import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Crown, Check, Loader2, ArrowLeft, Heart } from 'lucide-react';
import useSEO from '@/hooks/useSEO';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { selectIsAuthenticated } from '@/redux/slices/authSlice';
import useAxiosSecure from '@/hooks/useAxiosSecure';
import Swal from 'sweetalert2';

const PricingPage = () => {
  useSEO({
    title: "Pricing Plans | STAKD - Creator Workspace",
    description: "View STAKD subscription plans tailored for creators. Discover our workspace options to easily manage campaigns, content, approvals, and invoices.",
    keywords: "stakd pricing, creator workspace pricing, campaign manager cost, influencer tools price"
  });

  const navigate = useNavigate();
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const axiosSecure = useAxiosSecure();

  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [checkoutLoadingId, setCheckoutLoadingId] = useState(null);
  const [billingTab, setBillingTab] = useState("monthly");

  const fallbackPlans = [
    {
      title: "FREE",
      price: 0,
      description: "Explore the platform with basic features.",
      buttonText: "Start Free Trial",
      campaignLimit: 1,
      billingCycle: "monthly",
      isRecommended: false,
      isDark: false,
      features: [
        "1 active campaign limit",
        "Limited brand review links",
        "Watermarked content previews",
        "Basic campaign planner"
      ]
    },
    {
      title: "FOUNDING MEMBER",
      price: 19.99,
      description: "Special introductory subscription rate for the first 200 users.",
      buttonText: "Join as Founding Member",
      campaignLimit: 999999,
      billingCycle: "monthly",
      isRecommended: true,
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
      price: 199.99,
      description: "Annual introductory subscription rate for founding members.",
      buttonText: "Join as Founding Member (Yearly)",
      campaignLimit: 999999,
      billingCycle: "yearly",
      priceSuffix: "/ yearly",
      isRecommended: false,
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
    const fetchPlans = async () => {
      try {
        const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3000/api";
        const res = await axios.get(`${apiUrl}/plans`);
        if (res.data?.status === "success" && res.data?.data?.length > 0) {
          const parsed = res.data.data.map(p => ({
            ...p,
            features: typeof p.features === 'string' ? JSON.parse(p.features) : p.features,
            recommended: p.isRecommended,
            period: p.priceSuffix ? p.priceSuffix.replace("/", "").trim() : "monthly"
          }));
          setPlans(parsed);
        }
      } catch (err) {
        console.error("Failed to fetch plans, falling back to static lists:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPlans();
  }, []);

  const handleCheckout = async (plan) => {
    if (!isAuthenticated) {
      Swal.fire({
        title: "Please Login",
        text: "You need to log in to choose a subscription plan.",
        icon: "info",
        confirmButtonText: "Login",
        confirmButtonColor: "#005BD6",
        showCancelButton: true,
        cancelButtonText: "Cancel",
      }).then((result) => {
        if (result.isConfirmed) {
          navigate('/login');
        }
      });
      return;
    }

    setCheckoutLoadingId(plan.id || plan.title);
    try {
      const res = await axiosSecure.post('/subscriptions/checkout', { planId: plan.id });
      if (res.data?.url) {
        window.location.href = res.data.url;
      }
    } catch (err) {
      console.error("Checkout session creation failed:", err);
      Swal.fire({
        title: "Checkout Failed",
        text: err.response?.data?.message || "Failed to initiate payment session. Please try again.",
        icon: "error",
        confirmButtonText: "OK",
        confirmButtonColor: "#005BD6"
      });
    } finally {
      setCheckoutLoadingId(null);
    }
  };

  const displayPlans = plans.length > 0 ? plans : fallbackPlans;
  const filteredDisplayPlans = displayPlans.filter((p) => {
    const cycle = (p.billingCycle || "monthly").toLowerCase();
    const isFree = p.price === 0 || p.slug === "free" || p.title.toUpperCase() === "FREE";
    if (isFree) return true;
    return cycle === billingTab;
  });

  return (
    <div className="min-h-screen bg-slate-50/50 pt-28 pb-20 px-4 sm:px-6 lg:px-8 font-urbanist relative overflow-hidden flex flex-col justify-between">
      
      {/* Decorative Orbs */}
      <div className="absolute top-[-20%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-Primary/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40vw] h-[40vw] rounded-full bg-indigo-500/5 blur-[100px] pointer-events-none" />

      {/* Header / Navbar */}
      <header className="absolute top-0 left-0 right-0 py-5 px-6 md:px-12 flex items-center justify-between border-b border-slate-100 bg-white/40 backdrop-blur-md z-50">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
          <span className="text-2xl font-black tracking-tight text-gray-900">
            STAKD<span className="text-Primary">.</span>
          </span>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/')} 
            className="flex items-center gap-1.5 text-sm font-bold text-gray-500 hover:text-Primary transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" /> Home
          </button>
          {isAuthenticated ? (
            <button 
              onClick={() => navigate('/dashboard')}
              className="bg-gray-950 text-white hover:bg-gray-900 px-5 py-2.5 rounded-xl text-sm font-bold transition-all cursor-pointer shadow-sm"
            >
              Go to Dashboard
            </button>
          ) : (
            <button 
              onClick={() => navigate('/login')}
              className="bg-Primary text-white hover:bg-Primary/90 px-5 py-2.5 rounded-xl text-sm font-bold transition-all cursor-pointer shadow-md shadow-Primary/10"
            >
              Sign In
            </button>
          )}
        </div>
      </header>

      {/* Content Container */}
      <div className="max-w-7xl mx-auto w-full flex-grow flex flex-col justify-center">
        
        {/* Intro */}
        <div className="text-center max-w-3xl mx-auto mb-12 mt-8">
          <div className="inline-flex items-center gap-1.5 bg-Primary/10 text-Primary px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider mb-4">
            <Crown className="w-3.5 h-3.5" /> Subscription Plans
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-gray-900 tracking-tight leading-none mb-4">
            Simple, Transparent Pricing
          </h1>
          <p className="text-gray-500 text-sm sm:text-base font-semibold max-w-xl mx-auto leading-relaxed">
            All prices are processed in AUD. Unlock powerful creator tools and streamline your brand partnerships today.
          </p>

          {/* Billing Tab Switcher */}
          <div className="flex items-center justify-center gap-2 mt-6 bg-slate-100 p-1.5 rounded-2xl w-fit mx-auto border border-slate-200/60 shadow-inner">
            <button
              type="button"
              onClick={() => setBillingTab("monthly")}
              className={`px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                billingTab === "monthly"
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-500 hover:text-gray-900"
              }`}
            >
              Monthly Billing
            </button>
            <button
              type="button"
              onClick={() => setBillingTab("yearly")}
              className={`px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                billingTab === "yearly"
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-500 hover:text-gray-900"
              }`}
            >
              Yearly Billing
            </button>
          </div>
        </div>

        {/* Pricing Cards Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-10 h-10 text-Primary animate-spin" />
          </div>
        ) : filteredDisplayPlans.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto w-full px-2">
            {filteredDisplayPlans.map((plan, index) => {
              const isDark = plan.isDark;
              const isRecommended = plan.recommended || plan.isRecommended;
              const isFoundingMember = plan.title.toUpperCase() === "FOUNDING MEMBER";
              const isSoldOut = isFoundingMember && plan.usersCount >= 200;
              const isCheckingOut = checkoutLoadingId === (plan.id || plan.title);

              return (
                <div 
                  key={plan.id || index}
                  className={`relative p-8 sm:p-10 rounded-[32px] border transition-all duration-500 flex flex-col h-full hover:translate-y-[-4px] ${
                    isDark 
                      ? 'bg-gray-950 border-gray-900 text-white shadow-2xl shadow-slate-900/10' 
                      : 'bg-white border-slate-100/90 text-gray-900 shadow-sm shadow-slate-100/50'
                  } ${isRecommended && !isDark && !isSoldOut ? 'border-Primary ring-2 ring-Primary/10' : ''} ${isSoldOut ? 'border-red-200' : ''}`}
                >
                  {isRecommended && !isSoldOut && (
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-Primary text-white text-[10px] font-bold px-4 py-1.5 rounded-full uppercase tracking-wider z-20 shadow-lg shadow-Primary/35">
                      Most Popular
                    </div>
                  )}

                  {isSoldOut && (
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-red-500 text-white text-[10px] font-bold px-4 py-1.5 rounded-full uppercase tracking-wider z-20 shadow-lg shadow-red-500/35">
                      Sold Out
                    </div>
                  )}

                  <div className="mb-8">
                    <h3 className={`text-xs font-bold tracking-widest uppercase mb-3 ${isDark ? 'text-gray-400' : 'text-gray-405'}`}>
                      {plan.title}
                    </h3>
                    <div className="flex items-baseline gap-1 mb-4">
                      <span className="text-4xl sm:text-5xl font-black tracking-tight">${plan.price}</span>
                      <span className={`text-xs font-bold uppercase tracking-wider ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                        {plan.price > 0 ? (plan.priceSuffix || '/ monthly') : ''}
                      </span>
                    </div>
                    <p className={`text-xs font-medium leading-relaxed ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                      {isSoldOut ? "Sold out! Reached the 200 member limit." : plan.description}
                    </p>
                  </div>

                  <div className={`w-full h-[1px] my-6 ${isDark ? 'bg-white/10' : 'bg-slate-100'}`} />

                  {/* Features */}
                  <div className="flex-1 space-y-4 mb-8">
                    <ul className="space-y-4">
                      {plan.features.map((feature, idx) => (
                        <li key={idx} className="flex items-start gap-3">
                          <div className={`flex-shrink-0 w-4 h-4 rounded-full flex items-center justify-center mt-0.5 ${
                            isDark ? 'bg-white text-gray-950' : 'bg-gray-900 text-white'
                          }`}>
                            <Check className="w-2.5 h-2.5 stroke-[3.5px]" />
                          </div>
                          <span className={`text-xs sm:text-sm font-semibold ${isDark ? 'text-gray-300' : 'text-gray-650'}`}>
                            {feature}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <button
                    onClick={() => !isSoldOut && handleCheckout(plan)}
                    disabled={isCheckingOut || isSoldOut}
                    className={`w-full py-4 rounded-2xl font-bold text-xs sm:text-sm transition-all cursor-pointer text-center flex items-center justify-center gap-2 ${
                      isSoldOut
                        ? 'bg-slate-100 border border-slate-200 text-slate-400 cursor-not-allowed shadow-none'
                        : isDark 
                          ? 'bg-white text-gray-950 hover:bg-gray-100 shadow-sm' 
                          : 'bg-Primary text-white hover:bg-Primary/95 shadow-md shadow-Primary/25'
                    } ${isCheckingOut ? 'opacity-70 cursor-not-allowed' : ''}`}
                  >
                    {isCheckingOut && <Loader2 className="w-4 h-4 animate-spin" />}
                    {isSoldOut ? "Sold Out" : plan.buttonText || "Choose Plan"}
                  </button>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12 max-w-md mx-auto p-8 rounded-3xl bg-white/70 backdrop-blur-xl border border-[#E6E6E6] flex flex-col items-center">
            <h3 className="text-lg font-bold text-[#1A1A1A] mb-2">No plans available for {billingTab} billing</h3>
            <p className="text-[#666] text-sm">Please check back later or switch tabs.</p>
          </div>
        )}

        {/* Policy Notice Footer */}
        <div className="mt-16 text-center text-xs text-gray-400 font-semibold max-w-sm mx-auto leading-relaxed">
          By subscribing, you agree to our{' '}
          <span 
            onClick={() => navigate('/subscription-billing-policy')} 
            className="text-Primary hover:underline cursor-pointer font-bold"
          >
            Subscription & Billing Policy
          </span>.
        </div>
      </div>
    </div>
  );
};

export default PricingPage;
