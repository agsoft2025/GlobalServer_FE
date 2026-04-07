import axios from "axios";
import type {
  AxiosInstance,
  AxiosResponse,
  AxiosError,
  InternalAxiosRequestConfig
} from "axios";

const schoolApi: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_SCHOOL_SERVER_URL,
  timeout: 30000,
  headers: {
    "Content-Type": "application/json"
  }
});

// REQUEST INTERCEPTOR

schoolApi.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem("token");

    if (token) {
      config.headers.set("Authorization", `Bearer ${token}`);
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// RESPONSE INTERCEPTOR
schoolApi.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      console.warn("Unauthorized - token expired");
      // optional logout logic
    }

    return Promise.reject(error);
  }
);

export default schoolApi;