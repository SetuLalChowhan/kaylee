import React from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import AuthInput from '@/components/ui/AuthInput';
import CommonButton from '@/components/ui/CommonButton';
import { useForgotPassword } from '@/api/apiHooks/useAuth';

const ForgotPassword = () => {
  const forgotPasswordMutation = useForgotPassword();
  const { register, handleSubmit, formState: { errors } } = useForm();

  const onSubmit = (data) => {
    forgotPasswordMutation.mutate({ email: data.email });
  };

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
