import { prisma } from "@/lib/db";
import { sendTextMessage } from "@/lib/whatsapp";

export async function logIncomingMessage(userId: string, body: string) {
  await prisma.message.create({
    data: {
      userId,
      direction: "IN",
      type: "TEXT",
      content: body,
      processed: true,
    },
  });
}

export async function sendAndLog(userId: string, waIdRaw: string, body: string) {
  await sendTextMessage({ to: waIdRaw, body });
  await prisma.message.create({
    data: {
      userId,
      direction: "OUT",
      type: "TEXT",
      content: body,
      processed: true,
    },
  });
}
