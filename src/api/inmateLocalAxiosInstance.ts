import axios from "axios";
import type {
  AxiosError,
  AxiosInstance,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from "axios";
import { getApiBaseUrl } from "./api";

const inmateLocalApi: AxiosInstance = axios.create({
  baseURL: getApiBaseUrl("inmate", "local"),
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
});

inmateLocalApi.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem("token");

    if (token) {
      config.headers.set("Authorization", `Bearer ${token}`);
    }

    return config;
  },
  (error) => Promise.reject(error),
);

inmateLocalApi.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      console.warn("Unauthorized - token expired");
    }

    return Promise.reject(error);
  },
);

export default inmateLocalApi;
