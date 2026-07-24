import React, { useState, useEffect } from 'react';
import { SectionHeader, Subtext, Label } from '@/components/ui/Typography';
import PricingCard from './cards/PricingCard';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { selectIsAuthenticated } from '@/redux/slices/authSlice';
import useAxiosSecure from '@/hooks/useAxiosSecure';
import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import Swal from 'sweetalert2';

const PlanSection = () => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const axiosSecure = useAxiosSecure();
  const navigate = useNavigate();

  const [checkoutLoadingId, setCheckoutLoadingId] = useState(null);
  const [billingTab, setBillingTab] = useState("monthly");

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3000/api";
        const res = await axios.get(`${apiUrl}/plans`);
        if (res.data?.status === "success" && res.data?.data?.length > 0) {
          const parsed = res.data.data.map(p => ({
            ...p,
            features: typeof p.features === 'string' ? JSON.parse(p.features) : p.features
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

  if (loading) {
    return (
      <div className="py-20 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-Primary animate-spin" />
      </div>
    );
  }

  const displayedPlans = plans.filter((p) => {
    const cycle = (p.billingCycle || "monthly").toLowerCase();
    const isFree = p.price === 0 || p.slug === "free";
    if (isFree) return true;
    return cycle === billingTab;
  });

  return (
    <section id="pricing" className="section-padding bg-white overflow-hidden">
      <div className="">
        {/* Header Content */}
        <div className="flex flex-col items-center text-center max-w-4xl mx-auto mb-8 md:mb-10 font-outfit">
          <Label>Pricing</Label>
          <SectionHeader className="mb-4">
            Choose your plan
          </SectionHeader>
          <Subtext className="max-w-2xl mx-auto">
            Start for free and upgrade when you're ready
          </Subtext>

          {/* Billing Tab Switcher */}
          <div className="flex items-center justify-center gap-2 mt-6 bg-slate-100 p-1.5 rounded-2xl w-fit mx-auto border border-slate-200/60 shadow-inner">
            <button
              type="button"
              onClick={() => setBillingTab("monthly")}
              className={`px-6 py-2.5 rounded-xl text-xs md:text-sm font-bold transition-all cursor-pointer ${
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
              className={`px-6 py-2.5 rounded-xl text-xs md:text-sm font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                billingTab === "yearly"
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-500 hover:text-gray-900"
              }`}
            >
              Yearly Billing
            </button>
          </div>
        </div>

        {/* Pricing Cards Grid - 3 Columns */}
        {displayedPlans.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-8 max-w-[1300px] mx-auto">
            {displayedPlans.map((plan, index) => (
              <PricingCard
                key={plan.id || index}
                index={index}
                {...plan}
                loading={checkoutLoadingId === (plan.id || plan.title)}
                onSelect={() => handleCheckout(plan)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 max-w-md mx-auto p-8 rounded-3xl bg-white/70 backdrop-blur-xl border border-[#E6E6E6] flex flex-col items-center">
            <h3 className="text-lg font-bold text-[#1A1A1A] mb-2">No plans available for {billingTab} billing</h3>
            <p className="text-[#666] text-sm">Please check back later or switch tabs.</p>
          </div>
        )}
      </div>
    </section>
  );
};

export default PlanSection;
