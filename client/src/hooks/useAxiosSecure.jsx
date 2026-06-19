import axios from "axios";
import { useSelector, useDispatch } from "react-redux";
import { selectCurrentToken, clearAuth, setToken } from "../redux/slices/authSlice";
import { useMemo, useRef } from "react";
import { AUTH } from "../api/apiEndPoint";

const useAxiosSecure = () => {
  const token = useSelector(selectCurrentToken);
  const dispatch = useDispatch();

  const tokenRef = useRef(token);
  tokenRef.current = token;

  const axiosSecure = useMemo(() => {
    const instance = axios.create({
      baseURL: import.meta.env.VITE_API_URL || "http://localhost:3000/api",
      withCredentials: true,
      timeout: 30000,
      headers: {
        "Content-Type": "application/json",
      },
    });

    // Request interceptor — attach token dynamically using the ref
    instance.interceptors.request.use(
      (config) => {
        const currentToken = tokenRef.current;
        if (currentToken) {
          config.headers.Authorization = `Bearer ${currentToken}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor — refresh token on 401
    instance.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;

        // Only attempt refresh on 401 and if we haven't retried yet
        if (error?.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          try {
            const res = await axios.post(
              AUTH.REFRESH_TOKEN,
              {},
              { withCredentials: true }
            );

            const newToken = res.data.accessToken;
            dispatch(setToken({ token: newToken }));
            tokenRef.current = newToken; // Update ref immediately

            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            return instance(originalRequest);
          } catch (refreshError) {
            dispatch(clearAuth());
            window.location.href = "/login";
            return Promise.reject(refreshError);
          }
        }

        return Promise.reject(error);
      }
    );

    return instance;
  }, [dispatch]);

  return axiosSecure;
};

export default useAxiosSecure;
