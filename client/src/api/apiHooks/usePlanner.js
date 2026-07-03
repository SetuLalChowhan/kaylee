import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import useAxiosSecure from "../../hooks/useAxiosSecure";
import { USER } from "../apiEndPoint";

/**
 * useTasks — Fetch authenticated user's planner tasks
 */
export const useTasks = () => {
  const axiosSecure = useAxiosSecure();

  return useQuery({
    queryKey: ["tasks"],
    queryFn: async () => {
      const res = await axiosSecure.get(USER.PLANNER);
      return res.data?.data || [];
    },
    staleTime: 5 * 60 * 1000,
  });
};

/**
 * useCreateTask — Create a new task
 */
export const useCreateTask = () => {
  const queryClient = useQueryClient();
  const axiosSecure = useAxiosSecure();

  return useMutation({
    mutationFn: async (taskData) => {
      const res = await axiosSecure.post(USER.PLANNER, taskData);
      return res.data;
    },
    onSuccess: (data) => {
      toast.success(data?.message || "Task created successfully!");
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      queryClient.invalidateQueries({ queryKey: ["dashboardStats"] });
    },
    onError: (error) => {
      const msg = error?.response?.data?.message || error.message || "Failed to create task";
      toast.error(msg);
    },
  });
};

/**
 * useUpdateTask — Update an existing task
 */
export const useUpdateTask = () => {
  const queryClient = useQueryClient();
  const axiosSecure = useAxiosSecure();

  return useMutation({
    mutationFn: async ({ id, taskData }) => {
      const res = await axiosSecure.patch(`${USER.PLANNER}/${id}`, taskData);
      return res.data;
    },
    onSuccess: (data) => {
      toast.success(data?.message || "Task updated successfully!");
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      queryClient.invalidateQueries({ queryKey: ["dashboardStats"] });
      queryClient.invalidateQueries({ queryKey: ["ugcCampaigns"] });
      queryClient.invalidateQueries({ queryKey: ["ugcCampaign"] });
    },
    onError: (error) => {
      const msg = error?.response?.data?.message || error.message || "Failed to update task";
      toast.error(msg);
    },
  });
};

/**
 * useDeleteTask — Delete a task
 */
export const useDeleteTask = () => {
  const queryClient = useQueryClient();
  const axiosSecure = useAxiosSecure();

  return useMutation({
    mutationFn: async (id) => {
      const res = await axiosSecure.delete(`${USER.PLANNER}/${id}`);
      return res.data;
    },
    onSuccess: (data) => {
      toast.success(data?.message || "Task deleted successfully!");
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      queryClient.invalidateQueries({ queryKey: ["dashboardStats"] });
    },
    onError: (error) => {
      const msg = error?.response?.data?.message || error.message || "Failed to delete task";
      toast.error(msg);
    },
  });
};
