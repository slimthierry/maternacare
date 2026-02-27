/**
 * MaternaCare SIH Integration package.
 *
 * Provides FHIR client adapters and webhook event handling
 * for hospital information system integration.
 */

export { FHIRPatientClient } from './fhir/patient';
export { FHIRConditionClient } from './fhir/condition';
export { FHIRObservationClient } from './fhir/observation';
export {
  WebhookEventType,
  WEBHOOK_EVENTS,
  type WebhookPayload,
} from './webhooks/events';
export { WebhookClient } from './webhooks/client';
