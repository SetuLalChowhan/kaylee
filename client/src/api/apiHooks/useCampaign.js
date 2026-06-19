import { useQuery } from "@tanstack/react-query";
import useAxiosSecure from "../../hooks/useAxiosSecure";
import { USER } from "../apiEndPoint";

/**
 * useCampaigns — Fetch all campaigns for populating dropdown lists
 */
export const useCampaigns = () => {
  const axiosSecure = useAxiosSecure();

  return useQuery({
    queryKey: ["campaigns"],
    queryFn: async () => {
      const res = await axiosSecure.get(USER.CAMPAIGN);
      return res.data?.data || [];
    },
    staleTime: 10 * 60 * 1000, // campaigns don't change very often, 10 min cache is great
  });
};
