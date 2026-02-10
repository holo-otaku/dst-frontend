import Axios from "axios";
import { configure } from "axios-hooks";

export const axios = Axios.create({
  baseURL: import.meta.env.VITE_API_HOST,
});

// Request interceptor: reads token from localStorage on EVERY request
// This eliminates the race condition where useEffect hasn't run yet
axios.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Configure axios-hooks to use our custom instance
// All useAxios() calls across the app will use this instance
configure({ axios });
