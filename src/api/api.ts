type ApiTarget = "global" | "local";
type ApiService = "school" | "inmate";

const env = import.meta.env;

export const API_BASE_URLS = {
  schoolGlobal: env.VITE_SCHOOL_GLOBAL_API_URL || "https://apiglobalschool.agsoftsolutions.co.in/",
  schoolLocal: env.VITE_SCHOOL_LOCAL_API_URL || "https://schoolapi.agsoftsolutions.co.in/",
  inmateGlobal: env.VITE_INMATE_GLOBAL_API_URL || "https://apiglobalinmate.agsoftsolutions.co.in/",
  inmateLocal: env.VITE_INMATE_LOCAL_API_URL || "https://inmateapi.agsoftsolutions.co.in/",
} as const;

// export const API_BASE_URLS = {
//   schoolGlobal: "http://localhost:4002",
//   schoolLocal: "http://localhost:4001",
//   inmateGlobal: "http://localhost:3002",
//   inmateLocal: "http://localhost:3001",
// } as const;

export const API_TARGET: ApiTarget = env.VITE_API_TARGET === "local" ? "local" : "global";

export function getApiBaseUrl(service: ApiService, target: ApiTarget = API_TARGET): string {
  return API_BASE_URLS[`${service}${target === "global" ? "Global" : "Local"}` as keyof typeof API_BASE_URLS];
}

const apiPath = (path: string) => `/api${path}`;

export const endpoints = {
  health: "/",
  auth: {
    login: apiPath("/login"),
  },
  location: {
    list: apiPath("/location"),
    byId: (id: string) => `${apiPath("/location")}/${encodeURIComponent(id)}`,
  },
  subscribers: {
    locationStats: apiPath("/subscribers/locations/stats"),
    byLocation: (locationId: string) =>
      `${apiPath("/subscribers/location")}/${encodeURIComponent(locationId)}`,
    studentHistory: (studentId: string) =>
      `${apiPath("/subscribers")}/${encodeURIComponent(studentId)}/history`,
    inmateHistory: (inmateId: string) =>
      `${apiPath("/subscribers")}/${encodeURIComponent(inmateId)}/history`,
  },
  payment: {
    create: apiPath("/payment/create"),
    verify: apiPath("/payment/verify"),
    update: apiPath("/payment/update"),
  },
  admin: {
    list: apiPath("/admin"),
    byId: (id: string) => `${apiPath("/admin")}/${encodeURIComponent(id)}`,
    create: "/user/admin/create",
  },
  // SMS Template Master (Super Admin) — served by SchoolGlobalServer_BE.
  smsTemplates: {
    list: apiPath("/sms-templates"),
    byId: (id: string) => `${apiPath("/sms-templates")}/${encodeURIComponent(id)}`,
    status: (id: string) => `${apiPath("/sms-templates")}/${encodeURIComponent(id)}/status`,
  },
  // DLT-approved sender headers (Super Admin) — served by SchoolGlobalServer_BE.
  senderIds: {
    list: apiPath("/sender-ids"),
    byId: (id: string) => `${apiPath("/sender-ids")}/${encodeURIComponent(id)}`,
    status: (id: string) => `${apiPath("/sender-ids")}/${encodeURIComponent(id)}/status`,
  },
  // Per-school SMS template whitelist (Super Admin) — served by SchoolGlobalServer_BE.
  schoolSmsConfig: {
    list: apiPath("/school-sms-config"),
    byExternalId: (externalId: string) => `${apiPath("/school-sms-config")}/${encodeURIComponent(externalId)}`,
  },
} as const;

export const schoolLocalEndpoints = {
  admin: {
    list: "/admin",
    byId: (id: string) => `/admin/${encodeURIComponent(id)}`,
    create: "/user/admin/create",
    locations: "/admin/locations",
  },
  location: {
    list: "/location",
    byId: (id: string) => `/location/${encodeURIComponent(id)}`,
  },
} as const;

export const inmateLocalEndpoints = {
  admin: {
    list: "/admin",
    byId: (id: string) => `/admin/${encodeURIComponent(id)}`,
    create: "/admin",
    locations: "/admin/locations",
  },
} as const;
