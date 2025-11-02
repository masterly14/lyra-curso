import { NextRequest } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";
import { cancelReminder, scheduleReminder } from "@/lib/qstash";

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  const user = await currentUser();
  if (!user) return new Response("Unauthorized", { status: 401 });

  const { title, description, scheduledFor, status } = await request.json();
  const task = await prisma.task.findUnique({ where: { id: params.id, userId: user.id } });
  if (!task) return new Response("Not found", { status: 404 });

  if (scheduledFor && task.qstashMessageId) {
    await cancelReminder(task.qstashMessageId);
  }

  let newMessageId = task.qstashMessageId;
  if (scheduledFor) {
    const sendAt = new Date(scheduledFor);
    newMessageId = await scheduleReminder(
      `https://7c0cd0bfdc78.ngrok-free.app/api/webhooks/qstash`,
      sendAt,
      { userId: user.id, title: title ?? task.title }
    );
  }

  const updated = await prisma.task.update({
    where: { id: task.id },
    data: {
      title,
      description,
      scheduledFor: scheduledFor ? new Date(scheduledFor) : undefined,
      status,
      qstashMessageId: newMessageId,
    },
  });

  return Response.json(updated);
}

export async function DELETE(_request: NextRequest, { params }: { params: { id: string } }) {
  const user = await currentUser();
  if (!user) return new Response("Unauthorized", { status: 401 });

  const task = await prisma.task.findUnique({ where: { id: params.id, userId: user.id } });
  if (!task) return new Response("Not found", { status: 404 });

  if (task.qstashMessageId) {
    await cancelReminder(task.qstashMessageId);
  }

  await prisma.task.delete({ where: { id: task.id } });
  return new Response("Deleted", { status: 204 });
}
