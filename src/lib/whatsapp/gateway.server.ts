// Server-only WhatsApp gateway access. Never import this from browser code:
// it reads secret environment variables.
import { asRecord, str } from "./parse";

const GATEWAY_URL = "https://connector-gateway.lovable.dev/whatsapp";

function gatewayHeaders(): Record<string, string> {
  const lovableApiKey = process.env.LOVABLE_API_KEY;
  const connectionKey = process.env.WHATSAPP_API_KEY;
  if (!lovableApiKey) throw new Error("LOVABLE_API_KEY is not configured");
  if (!connectionKey) throw new Error("WHATSAPP_API_KEY is not configured");
  return {
    Authorization: `Bearer ${lovableApiKey}`,
    "X-Connection-Api-Key": connectionKey,
    "Content-Type": "application/json",
  };
}

export type SendResult = { messageId: string };

function readMessageId(text: string): string {
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    throw new Error(`WhatsApp send returned an unreadable response: ${text}`);
  }
  const messages = Array.isArray(asRecord(parsed)?.messages) ? (asRecord(parsed)!.messages as unknown[]) : [];
  const id = str(asRecord(messages[0])?.id);
  if (!id) throw new Error(`WhatsApp send returned no message id: ${text}`);
  return id;
}

async function postJson(path: string, body: unknown): Promise<string> {
  const response = await fetch(`${GATEWAY_URL}${path}`, {
    method: "POST",
    headers: gatewayHeaders(),
    body: JSON.stringify(body),
  });
  const text = await response.text();
  if (!response.ok) {
    throw new Error(`WhatsApp request failed (${response.status}): ${text}`);
  }
  return text;
}

/** Send a free-form text message. Only valid inside Meta's 24-hour service window. */
export async function sendWhatsAppText(to: string, body: string): Promise<SendResult> {
  const text = await postJson("/messages", {
    messaging_product: "whatsapp",
    to,
    type: "text",
    text: { body },
  });
  return { messageId: readMessageId(text) };
}

export type TemplateComponent = {
  type: string;
  [key: string]: unknown;
};

/** Send an approved template. Required for anything outside the 24-hour window. */
export async function sendWhatsAppTemplate(
  to: string,
  name: string,
  language: string,
  components: TemplateComponent[] = [],
): Promise<SendResult> {
  const text = await postJson("/messages", {
    messaging_product: "whatsapp",
    to,
    type: "template",
    template: { name, language: { code: language }, components },
  });
  return { messageId: readMessageId(text) };
}

let cachedBusinessNumber: string | null = null;

/** The connected business number, e.g. "+92 314 2763051". Cached per process. */
export async function getBusinessNumber(): Promise<string> {
  if (cachedBusinessNumber) return cachedBusinessNumber;

  const response = await fetch(`${GATEWAY_URL}/phone_number?fields=display_phone_number`, {
    headers: gatewayHeaders(),
  });
  const text = await response.text();
  if (!response.ok) {
    throw new Error(`WhatsApp number lookup failed (${response.status}): ${text}`);
  }
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    throw new Error(`WhatsApp number lookup returned an unreadable response: ${text}`);
  }
  const number = str(asRecord(parsed)?.display_phone_number);
  if (!number) throw new Error(`WhatsApp number lookup returned no number: ${text}`);
  cachedBusinessNumber = number;
  return number;
}
