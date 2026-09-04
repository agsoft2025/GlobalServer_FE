// src/api/subscribers.ts
import type { InmateStatsResponse } from "../../types/inmateTypes";
import api from "../axiosInstance";
import { endpoints } from "../api";

interface IPayload {
  location: string;
  name: string;
  // No longer collected in the UI; one common base URL is shared by all local
  // servers. Kept optional for back-compat.
  baseUrl?: string;
  subscription_amount: string | number;
  externalId?: string;
  _id?: string;
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
// Result of mirroring the new location down to the local inmate server. On
// "failed" the Global location still exists; it just won't appear in the local
// server's Add Admin dropdown until a later edit re-syncs it.
export type LocationSyncResult =
  | { status: "success" }
  | { status: "failed"; message: string }
  | null;

export type CreateInmateLocationResponse = IPayload & {
  locationSync?: LocationSyncResult;
};

export async function createInmateLocation(
  payload: IPayload
): Promise<CreateInmateLocationResponse> {
  const res = await api.post<CreateInmateLocationResponse>(endpoints.location.list, payload);

  return res.data;
}

export async function updateInmateLocation(
  payload: IPayload
): Promise<IPayload> {
  const res = await api.put<IPayload>(endpoints.location.byId(payload?._id ?? ""), payload);
  return res.data;
}