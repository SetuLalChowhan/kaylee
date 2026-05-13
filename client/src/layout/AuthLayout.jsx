import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import AuthImage from "@/assets/images/authImage.png";

const AuthLayout = () => {
  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-white relative">
      {/* Go Home Button */}
      <Link
        to="/"
        className="absolute top-6 left-6 lg:left-auto lg:right-6 z-50 flex items-center gap-2 px-4 py-2 bg-white/10 lg:bg-gray-50 backdrop-blur-md rounded-full text-white lg:text-[#1A1A1A] text-sm font-bold hover:bg-white/20 lg:hover:bg-gray-100 transition-all border border-white/20 lg:border-gray-200 shadow-sm"
      >
        <ArrowLeft className="w-4 h-4" />
        Go Home
      </Link>

      {/* Left Side: Branding & Image */}
      <div className="lg:w-1/2 relative min-h-[400px] lg:min-h-screen overflow-hidden">
        <img
          src={AuthImage}
          alt="Auth Background"
          className="absolute inset-0 w-full h-full object-cover object-top"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-8 lg:p-20">
          <div className="max-w-xl">
            <h1 className="text-white text-[32px] lg:text-[48px] font-bold leading-tight mb-6">
              Manage every brand deal in one calm workspace.
            </h1>
            <p className="text-white/80 text-base lg:text-[18px] leading-relaxed">
              From pitch to payment - campaigns, deliverables, invoices and your portfolio, all stacked.
            </p>
          </div>
        </div>
      </div>

      {/* Right Side: Auth Forms */}
      <div className="lg:w-1/2 flex items-center justify-center p-6 lg:p-12 overflow-y-auto">
        <div className="w-full max-w-[700px]">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
