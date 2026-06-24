import React from 'react';
import { useNavigate } from 'react-router-dom';
import { PackageOpen } from 'lucide-react';

const PricingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen relative flex items-center justify-center bg-radial from-[#F9FAFB] to-[#F3F4F6] px-4">
      {/* Skip Button */}
      <button 
        onClick={() => navigate('/')}
        className="absolute top-10 right-10 lg:right-[170px] z-50 text-[#1A1A1A] font-bold hover:text-Primary transition-colors cursor-pointer"
      >
        Skip
      </button>

      <div className="max-w-md w-full text-center p-8 lg:p-12 rounded-3xl bg-white/70 backdrop-blur-xl border border-[#E6E6E6] shadow-2xl shadow-gray-200/50 flex flex-col items-center">
        <div className="w-16 h-16 rounded-2xl bg-Primary/10 flex items-center justify-center text-Primary mb-6">
          <PackageOpen className="w-8 h-8" />
        </div>
        <h2 className="text-2xl lg:text-3xl font-bold text-[#1A1A1A] mb-3">No plans right now available</h2>
        <p className="text-[#666] text-sm lg:text-base mb-8 leading-relaxed">
          We are currently updating our subscription plans to bring you the best creator workspace experience. Please check back later or proceed to the app.
        </p>
        <button 
          onClick={() => navigate('/')}
          className="w-full py-4 bg-Primary text-white font-bold rounded-xl hover:bg-Primary/90 shadow-lg shadow-Primary/20 transition-all cursor-pointer"
        >
          Go to Homepage
        </button>
      </div>
    </div>
  );
};

export default PricingPage;
