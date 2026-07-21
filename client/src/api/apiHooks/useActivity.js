import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import useAxiosSecure from '@/hooks/useAxiosSecure';

export const useActivities = (limit = 20) => {
  const axiosSecure = useAxiosSecure();
  return useQuery({
    queryKey: ['activities', limit],
    queryFn: async () => {
      const res = await axiosSecure.get(`/activities?limit=${limit}`);
      return res.data?.data || [];
    },
  });
};

export const useCreateActivity = () => {
  const axiosSecure = useAxiosSecure();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (activityData) => {
      const res = await axiosSecure.post('/activities', activityData);
      return res.data?.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activities'] });
    },
  });
};
