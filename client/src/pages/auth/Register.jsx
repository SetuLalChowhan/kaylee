import React from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import AuthInput from '@/components/ui/AuthInput';
import CommonButton from '@/components/ui/CommonButton';
import { FcGoogle } from 'react-icons/fc';
import { useRegister } from '@/api/apiHooks/useAuth';
import { PASSWORD_RULES, CONFIRM_PASSWORD_RULES, NAME_RULES, EMAIL_RULES } from '@/utils/validation';

const Register = () => {
  const registerMutation = useRegister();
  const { register, handleSubmit, watch, formState: { errors } } = useForm();

  const password = watch("password");

  const onSubmit = (data) => {
    const { terms, ...registerData } = data;
    registerMutation.mutate(registerData);
  };

  return (
    <div className="w-full">
      <div className="mb-8">
        <h2 className="text-[28px] lg:text-[32px] font-bold text-[#1A1A1A] mb-2">Create an account</h2>
        <p className="text-[#666] text-sm lg:text-base">Please create a workspace account to continue</p>
      </div>

      <form className="mb-6" onSubmit={handleSubmit(onSubmit)}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4">
          <AuthInput
            label="First Name"
            name="firstName"
            placeholder="Enter your first name"
            register={register}
            rules={NAME_RULES}
            error={errors.firstName}
            required
          />
          <AuthInput
            label="Last Name"
            name="lastName"
            placeholder="Enter your last name"
            register={register}
            rules={NAME_RULES}
            error={errors.lastName}
            required
          />
        </div>
        <AuthInput
          label="Email"
          type="email"
          name="email"
          placeholder="Enter your email"
          register={register}
          rules={EMAIL_RULES}
          error={errors.email}
          required
        />          <AuthInput
          label="Password"
          type="password"
          name="password"
          placeholder="Enter your password"
          register={register}
          rules={PASSWORD_RULES}
          error={errors.password}
          required
        />
        <AuthInput
          label="Confirm Password"
          type="password"
          name="confirmPassword"
          placeholder="Re-enter your password"
          register={register}
          rules={CONFIRM_PASSWORD_RULES(password)}
          error={errors.confirmPassword}
          required
        />

        <div className="flex items-start gap-2 mb-8">
          <input
            type="checkbox"
            id="terms"
            className="mt-1 accent-Primary cursor-pointer"
            {...register("terms", { required: "You must agree to the terms" })}
          />
          <div className="flex flex-col">
            <label htmlFor="terms" className="text-xs lg:text-sm text-[#666] leading-relaxed cursor-pointer">
              By creating an account, I acknowledge that I have read, understood, and agree to the{" "}
              <Link to="/founding-creator-agreement" target="_blank" rel="noopener noreferrer" className="text-Primary font-bold hover:underline">
                STAKD Founding Creator Agreement
              </Link>
              ,{" "}
              <Link to="/terms-of-service" target="_blank" rel="noopener noreferrer" className="text-Primary font-bold hover:underline">
                Terms of Service
              </Link>
              , and{" "}
              <Link to="/privacy-policy" target="_blank" rel="noopener noreferrer" className="text-Primary font-bold hover:underline">
                Privacy Policy
              </Link>
              .
            </label>
            {errors.terms && <span className="text-[10px] text-red-500 font-medium">{errors.terms.message}</span>}
          </div>
        </div>

        <CommonButton
          type="submit"
          disabled={registerMutation.isPending}
          className="w-full py-4 bg-Primary text-white font-bold rounded-xl hover:bg-Primary/90 shadow-lg shadow-Primary/20 mb-4 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {registerMutation.isPending ? "Creating account..." : "Sign Up"}
        </CommonButton>


      </form>

      <p className="text-center text-sm text-[#666]">
        Already have an account?{' '}
        <Link to="/login" className="font-bold text-Primary hover:underline">
          Sign In
        </Link>
      </p>
    </div>
  );
};

export default Register;
