import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";

import { setUser as setReduxUser } from "../../redux/slices/authSlice";
import useAxiosSecure from "../../hooks/useAxiosSecure";
import { USER } from "../apiEndPoint";

/**
 * useUserProfile — Fetch authenticated user's profile
 * Auto-syncs with Redux on successful fetch
 */
export const useUserProfile = () => {
  const dispatch = useDispatch();
  const axiosSecure = useAxiosSecure();

  const query = useQuery({
    queryKey: ["userProfile"],
    queryFn: async () => {
      const res = await axiosSecure.get(USER.GET_ME);
      const userData = res.data?.data || res.data;
      dispatch(setReduxUser(userData));
      return userData;
    },
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });

  return {
    user: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
};

/**
 * useUpdateProfile — Update user profile (firstName, lastName, avatar, servicesOffered, brandLogos)
 * Supports multipart/form-data for file uploads
 */
export const useUpdateProfile = () => {
  const queryClient = useQueryClient();
  const axiosSecure = useAxiosSecure();

  return useMutation({
    mutationFn: async (formData) => {
      const isFormData = formData instanceof FormData;
      const res = await axiosSecure.patch(USER.UPDATE, formData, {
        headers: isFormData
          ? { "Content-Type": "multipart/form-data" }
          : { "Content-Type": "application/json" },
      });
      return res.data;
    },
    onSuccess: (data) => {
      toast.success(data?.message || "Profile updated successfully!");
      queryClient.invalidateQueries({ queryKey: ["userProfile"] });
    },
    onError: (error) => {
      const msg = error?.response?.data?.message || error.message || "Failed to update profile";
      toast.error(msg);
    },
  });
};

/**
 * useCompleteOnboarding — Complete user onboarding
 * Sends displayName, shortBio, socialLinks, and avatar
 */
export const useCompleteOnboarding = () => {
  const queryClient = useQueryClient();
  const axiosSecure = useAxiosSecure();

  return useMutation({
    mutationFn: async (formData) => {
      const isFormData = formData instanceof FormData;
      const res = await axiosSecure.put(USER.ONBOARDING, formData, {
        headers: isFormData
          ? { "Content-Type": "multipart/form-data" }
          : { "Content-Type": "application/json" },
      });
      return res.data;
    },
    onSuccess: (data) => {
      toast.success(data?.message || "Onboarding completed successfully!");
      queryClient.invalidateQueries({ queryKey: ["userProfile"] });
    },
    onError: (error) => {
      const msg = error?.response?.data?.message || error.message || "Onboarding failed";
      toast.error(msg);
    },
  });
};

/**
 * useDeleteBrandLogo — Delete a brand logo by file path
 */
export const useDeleteBrandLogo = () => {
  const queryClient = useQueryClient();
  const axiosSecure = useAxiosSecure();

  return useMutation({
    mutationFn: async (filePath) => {
      const res = await axiosSecure.delete(USER.DELETE_BRAND_LOGO, {
        data: { filePath },
      });
      return res.data;
    },
    onSuccess: (data) => {
      toast.success(data?.message || "Brand logo deleted!");
      queryClient.invalidateQueries({ queryKey: ["userProfile"] });
    },
    onError: (error) => {
      const msg = error?.response?.data?.message || error.message || "Failed to delete brand logo";
      toast.error(msg);
    },
  });
};

/**
 * useChangePassword — Change user password
 */
export const useChangePassword = () => {
  const axiosSecure = useAxiosSecure();

  return useMutation({
    mutationFn: async ({ oldPassword, newPassword }) => {
      const res = await axiosSecure.patch(USER.CHANGE_PASSWORD, { oldPassword, newPassword });
      return res.data;
    },
    onSuccess: (data) => {
      toast.success(data?.message || "Password changed successfully!");
    },
    onError: (error) => {
      const msg = error?.response?.data?.message || error.message || "Failed to change password";
      toast.error(msg);
    },
  });
};
