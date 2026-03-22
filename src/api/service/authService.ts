import api, { setApiBaseUrl } from "../axiosInstance";

export type LoginPayload = {
  username: string;
  password: string;
};

export type LoginResponse = {
  token: string;
  user: {
    id: string;
    username: string;
    name: string;
  };
};

export async function loginApi(payload: LoginPayload): Promise<LoginResponse> {
   setApiBaseUrl("https://inmate-project-global-server.onrender.com/");
  const { data } = await api.post<LoginResponse>("/api/login", payload);
  return data;
}
