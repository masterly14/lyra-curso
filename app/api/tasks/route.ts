import { NextRequest } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";
import { scheduleReminder } from "@/lib/qstash";

export async function GET() {
  const user = await currentUser();
  if (!user) return new Response("Unauthorized", { status: 401 });

  const tasks = await prisma.task.findMany({
    where: { userId: user.id },
    orderBy: { scheduledFor: "asc" },
  });

  return Response.json(tasks);
}

export async function POST(request: NextRequest) {
  const user = await currentUser();
  if (!user) return new Response("Unauthorized", { status: 401 });

  const { title, description, scheduledFor } = await request.json();
  if (!title || !scheduledFor) return new Response("Missing fields", { status: 400 });

  const sendAt = new Date(scheduledFor);
  const callbackUrl = `https://7c0cd0bfdc78.ngrok-free.app/api/webhooks/qstash`;
  const messageId = await scheduleReminder(callbackUrl, sendAt, { userId: user.id, title });

  const task = await prisma.task.create({
    data: {
      userId: user.id,
      title,
      description,
      scheduledFor: sendAt,
      status: "PENDING",
      qstashMessageId: messageId,
    },
  });

  return Response.json(task, { status: 201 });
}
