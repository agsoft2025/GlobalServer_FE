import inmateAdminApi from "../inmateAdminAxiosInstance";
import type { Admin } from "./adminService";

export type InmateAdmin = Admin & {
  subscription?: boolean;
};

export interface InmateAdminListParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  order?: "asc" | "desc";
  subscription?: string;
  location_id?: string;
}

export interface InmateAdminListResponse {
  success: boolean;
  data: InmateAdmin[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export async function getInmateAdmins(params: InmateAdminListParams = {}): Promise<InmateAdminListResponse> {
  const response = await inmateAdminApi.get<InmateAdminListResponse>("/admin", { params });
  return response.data;
}

export async function getInmateAdminById(id: string): Promise<{ success: boolean; data: InmateAdmin }> {
  const response = await inmateAdminApi.get(`/admin/${id}`);
  return response.data;
}

export interface CreateInmateAdminPayload {
  username: string;
  fullname: string;
  password: string;
  descriptor?: number[];
}

export async function createInmateAdmin(data: CreateInmateAdminPayload) {
  const response = await inmateAdminApi.post("/admin", data);
  return response.data;
}

export interface UpdateInmateAdminPayload {
  fullname?: string;
  password?: string;
}

export async function updateInmateAdmin(id: string, data: UpdateInmateAdminPayload) {
  const response = await inmateAdminApi.put(`/admin/${id}`, data);
  return response.data;
}

export async function deleteInmateAdmin(id: string) {
  const response = await inmateAdminApi.delete(`/admin/${id}`);
  return response.data;
}
