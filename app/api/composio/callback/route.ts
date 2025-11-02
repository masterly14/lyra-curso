import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { composio } from '@/lib/composio';

export async function POST(request: NextRequest) {
  const { connectionRequestId, userId } = await request.json();
  if (!connectionRequestId || !userId) {
    return new Response('Bad request', { status: 400 });
  }

  const connectedAccount = await composio.connectedAccounts.waitForConnection(connectionRequestId);

  await prisma.calendarAccount.upsert({
    where: { userId },
    create: {
      userId,
      provider: connectedAccount.toolkitKey,
      accessToken: connectedAccount.accessToken ?? '',
      refreshToken: connectedAccount.refreshToken ?? '',
      expiresAt: new Date(Date.now() + (connectedAccount.expiresIn ?? 0) * 1000),
    },
    update: {
      provider: connectedAccount.toolkitKey,
      accessToken: connectedAccount.accessToken ?? '',
      refreshToken: connectedAccount.refreshToken ?? '',
      expiresAt: new Date(Date.now() + (connectedAccount.expiresIn ?? 0) * 1000),
    },
  });

  return new Response('Calendar connected', { status: 200 });
}
