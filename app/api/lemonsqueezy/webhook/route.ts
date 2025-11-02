import crypto from "crypto";
import { webhookHasMeta } from "@/lib/typeguards";
import { processWebhookEvent } from "@/lib/actions/lemonsqueezy";
import { prisma } from "@/lib/db";

export async function POST(request: Request) {
  if (!process.env.LEMONSQUEEZY_WEBHOOK_SECRET) {
    return new Response("Missing LEMONSQUEEZY_WEBHOOK_SECRET", { status: 500 });
  }

  const rawBody = await request.text();

  const secret = process.env.LEMONSQUEEZY_WEBHOOK_SECRET;


  const hmac = crypto.createHmac('sha256', secret);
  const digest = Buffer.from(hmac.update(rawBody).digest('hex'), "utf-8");
  const signature = Buffer.from(request.headers.get('X-Signature') ?? '', "utf-8");

  if (!crypto.timingSafeEqual(digest, signature)) {
    return new Response('Invalid signature.', { status: 401 });
  }

  const data = JSON.parse(rawBody);

  if (webhookHasMeta(data)) {
    const webhookEvent = await prisma.webhookEvents.create({
        data: {
            eventName: data.meta.event_name,
            body: data,
        }
    })

    await processWebhookEvent(webhookEvent.id);

    return new Response('OK', { status: 200 });
  }
  return new Response('Data invalid', { status: 400 })
}
