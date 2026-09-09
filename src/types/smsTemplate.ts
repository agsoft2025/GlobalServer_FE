export type SmsTemplateDomain = "SCHOOL" | "INMATE";
export type SmsTemplateStatus = "ACTIVE" | "INACTIVE";

export interface SmsTemplateFieldSpec {
  key: string;
  label: string;
  type: "text" | "alphanumeric" | "number";
  maxLength: number;
  required: boolean;
  source: "input" | "record";
}

export interface SmsTemplateActor {
  id?: string;
  username?: string;
}

export interface SmsTemplate {
  id: string;
  name: string;
  description: string;
  domain: SmsTemplateDomain;
  dltTemplateId: string;
  approvedText: string;
  placeholderCount: number;
  fields: SmsTemplateFieldSpec[];
  status: SmsTemplateStatus;
  version: number;
  createdBy?: SmsTemplateActor;
  updatedBy?: SmsTemplateActor;
  createdAt: string;
  updatedAt: string;
}

export interface SmsTemplatePagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface SmsTemplateListResponse {
  success: boolean;
  data: SmsTemplate[];
  pagination: SmsTemplatePagination;
}

export interface SmsTemplateResponse {
  success: boolean;
  data: SmsTemplate;
  message?: string;
}

export interface SmsTemplatePayload {
  name: string;
  description?: string;
  domain: SmsTemplateDomain;
  dltTemplateId: string;
  approvedText: string;
  status: SmsTemplateStatus;
  fields: SmsTemplateFieldSpec[];
}

// Student-record values a "record" slot may be bound to. MUST match
// RECORD_FIELD_KEYS in SchoolGlobalServer_BE/src/utils/dltTemplate.js and the
// keys emitted by SchoolServer_BE recipientResolver.
export const RECORD_FIELD_OPTIONS: { key: string; label: string }[] = [
  { key: "student_name", label: "Student name" },
  { key: "father_name", label: "Father's name" },
  { key: "mother_name", label: "Mother's name" },
  { key: "registration_number", label: "Registration number" },
  { key: "class_name", label: "Class name" },
  { key: "section", label: "Section" },
  { key: "hostel_name", label: "Hostel name" },
  { key: "board_name", label: "Board name" },
];
