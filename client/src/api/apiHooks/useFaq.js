import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import useAxiosPublic from "../../hooks/useAxiosPublic";
import useAxiosSecure from "../../hooks/useAxiosSecure";

export const useFaqs = () => {
  const axiosPublic = useAxiosPublic();

  return useQuery({
    queryKey: ["faqs"],
    queryFn: async () => {
      const res = await axiosPublic.get("/faq");
      return res.data?.data || [];
    },
  });
};

export const useCreateFaq = () => {
  const queryClient = useQueryClient();
  const axiosSecure = useAxiosSecure();

  return useMutation({
    mutationFn: async (faqData) => {
      const res = await axiosSecure.post("/faq", faqData);
      return res.data;
    },
    onSuccess: (data) => {
      toast.success(data?.message || "FAQ created successfully!");
      queryClient.invalidateQueries({ queryKey: ["faqs"] });
    },
    onError: (error) => {
      const msg = error?.response?.data?.message || error.message || "Failed to create FAQ";
      toast.error(msg);
    },
  });
};

export const useUpdateFaq = () => {
  const queryClient = useQueryClient();
  const axiosSecure = useAxiosSecure();

  return useMutation({
    mutationFn: async ({ id, faqData }) => {
      const res = await axiosSecure.put(`/faq/${id}`, faqData);
      return res.data;
    },
    onSuccess: (data) => {
      toast.success(data?.message || "FAQ updated successfully!");
      queryClient.invalidateQueries({ queryKey: ["faqs"] });
    },
    onError: (error) => {
      const msg = error?.response?.data?.message || error.message || "Failed to update FAQ";
      toast.error(msg);
    },
  });
};

export const useDeleteFaq = () => {
  const queryClient = useQueryClient();
  const axiosSecure = useAxiosSecure();

  return useMutation({
    mutationFn: async (id) => {
      const res = await axiosSecure.delete(`/faq/${id}`);
      return res.data;
    },
    onSuccess: (data) => {
      toast.success(data?.message || "FAQ deleted successfully!");
      queryClient.invalidateQueries({ queryKey: ["faqs"] });
    },
    onError: (error) => {
      const msg = error?.response?.data?.message || error.message || "Failed to delete FAQ";
      toast.error(msg);
    },
  });
};
