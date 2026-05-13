import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import AuthInput from '@/components/ui/AuthInput';
import CommonButton from '@/components/ui/CommonButton';
import { FcGoogle } from 'react-icons/fc';

const Register = () => {
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors } } = useForm();

  const onSubmit = (data) => {
    console.log("Register Data:", data);
    navigate('/onboarding');
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
            error={errors.firstName}
            required
          />
          <AuthInput
            label="Last Name"
            name="lastName"
            placeholder="Enter your last name"
            register={register}
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
          error={errors.email}
          required
        />
        <AuthInput
          label="Password"
          type="password"
          name="password"
          placeholder="Enter your password"
          register={register}
          error={errors.password}
          required
        />
        <AuthInput
          label="Confirm Password"
          type="password"
          name="confirmPassword"
          placeholder="Re-enter your password"
          register={register}
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
              I agree with the <Link to="/terms" className="text-Primary font-bold hover:underline">terms and conditions</Link>
            </label>
            {errors.terms && <span className="text-[10px] text-red-500 font-medium">{errors.terms.message}</span>}
          </div>
        </div>

        <CommonButton
          type="submit"
          className="w-full py-4 bg-Primary text-white font-bold rounded-xl hover:bg-Primary/90 shadow-lg shadow-Primary/20 mb-4"
        >
          Sign Up
        </CommonButton>

        <button
          type="button"
          className="w-full py-4 bg-white border border-[#E6E6E6] text-[#1A1A1A] font-bold rounded-xl hover:bg-gray-50 flex items-center justify-center gap-3 transition-all"
        >
          <FcGoogle className="w-6 h-6" />
          Continue with Google
        </button>
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
