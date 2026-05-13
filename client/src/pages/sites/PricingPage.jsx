import React from 'react';
import { useNavigate } from 'react-router-dom';
import PlanSection from '@/components/sites/home/PlanSection';

const PricingPage = () => {
  const navigate = useNavigate();

  return (
    <div className=" min-h-screen relative">
      {/* Skip Button */}
      <button 
        onClick={() => navigate('/')}
        className="absolute top-10 right-10 lg:right-[170px] z-50 text-[#1A1A1A] font-bold hover:text-Primary transition-colors"
      >
        Skip
      </button>

      <div className="py-20">
        <PlanSection />
      </div>
    </div>
  );
};

export default PricingPage;
