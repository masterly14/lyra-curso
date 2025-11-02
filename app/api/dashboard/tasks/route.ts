import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { currentUser } from '@clerk/nextjs/server';
import { startOfMonth, endOfMonth } from 'date-fns';

export async function GET(req: NextRequest) {
  const user = await currentUser();
  if (!user) return new Response('Unauthorized', { status: 401 });

  const url = new URL(req.url);
  const monthParam = url.searchParams.get('month'); // yyyy-mm
  let start = startOfMonth(new Date());
  if (monthParam) {
    const [y, m] = monthParam.split('-').map(Number);
    start = startOfMonth(new Date(y, m - 1, 1));
  }
  const end = endOfMonth(start);

  const tasks = await prisma.task.findMany({
    where: {
      userId: user.id,
      scheduledFor: {
        gte: start,
        lte: end,
      },
    },
    select: {
      id: true,
      title: true,
      scheduledFor: true,
      status: true,
    },
  });

  return new Response(JSON.stringify({ tasks }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}
