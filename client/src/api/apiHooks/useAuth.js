import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

import { setCredentials, clearAuth } from "../../redux/slices/authSlice";
import useAxiosPublic from "../../hooks/useAxiosPublic";
import useAxiosSecure from "../../hooks/useAxiosSecure";
import { AUTH } from "../apiEndPoint";

/**
 * useRegister — Register a new user
 * On success, stores userId in Redux uiSlice for OTP verification
 */
export const useRegister = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const axiosPublic = useAxiosPublic();

  return useMutation({
    mutationFn: async (formData) => {
      const res = await axiosPublic.post(AUTH.REGISTER, formData);
      return res.data;
    },
    onSuccess: (data, variables) => {
      toast.success(data?.message || "Registration successful! Check your email for OTP.");
      navigate("/verify-otp", { state: { email: variables.email } });
    },
    onError: (error) => {
      const msg = error?.response?.data?.message || error.message || "Registration failed";
      toast.error(msg);
    },
  });
};

/**
 * useVerifyEmail — Verify email with OTP
 * On success, navigates to onboarding to complete the profile.
 */
export const useVerifyEmail = () => {
  const axiosPublic = useAxiosPublic();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: async ({ email, otp }) => {
      const res = await axiosPublic.post(AUTH.VERIFY_EMAIL, { email, otp });
      return res.data;
    },
    onSuccess: (data) => {
      toast.success(data?.message || "Email verified successfully!");
      navigate("/onboarding");
    },
    onError: (error) => {
      const msg = error?.response?.data?.message || error.message || "Verification failed";
      toast.error(msg);
    },
  });
};

/**
 * useLogin — Login user
 * On success, stores token + user in Redux and redirects to dashboard
 */
export const useLogin = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const axiosPublic = useAxiosPublic();

  return useMutation({
    mutationFn: async (formData) => {
      const res = await axiosPublic.post(AUTH.LOGIN, formData);
      return res.data;
    },
    onSuccess: (data) => {
      dispatch(setCredentials({ token: data.accessToken, user: data.user }));
      toast.success(data?.message || "Login successful!");
      navigate("/dashboard");
    },
    onError: (error) => {
      const msg = error?.response?.data?.message || error.message || "Login failed";
      toast.error(msg);
    },
  });
};

/**
 * useGoogleLogin — Login with Google
 */
export const useGoogleLogin = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const axiosPublic = useAxiosPublic();

  return useMutation({
    mutationFn: async (idToken) => {
      const res = await axiosPublic.post(AUTH.GOOGLE_LOGIN, { idToken });
      return res.data;
    },
    onSuccess: (data) => {
      dispatch(setCredentials({ token: data.accessToken, user: data.user }));
      toast.success(data?.message || "Google login successful!");
      navigate("/dashboard");
    },
    onError: (error) => {
      const msg = error?.response?.data?.message || error.message || "Google login failed";
      toast.error(msg);
    },
  });
};

/**
 * useForgotPassword — Request password reset OTP
 */
export const useForgotPassword = () => {
  const axiosPublic = useAxiosPublic();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: async ({ email }) => {
      const res = await axiosPublic.post(AUTH.FORGOT_PASSWORD, { email });
      return res.data;
    },
    onSuccess: (data, variables) => {
      toast.success(data?.message || "Reset OTP sent to your email.");
      navigate("/verify-otp", { state: { email: variables.email, type: "FORGOT_PASSWORD" } });
    },
    onError: (error) => {
      const msg = error?.response?.data?.message || error.message || "Failed to send OTP";
      toast.error(msg);
    },
  });
};

/**
 * useVerifyResetOtp — Verify OTP for password reset
 * On success, stores resetToken in state for the next step
 */
export const useVerifyResetOtp = () => {
  const axiosPublic = useAxiosPublic();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: async ({ email, otp }) => {
      const res = await axiosPublic.post(AUTH.VERIFY_RESET_OTP, { email, otp });
      return res.data;
    },
    onSuccess: (data) => {
      toast.success(data?.message || "OTP verified!");
      navigate("/reset-password", { state: { resetToken: data.resetToken } });
    },
    onError: (error) => {
      const msg = error?.response?.data?.message || error.message || "OTP verification failed";
      toast.error(msg);
    },
  });
};

/**
 * useResendOtp — Resend OTP
 */
export const useResendOtp = () => {
  const axiosPublic = useAxiosPublic();

  return useMutation({
    mutationFn: async ({ email, type = "VERIFICATION" }) => {
      const res = await axiosPublic.post(AUTH.RESEND_OTP, { email, type });
      return res.data;
    },
    onSuccess: (data) => {
      toast.success(data?.message || "OTP resent successfully!");
    },
    onError: (error) => {
      const msg = error?.response?.data?.message || error.message || "Failed to resend OTP";
      toast.error(msg);
    },
  });
};

/**
 * useResetPassword — Reset password with resetToken
 */
export const useResetPassword = () => {
  const axiosPublic = useAxiosPublic();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: async ({ resetToken, newPassword }) => {
      const res = await axiosPublic.post(AUTH.RESET_PASSWORD, { resetToken, newPassword });
      return res.data;
    },
    onSuccess: (data) => {
      toast.success(data?.message || "Password reset successful!");
      navigate("/login");
    },
    onError: (error) => {
      const msg = error?.response?.data?.message || error.message || "Password reset failed";
      toast.error(msg);
    },
  });
};

/**
 * useLogout — Logout user
 */
export const useLogout = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const axiosSecure = useAxiosSecure();

  return useMutation({
    mutationFn: async () => {
      const res = await axiosSecure.post(AUTH.LOGOUT);
      return res.data;
    },
    onSuccess: () => {
      dispatch(clearAuth());
      toast.success("Logged out successfully!");
      navigate("/");
    },
    onError: () => {
      // Even if the API call fails, clear local auth state
      dispatch(clearAuth());
      navigate("/");
    },
  });
};
