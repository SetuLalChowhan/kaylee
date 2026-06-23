import React, { useState, useEffect } from 'react';
import { SectionHeader, Subtext, Label } from '@/components/ui/Typography';
import PricingCard from './cards/PricingCard';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { selectIsAuthenticated } from '@/redux/slices/authSlice';
import useAxiosSecure from '@/hooks/useAxiosSecure';
import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

const PlanSection = () => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const axiosSecure = useAxiosSecure();
  const navigate = useNavigate();

  const [checkoutLoadingId, setCheckoutLoadingId] = useState(null);

  const fallbackPlans = [
    {
      title: "STATER",
      description: "Try STAKD risk-free for a short sprint.",
      price: 0,
      priceSuffix: "",
      features: [
        "Up to 2 active campaigns",
        "Limited brand review links",
        "Watermarked content previews",
        "Basic campaign planner",
      ],
      buttonText: "Start Free Trial",
      isRecommended: false,
      isDark: false,
    },
    {
      title: "PRO",
      description: "Built for creators working with brands regularly.",
      price: 24,
      priceSuffix: "/ monthly",
      features: [
        "Up to 20 active campaigns",
        "Unlimited brand review links",
        "Full approval & feedback system",
        "No STAKD branding on deliveries",
      ],
      buttonText: "Get Started with Pro",
      isRecommended: true,
      isDark: true,
    },
    {
      title: "GROWTH",
      description: "Scale your creator business and save more.",
      price: 100,
      priceSuffix: "/ yearly",
      features: [
        "Unlimited active campaigns",
        "Unlimited brand review links",
        "Priority support",
        "Best value pricing (save 20%)",
      ],
      buttonText: "Go Yearly & Save",
      isRecommended: false,
      isDark: false,
    },
  ];

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
      navigate('/signup');
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

  const displayPlans = plans.length > 0 ? plans : fallbackPlans;

  return (
    <section id="pricing" className="section-padding bg-white overflow-hidden">
      <div className="">
        {/* Header Content */}
        <div className="flex flex-col items-center text-center max-w-4xl mx-auto mb-10 lg:mb-24 font-outfit">
          <Label>Pricing</Label>
          <SectionHeader className="mb-4">
            Choose your plan
          </SectionHeader>
          <Subtext className="max-w-2xl mx-auto">
            Start for free and upgrade when you're ready
          </Subtext>
        </div>

        {/* Pricing Cards Grid - 3 Columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-8 max-w-[1300px] mx-auto">
          {displayPlans.map((plan, index) => (
            <PricingCard
              key={plan.id || index}
              index={index}
              {...plan}
              loading={checkoutLoadingId === (plan.id || plan.title)}
              onSelect={() => handleCheckout(plan)}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default PlanSection;
