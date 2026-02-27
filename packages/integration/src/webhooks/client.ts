/**
 * Webhook client for receiving and validating MaternaCare webhooks.
 */

import type { WebhookPayload } from './events';

/**
 * Validate HMAC-SHA256 webhook signature.
 */
export async function validateWebhookSignature(
  payload: string,
  signature: string,
  secret: string,
): Promise<boolean> {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );

  const signatureBuffer = await crypto.subtle.sign(
    'HMAC',
    key,
    encoder.encode(payload),
  );

  const expectedSignature = Array.from(new Uint8Array(signatureBuffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');

  const receivedSig = signature.replace('sha256=', '');
  return expectedSignature === receivedSig;
}

/**
 * Client for consuming MaternaCare webhooks in an SIH system.
 */
export class WebhookClient {
  private secret: string;
  private handlers: Map<string, Array<(payload: WebhookPayload) => void | Promise<void>>>;

  constructor(secret: string) {
    this.secret = secret;
    this.handlers = new Map();
  }

  /**
   * Register a handler for a specific event type.
   */
  on(event: string, handler: (payload: WebhookPayload) => void | Promise<void>): void {
    const handlers = this.handlers.get(event) || [];
    handlers.push(handler);
    this.handlers.set(event, handlers);
  }

  /**
   * Process an incoming webhook request.
   */
  async processWebhook(
    body: string,
    signature: string,
  ): Promise<{ success: boolean; error?: string }> {
    // Validate signature
    const isValid = await validateWebhookSignature(body, signature, this.secret);
    if (!isValid) {
      return { success: false, error: 'Invalid webhook signature' };
    }

    // Parse payload
    let payload: WebhookPayload;
    try {
      payload = JSON.parse(body);
    } catch {
      return { success: false, error: 'Invalid JSON payload' };
    }

    // Execute handlers
    const handlers = this.handlers.get(payload.event) || [];
    for (const handler of handlers) {
      try {
        await handler(payload);
      } catch (err) {
        console.error(`Webhook handler error for ${payload.event}:`, err);
      }
    }

    return { success: true };
  }
}
