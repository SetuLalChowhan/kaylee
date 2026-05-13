import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import CommonButton from '@/components/ui/CommonButton';

const VerifyOTP = () => {
  const [otp, setOtp] = useState(['', '', '', '']);
  const inputRefs = useRef([]);
  const navigate = useNavigate();

  const handleChange = (index, value) => {
    if (value.length > 1) value = value.slice(-1);
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 3) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  return (
    <div className="w-full">
      <div className="mb-10">
        <h2 className="text-[28px] lg:text-[32px] font-bold text-[#1A1A1A] mb-2">Verification code</h2>
        <p className="text-[#666] text-sm lg:text-base leading-relaxed">
          We sent a verification code to your email, check your email
        </p>
      </div>

      <form className="mb-6" onSubmit={(e) => { e.preventDefault(); navigate('/reset-password'); }}>
        <div className="flex justify-between gap-4 mb-10">
          {otp.map((digit, index) => (
            <input
              key={index}
              ref={(el) => (inputRefs.current[index] = el)}
              type="text"
              value={digit}
              onChange={(e) => handleChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              className="w-full h-16 text-center text-2xl font-bold border border-[#E6E6E6] rounded-2xl focus:border-Primary focus:ring-1 focus:ring-Primary/20 focus:outline-none transition-all"
            />
          ))}
        </div>

        <CommonButton 
          type="submit"
          className="w-full py-4 bg-Primary text-white font-bold rounded-xl hover:bg-Primary/90 shadow-lg shadow-Primary/20 mb-6"
        >
          Next
        </CommonButton>

        <div className="text-center text-sm">
          <span className="text-[#666]">Don't receive the code? </span>
          <button type="button" className="text-Primary font-bold hover:underline">
            Resend
          </button>
          <span className="text-[#666]"> in 25 second</span>
        </div>
      </form>
    </div>
  );
};

export default VerifyOTP;
