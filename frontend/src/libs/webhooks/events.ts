/**
 * Webhook event types and payloads for SIH integration.
 */

export enum WebhookEventType {
  PRE_ECLAMPSIA_RISK = 'pre_eclampsia_risk',
  GESTATIONAL_DIABETES = 'gestational_diabetes',
  ABNORMAL_ULTRASOUND = 'abnormal_ultrasound',
  DELIVERY_IMMINENT = 'delivery_imminent',
  LOW_APGAR = 'low_apgar',
  POSTPARTUM_DEPRESSION = 'postpartum_depression',
}

export const WEBHOOK_EVENTS: Record<WebhookEventType, string> = {
  [WebhookEventType.PRE_ECLAMPSIA_RISK]: 'Pre-eclampsia risk detected',
  [WebhookEventType.GESTATIONAL_DIABETES]: 'Gestational diabetes detected',
  [WebhookEventType.ABNORMAL_ULTRASOUND]: 'Abnormal ultrasound findings',
  [WebhookEventType.DELIVERY_IMMINENT]: 'Delivery imminent',
  [WebhookEventType.LOW_APGAR]: 'Low APGAR score detected',
  [WebhookEventType.POSTPARTUM_DEPRESSION]: 'Postpartum depression risk detected',
};

export interface WebhookPayload {
  event: WebhookEventType;
  timestamp: string;
  source: 'maternacare';
  patient_ipp?: string;
  data: Record<string, unknown>;
}
