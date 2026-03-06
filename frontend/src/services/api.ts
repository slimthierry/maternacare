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

const fieldLabels: Record<string, string> = {
  date_of_birth: 'Date de naissance',
  first_name: 'Prenom',
  last_name: 'Nom',
  ipp: 'IPP',
  blood_type: 'Groupe sanguin',
  rh_factor: 'Rhesus',
  phone: 'Telephone',
  emergency_contact: 'Contact urgence',
  date: 'Date',
  pregnancy_id: 'Grossesse',
  gestational_week: 'Semaine amenorrhee',
  delivery_type: 'Mode accouchement',
  weight_kg: 'Poids',
  blood_pressure_systolic: 'TA systolique',
  blood_pressure_diastolic: 'TA diastolique',
  lmp_date: 'Date dernieres regles',
  estimated_due_date: 'Date prevue accouchement',
  next_appointment: 'Prochain RDV',
};

function formatValidationErrors(error: Record<string, unknown>): string {
  if (Array.isArray(error.detail)) {
    return error.detail
      .map((e: { loc?: string[]; msg?: string; field?: string; message?: string }) => {
        const rawField = e.field ?? e.loc?.slice(-1)[0] ?? '';
        const label = fieldLabels[rawField] ?? rawField;
        const msg = e.message ?? e.msg ?? '';
        return label ? `${label} : ${msg}` : msg;
      })
      .filter(Boolean)
      .join('. ');
  }
  if (typeof error.detail === 'string') return error.detail;
  return '';
}

async function request<T>(
  method: string,
  path: string,
  body?: unknown,
): Promise<T> {
  let response: Response;
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 30_000);
    response = await fetch(`${BASE_URL}${path}`, {
      method,
      headers: getHeaders(),
      body: body ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    });
    clearTimeout(timeout);
  } catch (err) {
    if (err instanceof DOMException && err.name === 'AbortError') {
      throw new Error('La requete a expire (timeout). Verifiez votre connexion.');
    }
    throw new Error('Erreur reseau. Verifiez votre connexion internet.');
  }

  if (!response.ok) {
    if (response.status === 401 && !path.includes('/auth/login')) {
      localStorage.removeItem('maternacare-token');
      window.location.href = '/login';
      throw new Error('Session expiree. Veuillez vous reconnecter.');
    }

    const error = await response.json().catch(() => ({ detail: '' }));
    const message =
      formatValidationErrors(error) ||
      (response.status === 403 ? 'Acces non autorise' : '') ||
      (response.status === 404 ? 'Ressource introuvable' : '') ||
      (response.status === 409 ? 'Conflit: cette donnee existe deja' : '') ||
      (response.status >= 500 ? 'Erreur serveur. Reessayez plus tard.' : '') ||
      `Erreur HTTP ${response.status}`;
    throw new Error(message);
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

  exportCsv: async () => {
    const token = localStorage.getItem('maternacare-token');
    const res = await fetch(`${BASE_URL}/patients/export/csv`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    if (!res.ok) throw new Error('Erreur export CSV');
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'patients_maternacare.csv';
    a.click();
    URL.revokeObjectURL(url);
  },
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

  exportCsv: async () => {
    const token = localStorage.getItem('maternacare-token');
    const res = await fetch(`${BASE_URL}/pregnancies/export/csv`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    if (!res.ok) throw new Error('Erreur export CSV');
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'grossesses_maternacare.csv';
    a.click();
    URL.revokeObjectURL(url);
  },
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

  exportCsv: async () => {
    const token = localStorage.getItem('maternacare-token');
    const res = await fetch(`${BASE_URL}/consultations/export/csv`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    if (!res.ok) throw new Error('Erreur export CSV');
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'consultations_maternacare.csv';
    a.click();
    URL.revokeObjectURL(url);
  },
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

  exportCsv: async () => {
    const token = localStorage.getItem('maternacare-token');
    const res = await fetch(`${BASE_URL}/ultrasounds/export/csv`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    if (!res.ok) throw new Error('Erreur export CSV');
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'echographies_maternacare.csv';
    a.click();
    URL.revokeObjectURL(url);
  },
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

  exportCsv: async () => {
    const token = localStorage.getItem('maternacare-token');
    const res = await fetch(`${BASE_URL}/deliveries/export/csv`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    if (!res.ok) throw new Error('Erreur export CSV');
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'accouchements_maternacare.csv';
    a.click();
    URL.revokeObjectURL(url);
  },
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

  exportCsv: async () => {
    const token = localStorage.getItem('maternacare-token');
    const res = await fetch(`${BASE_URL}/newborns/export/csv`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    if (!res.ok) throw new Error('Erreur export CSV');
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'nouveaux_nes_maternacare.csv';
    a.click();
    URL.revokeObjectURL(url);
  },
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

  exportCsv: async () => {
    const token = localStorage.getItem('maternacare-token');
    const res = await fetch(`${BASE_URL}/postpartum/export/csv`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    if (!res.ok) throw new Error('Erreur export CSV');
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'postpartum_maternacare.csv';
    a.click();
    URL.revokeObjectURL(url);
  },
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
