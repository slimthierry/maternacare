/**
 * FHIR Patient resource client for SIH integration.
 */

const FHIR_BASE = '/api/fhir';

export interface FHIRPatientResource {
  resourceType: 'Patient';
  id: string;
  identifier: Array<{ system: string; value: string }>;
  name: Array<{ family: string; given: string[] }>;
  gender: string;
  birthDate: string;
}

export interface FHIRBundle<T> {
  resourceType: 'Bundle';
  type: string;
  total: number;
  entry: Array<{ resource: T }>;
}

export class FHIRPatientClient {
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
   * Get a Patient by IPP identifier.
   */
  async getByIPP(ipp: string): Promise<FHIRPatientResource> {
    const response = await fetch(`${this.baseUrl}/Patient/${ipp}`, {
      headers: this.getHeaders(),
    });
    if (!response.ok) {
      throw new Error(`FHIR Patient not found: ${ipp}`);
    }
    return response.json();
  }

  /**
   * Search patients by name or identifier.
   */
  async search(params: {
    name?: string;
    identifier?: string;
  }): Promise<FHIRBundle<FHIRPatientResource>> {
    const searchParams = new URLSearchParams();
    if (params.name) searchParams.set('name', params.name);
    if (params.identifier) searchParams.set('identifier', params.identifier);

    const response = await fetch(
      `${this.baseUrl}/Patient/?${searchParams.toString()}`,
      { headers: this.getHeaders() },
    );
    if (!response.ok) {
      throw new Error('FHIR Patient search failed');
    }
    return response.json();
  }
}
