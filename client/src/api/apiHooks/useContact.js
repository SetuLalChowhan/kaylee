import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import useAxiosPublic from "../../hooks/useAxiosPublic";
import useAxiosSecure from "../../hooks/useAxiosSecure";

export const useContacts = () => {
  const axiosSecure = useAxiosSecure();

  return useQuery({
    queryKey: ["contacts"],
    queryFn: async () => {
      const res = await axiosSecure.get("/contact");
      return res.data?.data || [];
    },
  });
};

export const useCreateContact = () => {
  const axiosPublic = useAxiosPublic();

  return useMutation({
    mutationFn: async (contactData) => {
      const res = await axiosPublic.post("/contact", contactData);
      return res.data;
    },
    onSuccess: (data) => {
      toast.success(data?.message || "Your message has been sent successfully!");
    },
    onError: (error) => {
      const msg = error?.response?.data?.message || error.message || "Failed to send message";
      toast.error(msg);
    },
  });
};

export const useUpdateContact = () => {
  const queryClient = useQueryClient();
  const axiosSecure = useAxiosSecure();

  return useMutation({
    mutationFn: async ({ id, contactData }) => {
      const res = await axiosSecure.put(`/contact/${id}`, contactData);
      return res.data;
    },
    onSuccess: (data) => {
      toast.success(data?.message || "Contact message updated successfully!");
      queryClient.invalidateQueries({ queryKey: ["contacts"] });
    },
    onError: (error) => {
      const msg = error?.response?.data?.message || error.message || "Failed to update message";
      toast.error(msg);
    },
  });
};

export const useDeleteContact = () => {
  const queryClient = useQueryClient();
  const axiosSecure = useAxiosSecure();

  return useMutation({
    mutationFn: async (id) => {
      const res = await axiosSecure.delete(`/contact/${id}`);
      return res.data;
    },
    onSuccess: (data) => {
      toast.success(data?.message || "Contact message deleted successfully!");
      queryClient.invalidateQueries({ queryKey: ["contacts"] });
    },
    onError: (error) => {
      const msg = error?.response?.data?.message || error.message || "Failed to delete message";
      toast.error(msg);
    },
  });
};
