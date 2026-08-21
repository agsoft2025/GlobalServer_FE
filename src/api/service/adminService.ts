import schoolLocalApi from "../schoolLocalAxiosInstance";
import { schoolLocalEndpoints } from "../api";

export interface Admin {
  _id: string;
  username: string;
  fullname: string;
  // Populated by the backend into an object; falls back to a raw id string
  // for admins whose location lookup failed or who have none assigned.
  location_id: string | { _id: string; schoolName?: string; locationName?: string } | null;
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
  const res = await schoolLocalApi.get(schoolLocalEndpoints.admin.list, { params });
  return res.data;
}

export async function getAdminById(id: string): Promise<{ success: boolean; data: Admin }> {
  const res = await schoolLocalApi.get(schoolLocalEndpoints.admin.byId(id));
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
  const res = await schoolLocalApi.put(schoolLocalEndpoints.admin.byId(id), data);
  return res.data;
}

export async function deleteAdmin(id: string): Promise<{ success: boolean; message: string }> {
  const res = await schoolLocalApi.delete(schoolLocalEndpoints.admin.byId(id));
  return res.data;
}

export interface SchoolLocationOption {
  _id: string;
  schoolName: string;
  locationName: string;
}

export async function getSchoolLocations(): Promise<SchoolLocationOption[]> {
  const res = await schoolLocalApi.get(schoolLocalEndpoints.admin.locations);
  return res.data.data;
}