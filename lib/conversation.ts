import { scheduleReminder } from "@/lib/qstash";
import { prisma } from "@/lib/db";

interface Context {
  userId: string;
  waIdRaw: string;
  text: string;
  state: {
    flow: string;
    step: string;
    data: any;
  } | null;
}

export async function handleMessage(ctx: Context) {
  const { userId, text } = ctx;
  let state = ctx.state;

  if (!state) {
    // detect quick intent
    const lower = text.toLowerCase();
    if (lower.startsWith("cancelar")) {
      return { reply: "Función cancelar pendiente" };
    }
    // default to create_task flow awaiting title
    state = { flow: "create_task", step: "await_title", data: {} };
  }

  if (state.flow === "create_task") {
    if (state.step === "await_title") {
      state.data.title = text;
      state.step = "await_date";
      await saveState(userId, state);
      return { reply: "¿Cuándo quieres que te lo recuerde?" };
    } else if (state.step === "await_date") {
      const date = new Date(text);
      if (isNaN(date.getTime())) {
        return { reply: "Fecha inválida. Por ejemplo: 2025-11-01 09:00" };
      }
      state.data.date = date.toISOString();
      state.step = "confirmed";
      await createTaskSideEffect(userId, state.data.title, date);
      await deleteState(userId);
      return { reply: `✅ Recordatorio creado para ${date.toLocaleString()}.` };
    }
  }

  return { reply: "Lo siento, no entendí. Intenta nuevamente." };
}

async function saveState(userId: string, state: any) {
  await prisma.conversationState.upsert({
    where: { userId },
    update: { flow: state.flow, step: state.step, data: state.data },
    create: { userId, flow: state.flow, step: state.step, data: state.data },
  });
}

async function deleteState(userId: string) {
  await prisma.conversationState.delete({ where: { userId } }).catch(() => {});
}

async function createTaskSideEffect(userId: string, title: string, scheduledFor: Date) {
  const msgId = await scheduleReminder(
    `https://YOUR_DOMAIN/api/webhooks/qstash`,
    scheduledFor,
    { userId, title }
  );
  await prisma.task.create({
    data: {
      userId,
      title,
      scheduledFor,
      status: "PENDING",
      qstashMessageId: msgId,
    },
  });
}
