import schoolApi from "../schoolAxiosInstance";

export interface Admin {
  _id: string;
  username: string;
  fullname: string;
  location_id: string;
  location?: {
    _id: string;
    name: string;
  };
  role: "ADMIN" | "SUPER_ADMIN";
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AdminListResponse {
  success: boolean;
  data: Admin[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
  };
}

export interface AdminFilters {
  username?: string;
  fullname?: string;
  location_id?: string;
  subscription?: boolean;
}

export interface AdminQueryParams extends AdminFilters {
  page?: number;
  limit?: number;
  sortField?: string;
  sortOrder?: "asc" | "desc";
}

export async function getAdmins(params: AdminQueryParams = {}): Promise<AdminListResponse> {
  const res = await schoolApi.get("/admin", { params });
  return res.data;
}

export async function getAdminById(id: string): Promise<{ success: boolean; data: Admin }> {
  const res = await schoolApi.get(`/admin/${id}`);
  return res.data;
}

export interface UpdateAdminPayload {
  username?: string;
  fullname?: string;
  newPassword?: string;
  oldPassword?: string;
  location_id?: string;
}

export async function updateAdmin(id: string, data: UpdateAdminPayload): Promise<{ success: boolean; data: Admin }> {
  const res = await schoolApi.put(`/admin/${id}`, data);
  return res.data;
}

export async function deleteAdmin(id: string): Promise<{ success: boolean; message: string }> {
  const res = await schoolApi.delete(`/admin/${id}`);
  return res.data;
}