import axios from "axios";
import { useMemo } from "react";

const useAxiosPublic = () => {
  const axiosPublic = useMemo(() => {
    return axios.create({
      baseURL: import.meta.env.VITE_API_URL,
      withCredentials: true,
      // timeout: 30000,
    });
  }, []);

  return axiosPublic;
};

export default useAxiosPublic;
