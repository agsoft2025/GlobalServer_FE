import schoolApi from "../schoolAxiosInstance";
import { endpoints } from "../api";
import type {
  SmsTemplateListResponse,
  SmsTemplatePayload,
  SmsTemplateResponse,
  SmsTemplateStatus,
} from "../../types/smsTemplate";

export interface SmsTemplateQuery {
  search?: string;
  status?: SmsTemplateStatus;
  page?: number;
  limit?: number;
}

// domain is pinned to SCHOOL: this portal never manages INMATE templates.
export async function listSmsTemplates(params: SmsTemplateQuery = {}): Promise<SmsTemplateListResponse> {
  const res = await schoolApi.get(endpoints.smsTemplates.list, { params: { domain: "SCHOOL", ...params } });
  return res.data;
}

export async function getSmsTemplate(id: string): Promise<SmsTemplateResponse> {
  const res = await schoolApi.get(endpoints.smsTemplates.byId(id));
  return res.data;
}

export async function createSmsTemplate(payload: SmsTemplatePayload): Promise<SmsTemplateResponse> {
  const res = await schoolApi.post(endpoints.smsTemplates.list, payload);
  return res.data;
}

export async function updateSmsTemplate(
  id: string,
  payload: Partial<SmsTemplatePayload>,
): Promise<SmsTemplateResponse> {
  const res = await schoolApi.put(endpoints.smsTemplates.byId(id), payload);
  return res.data;
}

export async function setSmsTemplateStatus(id: string, status: SmsTemplateStatus): Promise<SmsTemplateResponse> {
  const res = await schoolApi.patch(endpoints.smsTemplates.status(id), { status });
  return res.data;
}

export async function deleteSmsTemplate(id: string): Promise<{ success: boolean; message: string }> {
  const res = await schoolApi.delete(endpoints.smsTemplates.byId(id));
  return res.data;
}
