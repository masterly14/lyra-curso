import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { composio } from '@/lib/composio';

export async function POST(request: NextRequest) {
  const { connectionRequestId, userId } = await request.json();
  if (!connectionRequestId || !userId) {
    return new Response('Bad request', { status: 400 });
  }

  const connectedAccount = await composio.connectedAccounts.waitForConnection(connectionRequestId);

  const provider = (connectedAccount as any).toolkitKey ?? connectedAccount.toolkit?.slug ?? 'unknown';

  const ca = connectedAccount as any;

  await prisma.calendarAccount.upsert({
    where: { userId },
    create: {
      userId,
      provider,
      accessToken: ca.accessToken ?? '',
      refreshToken: ca.refreshToken ?? '',
      expiresAt: new Date(Date.now() + (ca.expiresIn ?? 0) * 1000),
    },
    update: {
      provider,
      accessToken: ca.accessToken ?? '',
      refreshToken: ca.refreshToken ?? '',
      expiresAt: new Date(Date.now() + (ca.expiresIn ?? 0) * 1000),
    },
  });

  return new Response('Calendar connected', { status: 200 });
}
