import api from "../axiosInstance";
import { endpoints } from "../api";

export type LoginPayload = {
  username: string;
  password: string;
};

export type LoginResponse = {
  status: boolean;
  token: string;
  user: {
    username: string;
    fullname: string;
    role: string;
  };
};

export async function loginApi(payload: LoginPayload): Promise<LoginResponse> {
  const { data } = await api.post<LoginResponse>(endpoints.auth.login, payload);
  return data;
}
