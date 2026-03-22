import axios from "axios";
import type {
  AxiosInstance,
  AxiosResponse,
  AxiosError,
  InternalAxiosRequestConfig
} from "axios";

const api: AxiosInstance = axios.create({
  baseURL: "https://inmate-project-global-server.onrender.com/",
  timeout: 30000,
  headers: {
    "Content-Type": "application/json"
  }
});

// REQUEST INTERCEPTOR

api.interceptors.request.use(
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
api.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      console.warn("Unauthorized - token expired");
      // optional logout logic
    }

    return Promise.reject(error);
  }
);

export function setApiBaseUrl(url: string) {
  api.defaults.baseURL = url;
}

export default api;
