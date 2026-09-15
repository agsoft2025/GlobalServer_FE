import schoolApi from "../schoolAxiosInstance";
import { endpoints } from "../api";
import type {
  SchoolSmsConfigDetailResponse,
  SchoolSmsConfigListResponse,
  UpdateSchoolSmsConfigPayload,
} from "../../types/schoolSmsConfig";

export async function listSchoolSmsConfigs(): Promise<SchoolSmsConfigListResponse> {
  const res = await schoolApi.get(endpoints.schoolSmsConfig.list);
  return res.data;
}

export async function getSchoolSmsConfig(externalId: string): Promise<SchoolSmsConfigDetailResponse> {
  const res = await schoolApi.get(endpoints.schoolSmsConfig.byExternalId(externalId));
  return res.data;
}

export async function updateSchoolSmsConfig(
  externalId: string,
  payload: UpdateSchoolSmsConfigPayload,
): Promise<SchoolSmsConfigDetailResponse> {
  const res = await schoolApi.put(endpoints.schoolSmsConfig.byExternalId(externalId), payload);
  return res.data;
}
