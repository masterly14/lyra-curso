import crypto from "crypto";
import { prisma } from "@/lib/db";

const SIGNING_KEY = process.env.QSTASH_SIGNING_KEY;

function verify(payload: string, signature: string): boolean {
  if (!SIGNING_KEY) return true; // skip if not set
  const hmac = crypto.createHmac("sha256", SIGNING_KEY);
  hmac.update(payload);
  const digest = hmac.digest("hex");
  return crypto.timingSafeEqual(Buffer.from(digest), Buffer.from(signature));
}

export async function POST(request: Request) {
  const rawBody = await request.text();
  if (process.env.NODE_ENV !== 'production') {
    console.info('[QSTASH] Incoming webhook', {
      headers: Object.fromEntries(request.headers.entries()),
      rawBody,
    });
  }
  const signature = request.headers.get("upstash-signature") || "";

  if (!verify(rawBody, signature)) {
    if (process.env.NODE_ENV !== 'production') console.warn('[QSTASH] Signature verification failed');
    return new Response("Invalid signature", { status: 401 });
  }

  let body: { messageId?: string; deliveryStatus?: string; metadata?: any };
  try {
    body = JSON.parse(rawBody);
  } catch {
    if (process.env.NODE_ENV !== 'production') console.warn('[QSTASH] Body is not valid JSON');
    return new Response("Bad JSON", { status: 400 });
  }

  const headerMessageId = request.headers.get('upstash-message-id') || undefined;
  const messageId = body.messageId ?? headerMessageId;

  if (!messageId) {
    if (process.env.NODE_ENV !== 'production') console.warn('[QSTASH] No messageId in body or header');
    return new Response("No messageId", { status: 400 });
  }

  await prisma.task.updateMany({
    where: { qstashMessageId: messageId },
    data: { status: body.deliveryStatus ?? "SENT" },
  });

  await prisma.assistantWebhookEvents.create({
    data: {
      source: "QSTASH",
      body,
      processed: true,
    },
  });

  return new Response("OK", { status: 200 });
}
