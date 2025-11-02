const GRAPH_API_VERSION = "v21.0";
const GRAPH_API_URL = `https://graph.facebook.com/${GRAPH_API_VERSION}`;

type TemplateParameter =
  | { type: "text"; text: string }
  | { type: "currency"; currency: { fallback_value: string; amount_1000: number; code: string } }
  | { type: "date_time"; date_time: { fallback_value: string } };

type TemplateComponent = {
  type: "body" | "header" | "button";
  sub_type?: "quick_reply" | "url";
  index?: string;
  parameters?: TemplateParameter[];
};

interface WhatsAppConfig {
  accessToken: string;
  phoneNumberId: string;
  businessId?: string;
  displayPhoneNumber?: string;
}

interface TemplateMessageOptions {
  to: string;
  templateName: string;
  languageCode?: string;
  components?: TemplateComponent[];
}

interface AuthenticationTemplateOptions {
  to: string;
  code: string;
  templateName?: string;
  languageCode?: string;
  expirationMinutes?: number;
}

interface TextMessageOptions {
  to: string;
  body: string;
  previewUrl?: boolean;
}

function getConfig(): WhatsAppConfig {
  const accessToken =
    process.env.NEXT_PUBLIC_WHATSAPP_ACCESS_TOKEN ?? process.env.WHATSAPP_ACCESS_TOKEN;
  const phoneNumberId =
    process.env.NEXT_PUBLIC_WHATSAPP_PHONE_NUMBER_ID ?? process.env.WHATSAPP_PHONE_NUMBER_ID;
  const businessId = process.env.NEXT_PUBLIC_WHATSAPP_BUSINESS_ID;
  const displayPhoneNumber = process.env.NEXT_PUBLIC_WHATSAPP_PHONE_NUMBER;

  if (!accessToken || !phoneNumberId) {
    throw new Error("Missing WhatsApp Cloud API credentials");
  }

  return { accessToken, phoneNumberId, businessId, displayPhoneNumber };
}

async function postToWhatsApp(messagesEndpoint: string, payload: unknown) {
  const { accessToken } = getConfig();

  const res = await fetch(`${GRAPH_API_URL}/${messagesEndpoint}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`WhatsApp API error: ${res.status} ${errorText}`);
  }

  return res.json();
}

export async function sendTemplateMessage({
  to,
  templateName,
  languageCode = "en_US",
  components = [],
}: TemplateMessageOptions) {
  const { phoneNumberId } = getConfig();

  const payload = {
    messaging_product: "whatsapp",
    to,
    type: "template" as const,
    template: {
      name: templateName,
      language: { code: languageCode },
      components,
    },
  };

  return postToWhatsApp(`${phoneNumberId}/messages`, payload);
}

export async function sendAuthenticationTemplateMessage({
  to,
  code,
  templateName = "authentication_code",
  languageCode = "en_US",
  expirationMinutes,
}: AuthenticationTemplateOptions) {
  const parameters: TemplateParameter[] = [
    { type: "text", text: code },
  ];

  if (typeof expirationMinutes === "number") {
    parameters.push({ type: "text", text: expirationMinutes.toString() });
  }

  return sendTemplateMessage({
    to,
    templateName,
    languageCode,
    components: [
      {
        type: "body",
        parameters,
      },
    ],
  });
}

export async function sendTextMessage({ to, body, previewUrl = false }: TextMessageOptions) {
  const { phoneNumberId } = getConfig();

  const payload = {
    messaging_product: "whatsapp",
    to,
    type: "text" as const,
    text: { body, preview_url: previewUrl },
  };

  return postToWhatsApp(`${phoneNumberId}/messages`, payload);
}

export function getWhatsAppConfig() {
  return getConfig();
}
