import React from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import AuthInput from '@/components/ui/AuthInput';
import CommonButton from '@/components/ui/CommonButton';
import { useForgotPassword } from '@/api/apiHooks/useAuth';
import { Mail } from 'lucide-react';

const ForgotPassword = () => {
  const forgotPasswordMutation = useForgotPassword();
  const { register, handleSubmit, formState: { errors } } = useForm();

  const onSubmit = (data) => {
    forgotPasswordMutation.mutate({ email: data.email });
  };

  if (forgotPasswordMutation.isSuccess) {
    return (
      <div className="w-full text-center py-6">
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 bg-Primary/10 text-Primary rounded-full flex items-center justify-center animate-pulse">
            <Mail className="w-8 h-8" />
          </div>
        </div>
        <h2 className="text-[28px] lg:text-[32px] font-bold text-[#1A1A1A] mb-2 font-outfit">Check your email</h2>
        <p className="text-[#666] text-sm lg:text-base mb-8 leading-relaxed font-outfit">
          We've sent a secure password reset link to your email address. Please check your inbox and click the link to reset your password.
        </p>
        <div className="text-center">
          <Link to="/login" className="text-sm font-bold text-Primary hover:underline font-outfit">
            Back to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="mb-10">
        <h2 className="text-[28px] lg:text-[32px] font-bold text-[#1A1A1A] mb-2">Forgot Password</h2>
        <p className="text-[#666] text-sm lg:text-base">Enter your email to receive password reset instructions</p>
      </div>

      <form className="mb-6" onSubmit={handleSubmit(onSubmit)}>
        <AuthInput 
          label="Email"
          type="email"
          name="email"
          placeholder="Enter your email"
          register={register}
          error={errors.email}
          required
        />

        <div className="mt-10">
          <CommonButton 
            type="submit"
            disabled={forgotPasswordMutation.isPending}
            className="w-full py-4 bg-Primary text-white font-bold rounded-xl hover:bg-Primary/90 shadow-lg shadow-Primary/20 mb-4 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {forgotPasswordMutation.isPending ? "Sending..." : "Next"}
          </CommonButton>
        </div>
      </form>

      <div className="text-center">
        <Link to="/login" className="text-sm font-bold text-Primary hover:underline">
          Back to Login
        </Link>
      </div>
    </div>
  );
};

export default ForgotPassword;
