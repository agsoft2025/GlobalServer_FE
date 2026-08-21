import inmateLocalApi from "../inmateLocalAxiosInstance";
import { inmateLocalEndpoints } from "../api";

export interface InmateAdmin {
  _id: string;
  username: string;
  fullname: string;
  // Populated by the backend into an object; falls back to a raw id string
  // for admins whose location lookup failed or who have none assigned.
  location_id: string | { _id: string; name?: string; locationName?: string } | null;
  role: "ADMIN" | "SUPER_ADMIN";
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
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

export interface InmateAdminQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  order?: "asc" | "desc";
  location_id?: string;
}

export async function getInmateAdmins(params: InmateAdminQueryParams = {}): Promise<InmateAdminListResponse> {
  const res = await inmateLocalApi.get(inmateLocalEndpoints.admin.list, { params });
  return res.data;
}

export async function getInmateAdminById(id: string): Promise<{ success: boolean; data: InmateAdmin }> {
  const res = await inmateLocalApi.get(inmateLocalEndpoints.admin.byId(id));
  return res.data;
}

export interface CreateInmateAdminPayload {
  username: string;
  fullname: string;
  password: string;
  location_id: string;
}

export async function createInmateAdmin(data: CreateInmateAdminPayload) {
  const res = await inmateLocalApi.post(inmateLocalEndpoints.admin.create, data);
  return res.data;
}

export interface UpdateInmateAdminPayload {
  fullname?: string;
  password?: string;
}

export async function updateInmateAdmin(id: string, data: UpdateInmateAdminPayload): Promise<{ success: boolean; data: InmateAdmin }> {
  const res = await inmateLocalApi.put(inmateLocalEndpoints.admin.byId(id), data);
  return res.data;
}

export async function deleteInmateAdmin(id: string): Promise<{ success: boolean; message: string }> {
  const res = await inmateLocalApi.delete(inmateLocalEndpoints.admin.byId(id));
  return res.data;
}

export interface InmateLocationOption {
  _id: string;
  name: string;
  locationName: string;
}

export async function getInmateLocations(): Promise<InmateLocationOption[]> {
  const res = await inmateLocalApi.get(inmateLocalEndpoints.admin.locations);
  return res.data.data;
}
