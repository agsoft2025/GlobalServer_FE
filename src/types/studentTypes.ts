export interface StudentSummary {
  totalLocations: number;
  totalStudents: number;
  activeStudents: number;
  inactiveStudents: number;
}

export interface StudentLocationRecord {
  _id: string;
  name: string;
  baseUrl: string;
  location: string;
  createdAt: string;
  updatedAt: string;
  location_id: string;
  total_subscribers: number;
  active_subscribers: number;
  expired_subscribers: number;
  total_revenue: number;
  amount?: number;
  externalId?: string;
}

export interface StudentDetailRecord {
  _id: string;
  studentName: string;
  studentId: string;
  status: 'active' | 'inactive';
  lastSeen: string;
  location: string;
}

export interface IPayload {
  locationName: string;
  address: string;
  contactPerson?: string;
  contactNumber?: string;
  email?: string;
  status: 'active' | 'inactive';
  _id?: string;
  externalId?: string;
}

export interface StudentLocationResponse {
  summary: StudentSummary;
  data: StudentLocationRecord[];
  pagination: {
    total: number;
    page: number;
    limit: number;
  };
}

export interface SingleStudentLocationResponse {
  data: StudentDetailRecord[];
  total: number;
}

export interface StudentInfo {
  _id: string;
  registration_number: string;
  student_name: string;
  mother_name: string;
  father_name: string;
  contact_number: string;
  date_of_birth: string;
  gender: string;
  nationality: string;
  blood_group: string;
  class_info: string;
  location_id: string;
  user_id: string;
}

export interface LocationInfo {
  _id: string;
  name: string;
  baseUrl: string;
  location: string;
}

export interface LocationWiseStudentRecord {
  _id: string;
  student_id: string;
  location_id: string;
  subscription_type: 'MONTHLY' | 'YEARLY' | 'QUARTERLY';
  amount: number;
  razorpay_order_id: string;
  payment_status: 'SUCCESS' | 'PENDING' | 'FAILED';
  is_active: boolean;
  student_info: StudentInfo;
  start_date: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
  expire_date: string;
  razorpay_payment_id: string;
  location: LocationInfo;
}

export interface LocationWiseStudentResponse {
  success: boolean;
  count: number;
  total: number;
  page: number;
  limit: number;
  pages: number;
  data: LocationWiseStudentRecord[];
}


