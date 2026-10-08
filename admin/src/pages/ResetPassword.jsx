import React, { useEffect } from "react";
import { Link, useNavigate, useSearchParams, useLocation } from "react-router-dom";
import { useForm } from "react-hook-form";
import useMutationClient from "@/hooks/useMutationClient";
import { motion } from "motion/react";
import { Lock, ArrowLeft, Loader2, CheckCircle2 } from "lucide-react";

const ResetPassword = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const resetToken = location.state?.resetToken;

  const { register, handleSubmit, watch, formState: { errors } } = useForm();
  const newPassword = watch("newPassword");

  const { mutate, isPending, isSuccess } = useMutationClient({
    url: "/auth/reset-password",
    method: "post",
    successMessage: "Password reset successfully. You can now sign in.",
  });

  const onSubmit = (data) => {
    mutate({
      data: {
        token,
        resetToken,
        newPassword: data.newPassword,
        confirmPassword: data.confirmPassword,
      },
    });
  };

  const hasAccess = !!(token || resetToken);

  useEffect(() => {
    if (!hasAccess) {
      navigate("/forgot-password");
    }
  }, [hasAccess, navigate]);

  if (!hasAccess) return null;

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
              Password Reset Complete
            </h2>
            <p className="text-xs text-slate-500 mb-8 leading-relaxed">
              Your administrator account password has been updated securely. You can now log in with your new password.
            </p>
            <Link
              to="/"
              className="inline-flex items-center justify-center gap-2 w-full py-3.5 bg-[#005BD6] text-white text-sm font-bold rounded-xl hover:bg-[#005BD6]/90 transition-all shadow-lg shadow-[#005BD6]/20"
            >
              <span>Sign In to Admin Portal</span>
            </Link>
          </div>
        ) : (
          <>
            <div className="text-center mb-8">
              <h2 className="text-2xl md:text-3xl font-extrabold text-slate-800 tracking-tight">
                Reset Password
              </h2>
              <p className="text-xs md:text-sm text-slate-500 mt-2">
                Set a strong password for your administrator account
              </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  New Password
                </label>
                <div className="relative">
                  <input
                    {...register("newPassword", {
                      required: "New password is required",
                      minLength: {
                        value: 6,
                        message: "Password must be at least 6 characters",
                      },
                    })}
                    type="password"
                    placeholder="••••••••"
                    className={`w-full bg-slate-50 border rounded-xl py-3 px-4 pl-11 focus:outline-none focus:ring-2 focus:ring-[#005BD6]/20 focus:border-[#005BD6] transition-all text-sm text-slate-800 ${
                      errors.newPassword ? "border-red-500" : "border-slate-200"
                    }`}
                  />
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                </div>
                {errors.newPassword && (
                  <p className="text-xs text-red-500 font-semibold mt-1">
                    {errors.newPassword.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    {...register("confirmPassword", {
                      required: "Please confirm your password",
                      validate: (val) =>
                        val === newPassword || "Passwords do not match",
                    })}
                    type="password"
                    placeholder="••••••••"
                    className={`w-full bg-slate-50 border rounded-xl py-3 px-4 pl-11 focus:outline-none focus:ring-2 focus:ring-[#005BD6]/20 focus:border-[#005BD6] transition-all text-sm text-slate-800 ${
                      errors.confirmPassword ? "border-red-500" : "border-slate-200"
                    }`}
                  />
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                </div>
                {errors.confirmPassword && (
                  <p className="text-xs text-red-500 font-semibold mt-1">
                    {errors.confirmPassword.message}
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
                  "Update Password"
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

export default ResetPassword;
