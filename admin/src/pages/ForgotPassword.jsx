import React from "react";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import useMutationClient from "@/hooks/useMutationClient";
import { motion } from "motion/react";
import { Mail, ArrowLeft, Loader2, CheckCircle2 } from "lucide-react";

const ForgotPassword = () => {
  const { register, handleSubmit, formState: { errors } } = useForm();

  const { mutate, isPending, isSuccess } = useMutationClient({
    url: "/auth/forgot-password",
    method: "post",
    successMessage: "Password reset link sent to your email",
  });

  const onSubmit = (data) => {
    mutate({ data: { email: data.email } });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-radial from-[#F8FAFC] to-[#E2E8F0] p-6 font-outfit">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md bg-white/85 backdrop-blur-md rounded-3xl p-8 md:p-10 shadow-2xl border border-white/60"
      >
        {isSuccess ? (
          <div className="text-center py-4">
            <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-5 shadow-inner">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-bold text-slate-800 tracking-tight mb-2">
              Check your email
            </h2>
            <p className="text-xs text-slate-500 mb-8 leading-relaxed">
              We've sent a secure password reset link to your email address. Please check your inbox and click the link to reset your administrator password.
            </p>
            <Link
              to="/"
              className="inline-flex items-center justify-center gap-2 w-full py-3 bg-[#005BD6] text-white text-sm font-bold rounded-xl hover:bg-[#005BD6]/90 transition-all shadow-md shadow-[#005BD6]/20"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Sign In</span>
            </Link>
          </div>
        ) : (
          <>
            <div className="text-center mb-8">
              <h2 className="text-2xl md:text-3xl font-extrabold text-slate-800 tracking-tight">
                Forgot Password
              </h2>
              <p className="text-xs md:text-sm text-slate-500 mt-2">
                Enter your admin email to receive reset instructions
              </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Admin Email Address
                </label>
                <div className="relative">
                  <input
                    {...register("email", {
                      required: "Email is required",
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: "Invalid email address",
                      },
                    })}
                    type="email"
                    placeholder="admin@kaylee.com"
                    className={`w-full bg-slate-50 border rounded-xl py-3 px-4 pl-11 focus:outline-none focus:ring-2 focus:ring-[#005BD6]/20 focus:border-[#005BD6] transition-all text-sm text-slate-800 ${
                      errors.email ? "border-red-500" : "border-slate-200"
                    }`}
                  />
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                </div>
                {errors.email && (
                  <p className="text-xs text-red-500 font-semibold mt-1">
                    {errors.email.message}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={isPending}
                className="w-full bg-[#005BD6] hover:bg-[#005BD6]/90 text-white py-3.5 rounded-xl font-bold transition-all shadow-lg shadow-[#005BD6]/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isPending ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  "Send Reset Link"
                )}
              </button>

              <div className="text-center pt-2">
                <Link
                  to="/"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-[#005BD6] hover:underline"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back to Sign In</span>
                </Link>
              </div>
            </form>
          </>
        )}
      </motion.div>
    </div>
  );
};

export default ForgotPassword;
