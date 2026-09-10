// Per-school SMS configuration: the DLT Sender ID(s) a school may send under.
// Keyed by the tenant key `externalId` == the local school server's
// StudentLocation._id (also the Global Location.externalId once synced).
// The school's templates are derived from SmsTemplate.senderId ∈ assignedSenderIds.

export interface SchoolSmsConfigRow {
  externalId: string;
  schoolCode: string;
  name: string;
  location: string;
  assignedSenderIds: string[];
  templateCount: number;
  updatedAt: string | null;
  updatedBy?: { id?: string; username?: string } | null;
}

export interface SenderOption {
  header: string;
  description?: string;
  status: "ACTIVE" | "INACTIVE";
}

export interface SchoolSmsConfigListResponse {
  success: boolean;
  data: SchoolSmsConfigRow[];
  senders: SenderOption[];
  templateCountBySender: Record<string, number>;
}

export interface AvailableSender {
  header: string;
  status: "ACTIVE" | "INACTIVE";
  registered: boolean;
  templateCount: number;
  templates: { id: string; name: string; dltTemplateId: string }[];
}

export interface SchoolSmsConfigDetail {
  externalId: string;
  schoolCode: string;
  name: string;
  location: string;
  configured: boolean;
  assignedSenderIds: string[];
  availableSenders: AvailableSender[];
  updatedAt: string | null;
  updatedBy?: { id?: string; username?: string } | null;
}

export interface SchoolSmsConfigDetailResponse {
  success: boolean;
  data: SchoolSmsConfigDetail;
}

export interface UpdateSchoolSmsConfigPayload {
  assignedSenderIds: string[];
  name?: string;
  location?: string;
  schoolCode?: string;
}
