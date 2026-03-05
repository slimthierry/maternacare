// ---- Enums ----

export type UserRole = 'admin' | 'gynecologue' | 'sage_femme' | 'pediatre' | 'infirmier' | 'patiente';

export type PregnancyStatus = 'active' | 'delivered' | 'complicated' | 'loss';

export type RiskLevel = 'low' | 'medium' | 'high' | 'very_high';

export type ConsultationType = 'routine' | 'urgent' | 'specialist';

export type Proteinuria = 'negative' | 'trace' | '1+' | '2+' | '3+' | '4+';

export type Edema = 'none' | 'mild' | 'moderate' | 'severe';

export type UltrasoundType = 'dating' | 'morphology' | 'growth' | 'doppler';

export type DeliveryType = 'vaginal_spontaneous' | 'vaginal_assisted' | 'cesarean_planned' | 'cesarean_emergency';

export type AnesthesiaType = 'none' | 'epidural' | 'spinal' | 'general';

export type AlertType = 'pre_eclampsia' | 'gestational_diabetes' | 'iugr' | 'preterm_labor' | 'placenta_previa' | 'rh_incompatibility' | 'anomaly' | 'postpartum_depression';

export type AlertSeverity = 'info' | 'warning' | 'critical';

export type AlertStatus = 'active' | 'acknowledged' | 'resolved';

export type BreastfeedingStatus = 'exclusive' | 'mixed' | 'formula' | 'stopped';

export type UterineInvolution = 'normal' | 'delayed';

export type WoundHealing = 'good' | 'infection' | 'dehiscence';

// ---- Models ----

export interface User {
  id: number;
  email: string;
  name: string;
  role: UserRole;
  service?: string;
  rpps_number?: string;
  created_at: string;
}

export interface Patient {
  id: number;
  ipp: string;
  first_name: string;
  last_name: string;
  date_of_birth: string;
  blood_type?: string;
  rh_factor?: string;
  medical_history?: Record<string, unknown>;
  allergies?: string[];
  phone?: string;
  emergency_contact?: string;
  created_at: string;
}

export interface Pregnancy {
  id: number;
  patient_id: number;
  lmp_date: string;
  estimated_due_date: string;
  actual_due_date?: string;
  status: PregnancyStatus;
  risk_level: RiskLevel;
  gravida: number;
  para: number;
  notes?: string;
  created_at: string;
}

export interface PregnancyDetail extends Pregnancy {
  consultations_count: number;
  ultrasounds_count: number;
  alerts_count: number;
  patient_name: string;
}

export interface Consultation {
  id: number;
  pregnancy_id: number;
  date: string;
  gestational_week: number;
  weight_kg?: number;
  blood_pressure_systolic?: number;
  blood_pressure_diastolic?: number;
  uterine_height_cm?: number;
  fetal_heart_rate?: number;
  glycemia?: number;
  proteinuria?: Proteinuria;
  edema?: Edema;
  practitioner_id: number;
  consultation_type: ConsultationType;
  notes?: string;
  next_appointment?: string;
  created_at: string;
}

export interface Ultrasound {
  id: number;
  pregnancy_id: number;
  date: string;
  gestational_week: number;
  type: UltrasoundType;
  fetal_weight_g?: number;
  biparietal_diameter_mm?: number;
  femur_length_mm?: number;
  abdominal_circumference_mm?: number;
  amniotic_fluid_index?: number;
  placenta_position?: string;
  fetal_heart_rate?: number;
  anomalies_detected?: string[];
  practitioner_id: number;
  notes?: string;
  created_at: string;
}

export interface Delivery {
  id: number;
  pregnancy_id: number;
  date: string;
  gestational_week: number;
  delivery_type: DeliveryType;
  labor_duration_hours?: number;
  complications?: string[];
  anesthesia_type: AnesthesiaType;
  blood_loss_ml?: number;
  practitioner_id: number;
  notes?: string;
  created_at: string;
}

export interface Newborn {
  id: number;
  delivery_id: number;
  first_name?: string;
  sex: 'M' | 'F';
  weight_g: number;
  height_cm?: number;
  head_circumference_cm?: number;
  blood_type?: string;
  rh_factor?: string;
  apgar_1min?: number;
  apgar_5min?: number;
  apgar_10min?: number;
  resuscitation_needed: boolean;
  nicu_admission: boolean;
  notes?: string;
  created_at: string;
}

export interface PostPartumVisit {
  id: number;
  pregnancy_id: number;
  date: string;
  days_postpartum: number;
  mood_score?: number;
  edinburgh_score?: number;
  breastfeeding_status?: BreastfeedingStatus;
  uterine_involution?: UterineInvolution;
  wound_healing?: WoundHealing;
  complications?: string[];
  practitioner_id: number;
  notes?: string;
  created_at: string;
}

export interface Alert {
  id: number;
  pregnancy_id: number;
  type: AlertType;
  severity: AlertSeverity;
  description: string;
  detected_at: string;
  acknowledged_by?: number;
  acknowledged_at?: string;
  status: AlertStatus;
  auto_generated: boolean;
  created_at: string;
}

export interface AuditLog {
  id: number;
  user_id?: number;
  action: string;
  entity_type: string;
  entity_id?: number;
  details?: string;
  ip_address?: string;
  timestamp: string;
}

// ---- API Responses ----

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  page_size: number;
}

export interface DashboardStats {
  active_pregnancies: number;
  upcoming_appointments: Array<{
    id: number;
    patient_name: string;
    date: string;
    consultation_type: string;
    gestational_week: number;
  }>;
  current_alerts: {
    info: number;
    warning: number;
    critical: number;
  };
  recent_deliveries: Array<{
    id: number;
    patient_name: string;
    delivery_type: string;
    gestational_week: number;
    date: string;
  }>;
  risk_distribution: {
    low: number;
    medium: number;
    high: number;
    very_high: number;
  };
  total_patients: number;
  deliveries_this_month: number;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
  user_id: number;
  role: string;
  name: string;
}
