import crypto from "crypto";

const QSTASH_TOKEN = process.env.QSTASH_TOKEN;
const QSTASH_URL = "https://qstash.upstash.io";

if (!QSTASH_TOKEN) {
  console.warn("QSTASH_TOKEN not set – reminders will not be scheduled");
}

export async function scheduleReminder(
  callbackUrl: string,
  sendAt: Date,
  body: unknown
) {
  if (!QSTASH_TOKEN) {
    // fallback id
    return crypto.randomUUID();
  }

  const res = await fetch(`${QSTASH_URL}/v2/publish/${callbackUrl}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${QSTASH_TOKEN}`,
      "Content-Type": "application/json",
      // Upstash expects a Unix timestamp (seconds) in this header
      "Upstash-Not-Before": Math.floor(sendAt.getTime() / 1000).toString(),
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`QStash error: ${res.status} ${txt}`);
  }

  const data = (await res.json()) as { messageId: string };
  return data.messageId;
}

export async function cancelReminder(messageId: string) {
  if (!QSTASH_TOKEN) return;
  await fetch(`${QSTASH_URL}/v2/messages/${messageId}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${QSTASH_TOKEN}` },
  });
}
