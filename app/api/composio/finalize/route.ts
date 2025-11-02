import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { composio } from '@/lib/composio';
import { redirect } from 'next/navigation';
import { currentUser } from '@clerk/nextjs/server';

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const connectedId = url.searchParams.get('connected_account_id');
  const status = url.searchParams.get('status');
  if (!connectedId || status !== 'success') {
    return redirect('/platform/dashboard');
  }

  const ca = await composio.connectedAccounts.get(connectedId);

  const authUser = await currentUser();
  if (!authUser) return redirect('/sign-in');

  const localUser = await prisma.user.findUnique({ where: { clerkId: authUser.id } });
  if (!localUser) return redirect('/platform/dashboard');

  const anyCA = ca as any;
  const provider = anyCA.toolkitKey ?? ca.toolkit?.slug ?? 'unknown';
  await prisma.calendarAccount.upsert({
    where: { userId: localUser.id },
    create: {
      userId: localUser.id,
      provider,
      accessToken: anyCA.accessToken ?? '',
      refreshToken: anyCA.refreshToken ?? '',
      expiresAt: new Date(Date.now() + ((anyCA.expiresIn ?? 60) * 1000)),
    },
    update: {
      provider,
      accessToken: anyCA.accessToken ?? '',
      refreshToken: anyCA.refreshToken ?? '',
      expiresAt: new Date(Date.now() + ((anyCA.expiresIn ?? 60) * 1000)),
    },
  });

  return redirect('/platform/dashboard');
}
