import React from "react";
import { useForm } from "react-hook-form";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { setToken } from "@/redux/slices/authSlice";
import { setUser } from "@/redux/slices/uiSlice";
import useMutationClient from "@/hooks/useMutationClient";
import { motion } from "motion/react";
import { Lock, Mail, Loader2 } from "lucide-react";

const Login = () => {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { mutate, isPending } = useMutationClient({
    url: "/auth/login",
    method: "post",
    successMessage: "Login Successful",
  });

  const onSubmit = (data) => {
    mutate(
      { data },
      {
        onSuccess: (res) => {
          const accessToken = res.data?.accessToken;
          const user = res.data?.user;
          if (accessToken) {
            dispatch(setToken({ token: accessToken }));
          }
          if (user) {
            dispatch(setUser({ user }));
          }
          navigate("/dashboard");
        },
      }
    );
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-radial from-[#F8FAFC] to-[#E2E8F0] p-6 font-outfit">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md bg-white/80 backdrop-blur-md rounded-3xl p-8 md:p-10 shadow-2xl border border-white/50"
      >
        <div className="text-center mb-8">
          <h2 className="text-3xl font-extrabold text-slate-800 tracking-tight">Admin Portal</h2>
          <p className="text-sm text-slate-500 mt-2">Sign in to manage your system</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Email Address</label>
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
                  errors.email ? "border-red-500" : "border-slate-100"
                }`}
              />
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            </div>
            {errors.email && (
              <p className="text-xs text-red-500 font-semibold mt-1">{errors.email.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Password</label>
            <div className="relative">
              <input
                {...register("password", { required: "Password is required" })}
                type="password"
                placeholder="••••••••"
                className={`w-full bg-slate-50 border rounded-xl py-3 px-4 pl-11 focus:outline-none focus:ring-2 focus:ring-[#005BD6]/20 focus:border-[#005BD6] transition-all text-sm text-slate-800 ${
                  errors.password ? "border-red-500" : "border-slate-100"
                }`}
              />
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            </div>
            {errors.password && (
              <p className="text-xs text-red-500 font-semibold mt-1">{errors.password.message}</p>
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
              "Sign In"
            )}
          </button>
        </form>
      </motion.div>
    </div>
  );
};

export default Login;
