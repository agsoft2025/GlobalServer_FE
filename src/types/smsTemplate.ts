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
}
