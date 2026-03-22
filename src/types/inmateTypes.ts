export type LocationStat = {
  location: string;
  totalSubscribers: number;
};

export type LocationStatsResponse = {
  data: LocationStat[];
};

export type InmateLocationRecord = {
  _id: string;
  name: string;
  baseUrl: string;
  location: string;
  subscription_amount: number;
  total_inmates: number;
  total_subscriptions: number;
  active_subscriptions: number;
  expired_subscriptions: number;
  total_revenue: number;
};

export type InmateSummary = {
  total_locations: number;
  total_inmates: number;
  total_subscriptions: number;
  active_subscriptions: number;
  expired_subscriptions: number;
  total_revenue: number;
};

export type Pagination = {
  total: number;
  page: number;
  limit: number;
  pages: number;
};

export type InmateStatsResponse = {
  success: boolean;
  data: InmateLocationRecord[];
  summary: InmateSummary;
  pagination: Pagination
};


export type LocationInfo = {
  _id: string;
  name: string;
  baseUrl: string;
  location: string;
};

export type InmateInfo = {       // you need this type too
  _id: string;
  inmateId: string;
  inmate_name: string;
  inmate_lastName: string;
  custodyType: string;
  cellNumber: string;
  balance: number;
  location_id: string;
  user_id: string;
  admissionDate: string;
  status: string;
  is_blocked: boolean;
  date_of_birth: string;
  phonenumber: string;
};

export type SingleInmateRecord = {
  _id: string;
  inmateId: string;
  location_id: string;
  subscription_type: string;
  subscription_months: number;
  razorpay_order_id: string;
  payment_status: string;
  is_active: boolean;
  amount: number;
  inmate_info: InmateInfo;
  start_date: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
  expire_date: string;
  razorpay_payment_id: string;
  location: LocationInfo;
};

// Pagination wrapper
export type SingleInmateResponse = {
  success: boolean;
  count: number;
  total: number;
  page: number;
  limit: number;
  pages: number;
  data: SingleInmateRecord[];
};

export interface IPayload {
  _id?: string;
  location: string;
  name: string;
  baseUrl: string;
  subscription_amount: string | number;
}