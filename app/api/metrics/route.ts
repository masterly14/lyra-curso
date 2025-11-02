import { currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";

export async function GET() {
  const user = await currentUser();
  if (!user) return new Response("Unauthorized", { status: 401 });

  const [total, completed, punctual] = await Promise.all([
    prisma.task.count({ where: { userId: user.id } }),
    prisma.task.count({ where: { userId: user.id, status: "COMPLETED" } }),
    prisma.task.count({
      where: {
        userId: user.id,
        status: "COMPLETED",
        updatedAt: { lte: prisma.task.fields.scheduledFor },
      },
    }),
  ]);

  const punctuality = total ? Math.round((punctual / total) * 100) : 0;

  return Response.json({ total, completed, punctuality, tokensUsed: 0 });
}
