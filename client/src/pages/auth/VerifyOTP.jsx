import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import CommonButton from '@/components/ui/CommonButton';
import { useVerifyEmail, useVerifyResetOtp, useResendOtp } from '@/api/apiHooks/useAuth';

const OTP_LENGTH = 6;

const VerifyOTP = () => {
  const [otp, setOtp] = useState(Array(OTP_LENGTH).fill(''));
  const [manualEmail, setManualEmail] = useState('');
  const inputRefs = useRef([]);
  const location = useLocation();
  const navigate = useNavigate();

  const emailFromState = location.state?.email || '';
  const otpType = location.state?.type || 'VERIFICATION';
  const [countdown, setCountdown] = useState(emailFromState ? 25 : 0);

  const verifyEmailMutation = useVerifyEmail();
  const verifyResetOtpMutation = useVerifyResetOtp();
  const resendOtpMutation = useResendOtp();

  const effectiveEmail = emailFromState || manualEmail;

  // Countdown timer for resend
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  // ── Paste handler ───────────────────────────────────────────────────────────
  // When the user pastes anywhere in the OTP area, distribute digits into all boxes.
  const handlePaste = useCallback((e) => {
    const pasted = e.clipboardData?.getData('text') || '';
    const digits = pasted.replace(/\D/g, '').split('').slice(0, OTP_LENGTH);
    if (digits.length > 0) {
      e.preventDefault();
      const newOtp = [...Array(OTP_LENGTH).fill('')];
      digits.forEach((d, i) => {
        newOtp[i] = d;
      });
      setOtp(newOtp);
      // Focus the next empty box (or last box if all filled)
      const nextIndex = Math.min(digits.length, OTP_LENGTH - 1);
      inputRefs.current[nextIndex]?.focus();
    }
  }, []);

  // ── Single digit change ─────────────────────────────────────────────────────
  const handleChange = (index, value) => {
    if (value.length > 1) value = value.slice(-1);
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const otpString = otp.join('');
    if (otpString.length !== OTP_LENGTH || !effectiveEmail) return;

    if (otpType === 'FORGOT_PASSWORD') {
      verifyResetOtpMutation.mutate({ email: effectiveEmail, otp: otpString });
    } else {
      verifyEmailMutation.mutate({ email: effectiveEmail, otp: otpString });
    }
  };

  const handleResend = () => {
    if (countdown > 0 || !effectiveEmail) return;
    resendOtpMutation.mutate({ email: effectiveEmail, type: otpType });
    setCountdown(25);
    setOtp(Array(OTP_LENGTH).fill(''));
    inputRefs.current[0]?.focus();
  };

  const needsEmail = !emailFromState && !manualEmail;
  const isPending = verifyEmailMutation.isPending || verifyResetOtpMutation.isPending;
  const isComplete = otp.join('').length === OTP_LENGTH;

  return (
    <div className="w-full">
      <div className="mb-10">
        <h2 className="text-[28px] lg:text-[32px] font-bold text-[#1A1A1A] mb-2">Verification code</h2>
        <p className="text-[#666] text-sm lg:text-base leading-relaxed">
          {needsEmail
            ? 'Enter your email to receive the verification code'
            : otpType === 'FORGOT_PASSWORD'
            ? 'We sent a password reset code to your email'
            : 'We sent a verification code to your email, check your email'}
        </p>
      </div>

      <form className="mb-6" onSubmit={handleSubmit}>
        {!emailFromState && (
          <div className="mb-6">
            <label className="block text-[#1A1A1A] text-sm font-semibold mb-2">
              Email <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              value={manualEmail}
              onChange={(e) => setManualEmail(e.target.value)}
              placeholder="Enter your email"
              className="w-full px-4 py-3.5 bg-white border border-[#E6E6E6] rounded-xl text-sm focus:outline-none focus:border-Primary transition-all"
            />
          </div>
        )}

        {/* OTP Inputs */}
        <div className="flex justify-center gap-2 sm:gap-3 mb-10" onPaste={handlePaste}>
          {otp.map((digit, index) => (
            <input
              key={index}
              ref={(el) => (inputRefs.current[index] = el)}
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              className="w-12 sm:w-14 h-14 sm:h-16 text-center text-xl sm:text-2xl font-bold border border-[#E6E6E6] rounded-xl sm:rounded-2xl focus:border-Primary focus:ring-1 focus:ring-Primary/20 focus:outline-none transition-all"
            />
          ))}
        </div>

        <CommonButton 
          type="submit"
          disabled={isPending || !isComplete || (needsEmail && !manualEmail)}
          className="w-full py-4 bg-Primary text-white font-bold rounded-xl hover:bg-Primary/90 shadow-lg shadow-Primary/20 mb-6 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isPending ? "Verifying..." : "Next"}
        </CommonButton>

        <div className="text-center text-sm">
          <span className="text-[#666]">Don't receive the code? </span>
          <button 
            type="button" 
            onClick={handleResend}
            disabled={countdown > 0 || resendOtpMutation.isPending || !effectiveEmail}
            className="text-Primary font-bold hover:underline disabled:text-gray-400 disabled:cursor-not-allowed"
          >
            {resendOtpMutation.isPending ? "Sending..." : (emailFromState ? "Resend" : "Send OTP")}
          </button>
          {countdown > 0 && (
            <span className="text-[#666]"> in {countdown} second{countdown !== 1 ? 's' : ''}</span>
          )}
        </div>
      </form>
    </div>
  );
};

export default VerifyOTP;
