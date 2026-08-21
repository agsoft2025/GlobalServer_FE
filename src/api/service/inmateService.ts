// src/api/subscribers.ts
import type { InmateStatsResponse } from "../../types/inmateTypes";
import api from "../axiosInstance";
import { endpoints } from "../api";

interface IPayload {
  location: string;
  name: string;
  baseUrl: string;
  subscription_amount: string | number;
  externalId: string;
  _id?: string
}

export async function getInmateLocationStats(
  page: number = 1,
  limit: number = 10,
): Promise<InmateStatsResponse> {
  const res = await api.get<InmateStatsResponse>(endpoints.subscribers.locationStats, {
    params: { page, limit },
  });
  return res.data;
}

export async function getSingleInmateLocation(
  page: number = 1,
  limit: number = 10,
  id: string
): Promise<InmateStatsResponse> {
  const res = await api.get<InmateStatsResponse>(
    endpoints.subscribers.byLocation(id),
    { params: { page, limit } },
  );
  
  return res.data;
}
export async function createInmateLocation(
  payload: IPayload
): Promise<IPayload> {
  const res = await api.post<IPayload>(endpoints.location.list, payload);

  return res.data;
}

export async function updateInmateLocation(
  payload: IPayload
): Promise<IPayload> {
  const res = await api.put<IPayload>(endpoints.location.byId(payload?._id ?? ""), payload);
  return res.data;
}