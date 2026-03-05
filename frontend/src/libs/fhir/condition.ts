/**
 * FHIR Condition resource client for obstetric complications.
 */

const FHIR_BASE = '/api/fhir';

export interface FHIRConditionResource {
  resourceType: 'Condition';
  id: string;
  subject: { reference: string; display?: string };
  code: {
    coding: Array<{ system: string; code: string; display: string }>;
    text?: string;
  };
  clinicalStatus: {
    coding: Array<{ system: string; code: string; display: string }>;
  };
  severity?: {
    coding: Array<{ system: string; code: string; display: string }>;
  };
  onsetDateTime?: string;
  recordedDate: string;
}

export interface FHIRBundle<T> {
  resourceType: 'Bundle';
  type: string;
  total: number;
  entry: Array<{ resource: T }>;
}

/**
 * ICD-10 codes for standard obstetric complications.
 */
export const OBSTETRIC_ICD10_CODES = {
  pre_eclampsia: { code: 'O14.9', display: 'Pre-eclampsia, unspecified' },
  gestational_diabetes: { code: 'O24.4', display: 'Gestational diabetes mellitus' },
  iugr: { code: 'O36.5', display: 'Maternal care for poor fetal growth' },
  preterm_labor: { code: 'O60.0', display: 'Preterm labor without delivery' },
  placenta_previa: { code: 'O44.0', display: 'Placenta previa' },
  rh_incompatibility: { code: 'O36.0', display: 'Maternal care for rhesus isoimmunization' },
  anomaly: { code: 'O35.9', display: 'Maternal care for fetal abnormality, unspecified' },
  postpartum_depression: { code: 'F53.0', display: 'Postpartum depression' },
} as const;

export class FHIRConditionClient {
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
   * Search conditions by patient IPP.
   */
  async searchByPatient(
    patientIPP: string,
  ): Promise<FHIRBundle<FHIRConditionResource>> {
    const response = await fetch(
      `${this.baseUrl}/Condition/?patient=${patientIPP}`,
      { headers: this.getHeaders() },
    );
    if (!response.ok) {
      throw new Error('FHIR Condition search failed');
    }
    return response.json();
  }
}
