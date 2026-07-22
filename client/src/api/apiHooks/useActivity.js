import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import useAxiosSecure from '@/hooks/useAxiosSecure';

export const useActivities = (page = 1, limit = 15) => {
  const axiosSecure = useAxiosSecure();
  return useQuery({
    queryKey: ['activities', page, limit],
    queryFn: async () => {
      const res = await axiosSecure.get(`/activities?page=${page}&limit=${limit}`);
      return {
        activities: res.data?.data || [],
        pagination: res.data?.pagination || { page, limit, total: 0, hasMore: false },
      };
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
