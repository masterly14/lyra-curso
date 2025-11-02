import { NextRequest } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { prisma } from '@/lib/db';

export async function GET(_request: NextRequest) {
  const user = await currentUser();
  if (!user) {
    return new Response(JSON.stringify({ verified: false }), { status: 401 });
  }

  const localUser = await prisma.user.findUnique({ where: { clerkId: user.id } });
  if (!localUser) return new Response("User not found", { status: 404 });

  const waAccount = await prisma.whatsAppAccount.findUnique({
    where: { userId: localUser.id },
  });

  if (waAccount) {
    return new Response(JSON.stringify({ verified: true, phoneNumber: waAccount.phoneNumber }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const pending = await prisma.phoneVerification.findFirst({
    where: { userId: localUser.id, verifiedAt: null },
    orderBy: { createdAt: "desc" },
  });

  return new Response(
    JSON.stringify({ verified: false, phoneNumber: pending?.phoneNumber }),
    { status: 200, headers: { 'Content-Type': 'application/json' } }
  );
}
