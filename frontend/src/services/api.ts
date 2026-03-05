/**
 * MaternaCare API client for frontend communication with the backend.
 */

import type {
  Alert,
  AuditLog,
  Consultation,
  DashboardStats,
  Delivery,
  Newborn,
  PaginatedResponse,
  Patient,
  PostPartumVisit,
  Pregnancy,
  PregnancyDetail,
  TokenResponse,
  Ultrasound,
} from '../types';

const BASE_URL = '/api/v1';

function getHeaders(): HeadersInit {
  const token = localStorage.getItem('maternacare-token');
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

async function request<T>(
  method: string,
  path: string,
  body?: unknown,
): Promise<T> {
  const response = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: getHeaders(),
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Request failed' }));
    throw new Error(error.detail || `HTTP ${response.status}`);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json();
}

// --- Auth ---

export const auth = {
  login: (email: string, password: string) =>
    request<TokenResponse>('POST', '/auth/login', { email, password }),

  register: (data: { email: string; password: string; name: string; role: string }) =>
    request<unknown>('POST', '/auth/register', data),

  me: () => request<unknown>('GET', '/auth/me'),
};

// --- Patients ---

export const patients = {
  list: (page = 1, pageSize = 20, search?: string) =>
    request<PaginatedResponse<Patient>>(
      'GET',
      `/patients/?page=${page}&page_size=${pageSize}${search ? `&search=${search}` : ''}`,
    ),

  get: (id: number) => request<Patient>('GET', `/patients/${id}`),

  getByIpp: (ipp: string) => request<Patient>('GET', `/patients/ipp/${ipp}`),

  create: (data: Partial<Patient>) =>
    request<Patient>('POST', '/patients/', data),

  update: (id: number, data: Partial<Patient>) =>
    request<Patient>('PUT', `/patients/${id}`, data),

  delete: (id: number) => request<void>('DELETE', `/patients/${id}`),
};

// --- Pregnancies ---

export const pregnancies = {
  list: (page = 1, pageSize = 20, status?: string, patientId?: number) => {
    let url = `/pregnancies/?page=${page}&page_size=${pageSize}`;
    if (status) url += `&status=${status}`;
    if (patientId) url += `&patient_id=${patientId}`;
    return request<PaginatedResponse<Pregnancy>>('GET', url);
  },

  get: (id: number) => request<PregnancyDetail>('GET', `/pregnancies/${id}`),

  create: (data: Partial<Pregnancy>) =>
    request<Pregnancy>('POST', '/pregnancies/', data),

  update: (id: number, data: Partial<Pregnancy>) =>
    request<Pregnancy>('PUT', `/pregnancies/${id}`, data),
};

// --- Consultations ---

export const consultations = {
  list: (page = 1, pageSize = 20, pregnancyId?: number) => {
    let url = `/consultations/?page=${page}&page_size=${pageSize}`;
    if (pregnancyId) url += `&pregnancy_id=${pregnancyId}`;
    return request<PaginatedResponse<Consultation>>('GET', url);
  },

  get: (id: number) => request<Consultation>('GET', `/consultations/${id}`),

  create: (data: Partial<Consultation>) =>
    request<Consultation>('POST', '/consultations/', data),

  update: (id: number, data: Partial<Consultation>) =>
    request<Consultation>('PUT', `/consultations/${id}`, data),
};

// --- Ultrasounds ---

export const ultrasounds = {
  list: (page = 1, pageSize = 20, pregnancyId?: number) => {
    let url = `/ultrasounds/?page=${page}&page_size=${pageSize}`;
    if (pregnancyId) url += `&pregnancy_id=${pregnancyId}`;
    return request<PaginatedResponse<Ultrasound>>('GET', url);
  },

  get: (id: number) => request<Ultrasound>('GET', `/ultrasounds/${id}`),

  create: (data: Partial<Ultrasound>) =>
    request<Ultrasound>('POST', '/ultrasounds/', data),

  update: (id: number, data: Partial<Ultrasound>) =>
    request<Ultrasound>('PUT', `/ultrasounds/${id}`, data),
};

// --- Deliveries ---

export const deliveries = {
  list: (page = 1, pageSize = 20) =>
    request<PaginatedResponse<Delivery>>('GET', `/deliveries/?page=${page}&page_size=${pageSize}`),

  get: (id: number) => request<Delivery>('GET', `/deliveries/${id}`),

  create: (data: Partial<Delivery>) =>
    request<Delivery>('POST', '/deliveries/', data),

  update: (id: number, data: Partial<Delivery>) =>
    request<Delivery>('PUT', `/deliveries/${id}`, data),
};

// --- Newborns ---

export const newborns = {
  list: (page = 1, pageSize = 20) =>
    request<PaginatedResponse<Newborn>>('GET', `/newborns/?page=${page}&page_size=${pageSize}`),

  get: (id: number) => request<Newborn>('GET', `/newborns/${id}`),

  create: (data: Partial<Newborn>) =>
    request<Newborn>('POST', '/newborns/', data),

  update: (id: number, data: Partial<Newborn>) =>
    request<Newborn>('PUT', `/newborns/${id}`, data),
};

// --- PostPartum ---

export const postpartum = {
  list: (page = 1, pageSize = 20, pregnancyId?: number) => {
    let url = `/postpartum/?page=${page}&page_size=${pageSize}`;
    if (pregnancyId) url += `&pregnancy_id=${pregnancyId}`;
    return request<PaginatedResponse<PostPartumVisit>>('GET', url);
  },

  get: (id: number) => request<PostPartumVisit>('GET', `/postpartum/${id}`),

  create: (data: Partial<PostPartumVisit>) =>
    request<PostPartumVisit>('POST', '/postpartum/', data),

  update: (id: number, data: Partial<PostPartumVisit>) =>
    request<PostPartumVisit>('PUT', `/postpartum/${id}`, data),
};

// --- Alerts ---

export const alerts = {
  list: (page = 1, pageSize = 20, status?: string, severity?: string, pregnancyId?: number) => {
    let url = `/alerts/?page=${page}&page_size=${pageSize}`;
    if (status) url += `&status=${status}`;
    if (severity) url += `&severity=${severity}`;
    if (pregnancyId) url += `&pregnancy_id=${pregnancyId}`;
    return request<PaginatedResponse<Alert>>('GET', url);
  },

  get: (id: number) => request<Alert>('GET', `/alerts/${id}`),

  create: (data: Partial<Alert>) =>
    request<Alert>('POST', '/alerts/', data),

  acknowledge: (id: number) =>
    request<Alert>('POST', `/alerts/${id}/acknowledge`),

  resolve: (id: number) =>
    request<Alert>('POST', `/alerts/${id}/resolve`),
};

// --- Dashboard ---

export const dashboard = {
  get: () => request<DashboardStats>('GET', '/dashboard/'),
};

// --- Audit ---

export const audit = {
  list: (page = 1, pageSize = 20, userId?: number, entityType?: string) => {
    let url = `/audit/?page=${page}&page_size=${pageSize}`;
    if (userId) url += `&user_id=${userId}`;
    if (entityType) url += `&entity_type=${entityType}`;
    return request<PaginatedResponse<AuditLog>>('GET', url);
  },
};
