import { NextRequest } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { prisma } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const user = await currentUser();
    if (!user) {
      return new Response('Unauthorized', { status: 401 });
    }

    const body = await request.json();
    const { otpCode } = body as { otpCode?: string };

    if (!otpCode) {
      return new Response('otpCode is required', { status: 400 });
    }

    const localUser = await prisma.user.findUnique({ where: { clerkId: user.id } });
    if (!localUser) return new Response('User not found', { status: 404 });

    const verification = await prisma.phoneVerification.findFirst({
      where: { userId: localUser.id, verifiedAt: null },
      orderBy: { createdAt: 'desc' },
    });

    if (!verification) {
      return new Response('No verification request found', { status: 404 });
    }

    if (verification.verifiedAt) {
      return new Response('Phone already verified', { status: 400 });
    }

    if (verification.expiresAt < new Date()) {
      return new Response('OTP expired', { status: 400 });
    }

    if (verification.otpCode !== otpCode) {
      return new Response('Invalid OTP', { status: 400 });
    }

    // Mark phone verified
    await prisma.phoneVerification.update({
      where: { id: verification.id },
      data: { verifiedAt: new Date() },
    });

    // Create WhatsAppAccount if not exists
    await prisma.whatsAppAccount.upsert({
      where: { userId: localUser.id },
      create: {
        userId: localUser.id,
        phoneNumber: verification.phoneNumber,
        waId: verification.phoneNumber, // placeholder until webhook gives real waId
        verifiedAt: new Date(),
      },
      update: {
        phoneNumber: verification.phoneNumber,
        verifiedAt: new Date(),
      },
    });

    return new Response('Phone verified', { status: 200 });
  } catch (error) {
    console.error('[PHONE_VERIFY]', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}
