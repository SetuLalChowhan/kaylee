import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import useAxiosSecure from "../../hooks/useAxiosSecure";
import { USER } from "../apiEndPoint";

/**
 * useInvoices — Fetch authenticated user's invoices with optional status filter
 */
export const useInvoices = (status) => {
  const axiosSecure = useAxiosSecure();

  return useQuery({
    queryKey: ["invoices", status],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (status && status !== "All") {
        params.append("status", status);
      }
      params.append("includeStats", "true");
      const res = await axiosSecure.get(`${USER.INVOICE}?${params.toString()}`);
      return res.data?.data || { invoices: [], stats: {} };
    },
    staleTime: 5 * 60 * 1000,
  });
};

/**
 * useCreateInvoice — Create a new invoice
 */
export const useCreateInvoice = () => {
  const queryClient = useQueryClient();
  const axiosSecure = useAxiosSecure();

  return useMutation({
    mutationFn: async (invoiceData) => {
      const res = await axiosSecure.post(USER.INVOICE, invoiceData);
      return res.data;
    },
    onSuccess: (data) => {
      toast.success(data?.message || "Invoice created successfully!");
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
      queryClient.invalidateQueries({ queryKey: ["dashboardStats"] });
      queryClient.invalidateQueries({ queryKey: ["ugcCampaigns"] });
      queryClient.invalidateQueries({ queryKey: ["ugcCampaign"] });
      queryClient.invalidateQueries({ queryKey: ["campaigns"] });
    },
    onError: (error) => {
      const msg = error?.response?.data?.message || error.message || "Failed to create invoice";
      toast.error(msg);
    },
  });
};

/**
 * useUpdateInvoice — Update an existing invoice
 */
export const useUpdateInvoice = () => {
  const queryClient = useQueryClient();
  const axiosSecure = useAxiosSecure();

  return useMutation({
    mutationFn: async ({ id, invoiceData }) => {
      const res = await axiosSecure.patch(`${USER.INVOICE}/${id}`, invoiceData);
      return res.data;
    },
    onSuccess: (data) => {
      toast.success(data?.message || "Invoice updated successfully!");
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
      queryClient.invalidateQueries({ queryKey: ["dashboardStats"] });
      queryClient.invalidateQueries({ queryKey: ["ugcCampaigns"] });
      queryClient.invalidateQueries({ queryKey: ["ugcCampaign"] });
      queryClient.invalidateQueries({ queryKey: ["campaigns"] });
    },
    onError: (error) => {
      const msg = error?.response?.data?.message || error.message || "Failed to update invoice";
      toast.error(msg);
    },
  });
};

/**
 * useDeleteInvoice — Delete an invoice
 */
export const useDeleteInvoice = () => {
  const queryClient = useQueryClient();
  const axiosSecure = useAxiosSecure();

  return useMutation({
    mutationFn: async (id) => {
      const res = await axiosSecure.delete(`${USER.INVOICE}/${id}`);
      return res.data;
    },
    onSuccess: (data) => {
      toast.success(data?.message || "Invoice deleted successfully!");
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
      queryClient.invalidateQueries({ queryKey: ["dashboardStats"] });
      queryClient.invalidateQueries({ queryKey: ["ugcCampaigns"] });
      queryClient.invalidateQueries({ queryKey: ["ugcCampaign"] });
      queryClient.invalidateQueries({ queryKey: ["campaigns"] });
    },
    onError: (error) => {
      const msg = error?.response?.data?.message || error.message || "Failed to delete invoice";
      toast.error(msg);
    },
  });
};
