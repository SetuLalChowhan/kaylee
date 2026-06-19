import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import axios from "axios";
import useAxiosSecure from "../../hooks/useAxiosSecure";
import { USER } from "../apiEndPoint";

/**
 * usePortfolioItems — Fetch authenticated user's portfolio items
 */
export const usePortfolioItems = () => {
  const axiosSecure = useAxiosSecure();

  return useQuery({
    queryKey: ["portfolioItems"],
    queryFn: async () => {
      const res = await axiosSecure.get(USER.PORTFOLIO);
      return res.data?.data || [];
    },
    staleTime: 5 * 60 * 1000,
  });
};

/**
 * useCreatePortfolioItem — Create a new portfolio item (multipart/form-data)
 */
export const useCreatePortfolioItem = () => {
  const queryClient = useQueryClient();
  const axiosSecure = useAxiosSecure();

  return useMutation({
    mutationFn: async (formData) => {
      const res = await axiosSecure.post(USER.PORTFOLIO, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return res.data;
    },
    onSuccess: (data) => {
      toast.success(data?.message || "Portfolio item uploaded!");
      queryClient.invalidateQueries({ queryKey: ["portfolioItems"] });
    },
    onError: (error) => {
      const msg = error?.response?.data?.message || error.message || "Failed to upload portfolio item";
      toast.error(msg);
    },
  });
};

/**
 * useUpdatePortfolioItem — Update a portfolio item's title and/or media
 */
export const useUpdatePortfolioItem = () => {
  const queryClient = useQueryClient();
  const axiosSecure = useAxiosSecure();

  return useMutation({
    mutationFn: async ({ id, formData }) => {
      const res = await axiosSecure.patch(`${USER.PORTFOLIO}/${id}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return res.data;
    },
    onSuccess: (data) => {
      toast.success(data?.message || "Portfolio item updated!");
      queryClient.invalidateQueries({ queryKey: ["portfolioItems"] });
    },
    onError: (error) => {
      const msg = error?.response?.data?.message || error.message || "Failed to update portfolio item";
      toast.error(msg);
    },
  });
};

/**
 * useDeletePortfolioItem — Delete a portfolio item
 */
export const useDeletePortfolioItem = () => {
  const queryClient = useQueryClient();
  const axiosSecure = useAxiosSecure();

  return useMutation({
    mutationFn: async (id) => {
      const res = await axiosSecure.delete(`${USER.PORTFOLIO}/${id}`);
      return res.data;
    },
    onSuccess: (data) => {
      toast.success(data?.message || "Portfolio item deleted!");
      queryClient.invalidateQueries({ queryKey: ["portfolioItems"] });
    },
    onError: (error) => {
      const msg = error?.response?.data?.message || error.message || "Failed to delete portfolio item";
      toast.error(msg);
    },
  });
};

/**
 * usePublicPortfolio — Fetch a user's profile and portfolio items by their displayName/slug
 */
export const usePublicPortfolio = (slug) => {
  return useQuery({
    queryKey: ["publicPortfolio", slug],
    queryFn: async () => {
      if (!slug) return null;
      const res = await axios.get(`${USER.PORTFOLIO_PREVIEW}/${slug}`);
      return res.data?.data || null;
    },
    enabled: !!slug,
    staleTime: 5 * 60 * 1000,
  });
};
