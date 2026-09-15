import schoolApi from "../schoolAxiosInstance";
import { endpoints } from "../api";
import type {
  SenderIdListResponse,
  SenderIdPayload,
  SenderIdResponse,
  SenderIdStatus,
} from "../../types/senderId";

export interface SenderIdQuery {
  search?: string;
  status?: SenderIdStatus;
  page?: number;
  limit?: number;
}

export async function listSenderIds(params: SenderIdQuery = {}): Promise<SenderIdListResponse> {
  const res = await schoolApi.get(endpoints.senderIds.list, { params });
  return res.data;
}

export async function getSenderId(id: string): Promise<SenderIdResponse> {
  const res = await schoolApi.get(endpoints.senderIds.byId(id));
  return res.data;
}

export async function createSenderId(payload: SenderIdPayload): Promise<SenderIdResponse> {
  const res = await schoolApi.post(endpoints.senderIds.list, payload);
  return res.data;
}

export async function updateSenderId(id: string, payload: Partial<SenderIdPayload>): Promise<SenderIdResponse> {
  const res = await schoolApi.put(endpoints.senderIds.byId(id), payload);
  return res.data;
}

export async function setSenderIdStatus(id: string, status: SenderIdStatus): Promise<SenderIdResponse> {
  const res = await schoolApi.patch(endpoints.senderIds.status(id), { status });
  return res.data;
}

export async function deleteSenderId(id: string): Promise<{ success: boolean; message: string }> {
  const res = await schoolApi.delete(endpoints.senderIds.byId(id));
  return res.data;
}
