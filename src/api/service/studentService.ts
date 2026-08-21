import schoolApi from "../schoolAxiosInstance";
import schoolLocalApi from "../schoolLocalAxiosInstance";
import { endpoints, schoolLocalEndpoints } from "../api";
import type { LocationWiseStudentResponse } from "../../types/studentTypes";

// Set the base URL for student-related API calls

export interface StudentLocationStats {
  success: boolean;
  data: Array<{
    _id: string;
    name: string;
    baseUrl: string;
    location: string;
    createdAt: string;
    updatedAt: string;
    __v: number;
    location_id: string;
    total_subscribers: number;
    active_subscribers: number;
    expired_subscribers: number;
    total_revenue: number;
    amount?: number;
  }>;
  summary: {
    total_schools: number;
    total_students: number;
    total_subscribers: number;
    active_subscribers: number;
    expired_subscribers: number;
    total_revenue: number;
  };
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

type SingleStudentLocation = {
  data: Array<{
    _id: string;
    studentName: string;
    studentId: string;
    status: 'active' | 'inactive';
    lastSeen: string;
    location: string;
  }>;
  total: number;
};

type LocationPayload = {
  name: string;
  location: string;
  baseUrl: string;
  amount?: string | number;
  externalId: string;
  status?: 'active' | 'inactive';
  _id?: string;
};

type CreateAdmin = {
  username: string;
  fullname: string;
  password: string;
  location_id: string;
}

export async function getStudentLocationStats(
  page: number = 1,
  limit: number = 10,
): Promise<StudentLocationStats> {
  const res = await schoolApi.get<StudentLocationStats>(endpoints.subscribers.locationStats, {
    params: { page, limit },
  });
  return res.data;
}

export async function getLocationWiseData(
  page: number = 1,
  limit: number = 10,
  locationId: string
): Promise<LocationWiseStudentResponse> {
  const res = await schoolApi.get<LocationWiseStudentResponse>(
    endpoints.subscribers.byLocation(locationId),
    { params: { page, limit } },
  );
  return res.data;
}

export async function getSingleStudentLocation(
  page: number = 1,
  limit: number = 10,
  locationId: string
): Promise<SingleStudentLocation> {
  const res = await schoolApi.get<SingleStudentLocation>(
    endpoints.subscribers.studentHistory(locationId),
    { params: { page, limit } },
  );
  return res.data;
}

export async function createStudentLocation(data: Omit<LocationPayload, '_id'>) {
  const res = await schoolApi.post(endpoints.location.list, data);
  return res.data;
}

export async function updateStudentLocation(data: LocationPayload) {
  const { _id, ...updateData } = data;
  const res = await schoolApi.put(endpoints.location.byId(_id ?? ""), updateData);
  return res.data;
}

export async function updateLocation(data: LocationPayload) {
  const { _id, ...updateData } = data;
  const res = await schoolApi.put(endpoints.location.byId(_id ?? ""), updateData);
  return res.data;
}

export async function deleteLocation(data: LocationPayload) {
  const { _id } = data;
  const res = await schoolApi.delete(endpoints.location.byId(_id ?? ""));
  return res.data;
}

export async function deleteStudentLocation(id: string) {
  const res = await schoolApi.delete(endpoints.location.byId(id));
  return res.data;
}

// Admin modal
export async function createAdmin(data: CreateAdmin) {
  const res = await schoolLocalApi.post(schoolLocalEndpoints.admin.create, data);
  return res.data;
}