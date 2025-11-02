import { currentUser } from '@clerk/nextjs/server';
import { prisma } from '@/lib/db';

export async function GET() {
  const user = await currentUser();
  if (!user) return new Response('Unauthorized', { status: 401 });

  const localUser = await prisma.user.findUnique({ where: { clerkId: user.id } });
  if (!localUser) return new Response('User not found', { status: 404 });

  const account = await prisma.calendarAccount.findUnique({ where: { userId: localUser.id } });
  return Response.json({ connected: !!account });
}
