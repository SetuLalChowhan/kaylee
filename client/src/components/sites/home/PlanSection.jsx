import React from 'react';
import { SectionHeader, Subtext, Label } from '@/components/ui/Typography';
import PricingCard from './cards/PricingCard';

const PlanSection = () => {
  const plans = [
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

  return (
    <section id="pricing" className="section-padding bg-white overflow-hidden">
      <div className="">
        {/* Header Content */}
        <div className="flex flex-col items-center text-center max-w-4xl mx-auto mb-16 lg:mb-24">
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
          {plans.map((plan, index) => (
            <PricingCard
              key={index}
              index={index}
              {...plan}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default PlanSection;
