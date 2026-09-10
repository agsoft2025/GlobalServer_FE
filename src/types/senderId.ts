export type SenderIdStatus = "ACTIVE" | "INACTIVE";

export interface SenderId {
  id: string;
  header: string;
  description: string;
  dltEntityId: string;
  domain: "SCHOOL" | "INMATE";
  status: SenderIdStatus;
  createdBy?: { id?: string; username?: string };
  updatedBy?: { id?: string; username?: string };
  createdAt: string;
  updatedAt: string;
}

export interface SenderIdPagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface SenderIdListResponse {
  success: boolean;
  data: SenderId[];
  pagination: SenderIdPagination;
}

export interface SenderIdResponse {
  success: boolean;
  data: SenderId;
  message?: string;
}

export interface SenderIdPayload {
  header: string;
  description?: string;
  dltEntityId?: string;
  status: SenderIdStatus;
}
