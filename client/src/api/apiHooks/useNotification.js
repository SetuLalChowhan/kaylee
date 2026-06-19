import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { useDispatch } from "react-redux";
import useAxiosSecure from "../../hooks/useAxiosSecure";

export const useNotifications = () => {
  const axiosSecure = useAxiosSecure();

  return useQuery({
    queryKey: ["notifications"],
    queryFn: async () => {
      const res = await axiosSecure.get("/notifications");
      return res.data?.data || [];
    },
    refetchInterval: 10000, // Poll notifications every 10 seconds for real-time feel
  });
};

export const useMarkAsSeen = () => {
  const queryClient = useQueryClient();
  const axiosSecure = useAxiosSecure();

  return useMutation({
    mutationFn: async (id) => {
      const res = await axiosSecure.patch(`/notifications/${id}/seen`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
};

export const useMarkAllAsSeen = () => {
  const queryClient = useQueryClient();
  const axiosSecure = useAxiosSecure();

  return useMutation({
    mutationFn: async () => {
      const res = await axiosSecure.patch("/notifications/seen-all");
      return res.data;
    },
    onSuccess: (data) => {
      toast.success(data?.message || "All notifications marked as seen");
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
    onError: (error) => {
      const msg = error?.response?.data?.message || error.message || "Failed to mark seen";
      toast.error(msg);
    },
  });
};

export const useDeleteNotification = () => {
  const queryClient = useQueryClient();
  const axiosSecure = useAxiosSecure();

  return useMutation({
    mutationFn: async (id) => {
      const res = await axiosSecure.delete(`/notifications/${id}`);
      return res.data;
    },
    onSuccess: (data) => {
      toast.success(data?.message || "Notification deleted");
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
    onError: (error) => {
      const msg = error?.response?.data?.message || error.message || "Failed to delete notification";
      toast.error(msg);
    },
  });
};

export const useUpdateNotificationSettings = () => {
  const queryClient = useQueryClient();
  const axiosSecure = useAxiosSecure();

  return useMutation({
    mutationFn: async (settings) => {
      const res = await axiosSecure.patch("/user/notification-settings", settings);
      return res.data;
    },
    onSuccess: (data) => {
      toast.success("Notification preferences updated!");
      queryClient.invalidateQueries({ queryKey: ["userProfile"] });
    },
    onError: (error) => {
      const msg = error?.response?.data?.message || error.message || "Failed to update preferences";
      toast.error(msg);
    },
  });
};
