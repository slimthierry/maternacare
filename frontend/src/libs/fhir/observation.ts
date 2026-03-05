/**
 * FHIR Observation resource client for clinical measurements.
 */

const FHIR_BASE = '/api/fhir';

export interface FHIRObservationResource {
  resourceType: 'Observation';
  id: string;
  status: string;
  code: {
    coding: Array<{ system: string; code: string; display: string }>;
  };
  subject: { reference: string };
  effectiveDateTime: string;
  valueQuantity?: { value: number; unit: string; system: string; code: string };
  valueString?: string;
}

export interface FHIRBundle<T> {
  resourceType: 'Bundle';
  type: string;
  total: number;
  entry: Array<{ resource: T }>;
}

/**
 * LOINC codes for obstetric observations.
 */
export const OBSTETRIC_LOINC_CODES = {
  bloodPressureSystolic: { code: '8480-6', display: 'Systolic blood pressure' },
  bloodPressureDiastolic: { code: '8462-4', display: 'Diastolic blood pressure' },
  bodyWeight: { code: '29463-7', display: 'Body weight' },
  fetalHeartRate: { code: '55283-6', display: 'Fetal heart rate' },
  uterineHeight: { code: '11881-0', display: 'Uterine fundal height' },
  glucose: { code: '2345-7', display: 'Glucose' },
} as const;

export class FHIRObservationClient {
  private baseUrl: string;
  private token: string;

  constructor(baseUrl: string = FHIR_BASE, token: string = '') {
    this.baseUrl = baseUrl;
    this.token = token;
  }

  private getHeaders(): HeadersInit {
    const headers: Record<string, string> = {
      'Content-Type': 'application/fhir+json',
      Accept: 'application/fhir+json',
    };
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }
    return headers;
  }

  /**
   * Search observations by patient IPP and optional LOINC code.
   */
  async search(params: {
    patient?: string;
    code?: string;
  }): Promise<FHIRBundle<FHIRObservationResource>> {
    const searchParams = new URLSearchParams();
    if (params.patient) searchParams.set('patient', params.patient);
    if (params.code) searchParams.set('code', params.code);

    const response = await fetch(
      `${this.baseUrl}/Observation/?${searchParams.toString()}`,
      { headers: this.getHeaders() },
    );
    if (!response.ok) {
      throw new Error('FHIR Observation search failed');
    }
    return response.json();
  }
}
