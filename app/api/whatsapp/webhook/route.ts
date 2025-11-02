import crypto from "crypto";
import { redis } from "@/lib/redis";
import { OpenAI } from "openai";
import { prisma } from "@/lib/db";
import { handleMessage } from "@/lib/conversation";
import { logIncomingMessage, sendAndLog } from "@/lib/messages";

const openai = new OpenAI();

function getSecret() {
  const secret = process.env.NEXT_PUBLIC_WHATSAPP_WEBHOOK_SECRET;
  if (!secret) {
    throw new Error("Missing NEXT_PUBLIC_WHATSAPP_WEBHOOK_SECRET environment variable");
  }
  return secret;
}

function verifySignature(rawBody: string, signatureHeader: string | null, secret: string) {
  if (!signatureHeader) {
    throw new Error("Missing x-hub-signature-256 header");
  }

  const [scheme, receivedSignature] = signatureHeader.split("=");

  if (scheme !== "sha256" || !receivedSignature) {
    throw new Error("Invalid signature format");
  }

  const expectedSignature = crypto
    .createHmac("sha256", secret)
    .update(rawBody)
    .digest("hex");

  const receivedBuffer = Buffer.from(receivedSignature, "hex");
  const expectedBuffer = Buffer.from(expectedSignature, "hex");

  if (receivedBuffer.length !== expectedBuffer.length) {
    throw new Error("Signature length mismatch");
  }

  const isValid = crypto.timingSafeEqual(receivedBuffer, expectedBuffer);

  if (!isValid) {
    throw new Error("Invalid signature");
  }
}

async function transcribeAudio(url: string) {
  const res = await fetch(url);
  const buf = Buffer.from(await res.arrayBuffer());
  const file = new File([buf], "audio.ogg", { type: "audio/ogg" });
  const tr = await openai.audio.transcriptions.create({ file, model: "whisper-1" });
  return tr.text;
}

async function extractIntent(text: string) {
  const sys = `You are an assistant that extracts task creation intent. Return JSON {\"intent\":string,\"title\":string,\"date\":string|null}`;
  const res = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    temperature: 0,
    messages: [
      { role: "system", content: sys },
      { role: "user", content: text },
    ],
    response_format: { type: "json_object" },
  });
  return JSON.parse(res.choices[0].message.content!);
}

export async function GET(request: Request) {
  try {
    const secret = getSecret();
    const url = new URL(request.url);

    const mode = url.searchParams.get("hub.mode");
    const token = url.searchParams.get("hub.verify_token");
    const challenge = url.searchParams.get("hub.challenge");

    if (mode === "subscribe" && token === secret) {
      return new Response(challenge ?? "", { status: 200 });
    }

    return new Response("Forbidden", { status: 403 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected error";
    return new Response(message, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const secret = getSecret();
    const rawBody = await request.text();

    if (process.env.NODE_ENV === 'production') {
      verifySignature(rawBody, request.headers.get("x-hub-signature-256"), secret);
    }

    const payload = JSON.parse(rawBody);
    if (process.env.NODE_ENV !== 'production') {
      console.info('[WA] Webhook payload', JSON.stringify(payload, null, 2));
    }

    if (redis) {
      await redis.xadd(
        "incoming-messages",
        "*",
        {
          payload: JSON.stringify(payload),
        }
      );
    }

    const entry = payload.entry?.[0];
    const change = entry?.changes?.[0]?.value.messages?.[0];
    if (change) {
      const waIdRaw = change.from as string;
      const waId = waIdRaw.startsWith('+') ? waIdRaw.slice(1) : waIdRaw;

      if (process.env.NODE_ENV !== 'production') console.info('[WA] Incoming from', waIdRaw);

      const user = await prisma.user.findFirst({
        where: {
          WhatsAppAccount: {
            some: {
              waId: {
                in: [waId, '+' + waId],
              },
            },
          },
        },
      });
      if (process.env.NODE_ENV !== 'production') console.info('[WA] Matched user', !!user);

      if (user) {
        let text = change.text?.body as string | undefined;
        if (!text && change.type === "audio" && change.audio?.id) {
          const mediaUrl = change.audio.url;
          text = await transcribeAudio(mediaUrl);
        }

        if (text) {
          await logIncomingMessage(user.id, text);
          const conversationState = await prisma.conversationState.findUnique({ where: { userId: user.id } });
          const { reply } = await handleMessage({ userId: user.id, waIdRaw, text, state: conversationState });
          await sendAndLog(user.id, waIdRaw, reply);
        }
      }
    }

    return new Response("EVENT_RECEIVED", { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected error";
    const statusMessage =
      message === "Invalid signature" || message === "Missing x-hub-signature-256 header"
        ? 401
        : message === "Invalid signature format" || message === "Signature length mismatch"
          ? 400
          : 500;

    return new Response(message, { status: statusMessage });
  }
}

