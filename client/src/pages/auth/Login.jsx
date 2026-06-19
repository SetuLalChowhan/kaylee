import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import AuthInput from '@/components/ui/AuthInput';
import CommonButton from '@/components/ui/CommonButton';
import { FcGoogle } from 'react-icons/fc';
import { toast } from 'react-toastify';
import { useLogin } from '@/api/apiHooks/useAuth';

const Login = () => {
  const navigate = useNavigate();
  const loginMutation = useLogin();

  const { register, handleSubmit, formState: { errors } } = useForm();

  const onSubmit = (data) => {
    loginMutation.mutate({ email: data.email, password: data.password });
  };

  const handleGoogleLogin = () => {
    // Google login will be handled via @react-oauth/google or custom flow
    // For now, show a message
    toast.info("Google login integration coming soon!");
  };

  return (
    <div className="w-full">
      <div className="mb-10">
        <h2 className="text-[28px] lg:text-[32px] font-bold text-[#1A1A1A] mb-2">Welcome back</h2>
        <p className="text-[#666] text-sm lg:text-base">Sign in to your creator workspace.</p>
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
        <AuthInput 
          label="Password"
          type="password"
          name="password"
          placeholder="Enter your password"
          register={register}
          error={errors.password}
          required
        />

        <div className="flex justify-end mb-8">
          <Link to="/forgot-password" size="sm" className="text-sm font-bold text-[#1A1A1A] hover:text-Primary transition-colors">
            Forgot Password?
          </Link>
        </div>

        <CommonButton 
          type="submit"
          disabled={loginMutation.isPending}
          className="w-full py-4 bg-Primary text-white font-bold rounded-xl hover:bg-Primary/90 shadow-lg shadow-Primary/20 mb-4 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loginMutation.isPending ? "Signing in..." : "Sign In"}
        </CommonButton>

        <button 
          type="button"
          onClick={handleGoogleLogin}
          className="w-full py-4 bg-white border border-[#E6E6E6] text-[#1A1A1A] font-bold rounded-xl hover:bg-gray-50 flex items-center justify-center gap-3 transition-all"
        >
          <FcGoogle className="w-6 h-6" />
          Continue with Google
        </button>
      </form>

      <p className="text-center text-sm text-[#666]">
        Don't have an account?{' '}
        <Link to="/signup" className="font-bold text-Primary hover:underline">
          Sign Up
        </Link>
      </p>
    </div>
  );
};

export default Login;
