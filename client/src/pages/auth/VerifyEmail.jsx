import React, { useEffect, useState } from 'react';
import { useSearchParams, useLocation, useNavigate, Link } from 'react-router-dom';
import { CheckCircle2, XCircle, Mail, Loader2, ArrowRight } from 'lucide-react';
import { useVerifyEmailToken, useResendVerificationLink } from '@/api/apiHooks/useAuth';
import CommonButton from '@/components/ui/CommonButton';

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();
  const token = searchParams.get('token');

  const verifyMutation = useVerifyEmailToken();
  const resendMutation = useResendVerificationLink();

  const [emailInput, setEmailInput] = useState(location.state?.email || '');
  const [isResent, setIsResent] = useState(false);
  const verifyTriggered = React.useRef(false);

  // Auto-verify if token is in URL
  useEffect(() => {
    if (token && !verifyTriggered.current) {
      verifyTriggered.current = true;
      verifyMutation.mutate({ token });
    }
  }, [token]);

  const handleResend = (e) => {
    e.preventDefault();
    if (!emailInput.trim()) return;

    resendMutation.mutate({ email: emailInput }, {
      onSuccess: () => {
        setIsResent(true);
      }
    });
  };

  // 1. Loading State (Verifying Token)
  if (token && verifyMutation.isPending) {
    return (
      <div className="w-full max-w-md mx-auto text-center py-10">
        <div className="flex justify-center mb-6">
          <Loader2 className="w-16 h-16 text-Primary animate-spin" />
        </div>
        <h2 className="text-2xl font-bold text-[#1A1A1A] mb-2">Verifying your email</h2>
        <p className="text-gray-500 text-sm">
          Please wait while we verify your secure verification link...
        </p>
      </div>
    );
  }

  // 2. Success State (Verified Token)
  if (token && verifyMutation.isSuccess) {
    return (
      <div className="w-full max-w-md mx-auto text-center py-10">
        <div className="flex justify-center mb-6">
          <CheckCircle2 className="w-16 h-16 text-green-500" />
        </div>
        <h2 className="text-2xl font-bold text-[#1A1A1A] mb-2">Account Verified!</h2>
        <p className="text-gray-500 text-sm mb-8">
          Your email address has been verified successfully. Welcome to STAKD!
        </p>
        <CommonButton
          onClick={() => navigate('/onboarding')}
          className="w-full py-4 bg-Primary text-white font-bold rounded-xl hover:bg-Primary/90 shadow-lg shadow-Primary/20 flex items-center justify-center gap-2"
        >
          Proceed to Onboarding
          <ArrowRight className="w-4 h-4" />
        </CommonButton>
      </div>
    );
  }

  // 3. Error State (Verification Failed)
  if (token && verifyMutation.isError) {
    return (
      <div className="w-full max-w-md mx-auto py-10">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-6">
            <XCircle className="w-16 h-16 text-red-500" />
          </div>
          <h2 className="text-2xl font-bold text-[#1A1A1A] mb-2">Verification Failed</h2>
          <p className="text-gray-500 text-sm">
            This verification link is invalid, expired, or has already been used.
          </p>
        </div>

        <div className="bg-slate-50 border border-slate-100 rounded-3xl p-6 shadow-sm">
          <h3 className="text-sm font-bold text-slate-800 mb-2">Need a new link?</h3>
          <p className="text-xs text-slate-400 mb-4">
            Enter your email address below and we'll send you a new secure verification link.
          </p>
          <form onSubmit={handleResend} className="space-y-4">
            <input
              type="email"
              required
              value={emailInput}
              onChange={(e) => setEmailInput(e.target.value)}
              placeholder="Enter your registered email"
              className="w-full px-4 py-3.5 bg-white border border-[#E6E6E6] rounded-xl text-sm focus:outline-none focus:border-Primary transition-all text-[#1A1A1A]"
            />
            <CommonButton
              type="submit"
              disabled={resendMutation.isPending}
              className="w-full py-3.5 bg-Primary text-white font-bold rounded-xl hover:bg-Primary/90 shadow-sm"
            >
              {resendMutation.isPending ? "Sending link..." : "Send Verification Link"}
            </CommonButton>
          </form>
          {isResent && (
            <p className="text-[11px] text-green-600 font-bold mt-3 text-center">
              New verification link sent! Please check your inbox.
            </p>
          )}
        </div>

        <div className="mt-8 text-center">
          <Link to="/login" className="text-xs font-bold text-Primary hover:underline">
            Back to Login
          </Link>
        </div>
      </div>
    );
  }

  // 4. Default / Pending Inbox check instructions (Link Sent State)
  return (
    <div className="w-full max-w-md mx-auto py-10">
      <div className="text-center mb-8">
        <div className="flex justify-center mb-6">
          <Mail className="w-16 h-16 text-Primary" />
        </div>
        <h2 className="text-2xl font-bold text-[#1A1A1A] mb-2">Check your email</h2>
        <p className="text-gray-500 text-sm leading-relaxed">
          We've sent a secure verification link to {emailInput ? <strong className="text-slate-800">{emailInput}</strong> : "your email address"}. Please check your inbox and click the link to verify your account.
        </p>
      </div>

      <div className="bg-slate-50 border border-slate-100 rounded-3xl p-6 shadow-sm">
        <h3 className="text-sm font-bold text-slate-800 mb-2 font-outfit">Didn't receive it?</h3>
        <p className="text-xs text-slate-400 mb-4 font-outfit">
          Check your spam folder or request a new verification link below.
        </p>
        <form onSubmit={handleResend} className="space-y-4">
          <input
            type="email"
            required
            value={emailInput}
            onChange={(e) => setEmailInput(e.target.value)}
            placeholder="Enter your registered email"
            className="w-full px-4 py-3.5 bg-white border border-[#E6E6E6] rounded-xl text-sm focus:outline-none focus:border-Primary transition-all text-[#1A1A1A]"
          />
          <CommonButton
            type="submit"
            disabled={resendMutation.isPending}
            className="w-full py-3.5 bg-Primary text-white font-bold rounded-xl hover:bg-Primary/90 shadow-sm"
          >
            {resendMutation.isPending ? "Sending link..." : "Send Verification Link"}
          </CommonButton>
        </form>
        {isResent && (
          <p className="text-[11px] text-green-600 font-bold mt-3 text-center">
            New verification link sent! Please check your inbox.
          </p>
        )}
      </div>

      <div className="mt-8 text-center">
        <Link to="/login" className="text-xs font-bold text-Primary hover:underline">
          Back to Login
        </Link>
      </div>
    </div>
  );
};

export default VerifyEmail;
