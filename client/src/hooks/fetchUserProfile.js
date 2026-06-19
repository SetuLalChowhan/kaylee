import { useQuery } from "@tanstack/react-query";
import { useDispatch, useSelector } from "react-redux";
import { selectCurrentToken, setUser } from "@/redux/slices/authSlice";
import useAxiosSecure from "./useAxiosSecure";
import { useEffect } from "react";
import { USER } from "@/api/apiEndPoint";

export const useUserProfile = () => {
  const token = useSelector(selectCurrentToken);
  const dispatch = useDispatch();
  const axiosSecure = useAxiosSecure();

  const query = useQuery({
    queryKey: ["userProfile", token],
    queryFn: async () => {
      if (!token) return null;
      const res = await axiosSecure.get(USER.GET_ME);
      return res.data?.data || res.data;
    },
    enabled: !!token,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Sync with Redux whenever data is fetched
  useEffect(() => {
    if (query.data) {
      dispatch(setUser(query.data));
    }
  }, [query.data, dispatch]);

  return query;
};
