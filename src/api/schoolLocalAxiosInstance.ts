import axios from "axios";
import type {
  AxiosError,
  AxiosInstance,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from "axios";
import { getApiBaseUrl } from "./api";

const schoolLocalApi: AxiosInstance = axios.create({
  baseURL: getApiBaseUrl("school", "local"),
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
});

schoolLocalApi.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem("token");

    if (token) {
      config.headers.set("Authorization", `Bearer ${token}`);
    }

    return config;
  },
  (error) => Promise.reject(error),
);

schoolLocalApi.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      console.warn("Unauthorized - token expired");
    }

    return Promise.reject(error);
  },
);

export default schoolLocalApi;
