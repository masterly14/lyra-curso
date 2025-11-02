import { NextRequest } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { prisma } from '@/lib/db';
import { sendTemplateMessage } from '@/lib/whatsapp';

function generateOtp() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function POST(request: NextRequest) {
  try {
    const user = await currentUser();
    if (!user) {
      return new Response('Unauthorized', { status: 401 });
    }

    const localUser = await prisma.user.findUnique({ where: { clerkId: user.id } });
    if (!localUser) {
      return new Response('User not found', { status: 404 });
    }

    const body = await request.json();
    const phoneNumber: string | undefined = body.phoneNumber;

    if (!phoneNumber) {
      return new Response('phoneNumber is required', { status: 400 });
    }

    const otpCode = generateOtp();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Eliminamos verificaciones previas sin verificar
    await prisma.phoneVerification.deleteMany({
      where: { userId: localUser.id, verifiedAt: null },
    });

    await prisma.phoneVerification.create({
      data: {
        userId: localUser.id,
        phoneNumber,
        otpCode,
        expiresAt,
      },
    });

    // Send WhatsApp template with OTP
    await sendTemplateMessage({
      to: phoneNumber,
      templateName: "verification_template",
      languageCode: "es",
      components: [
        {
          type: "body",
          parameters: [{ type: "text", text: otpCode }],
        },
        {
          type: "button",
          sub_type: "url",
          index: "0",
          parameters: [{ type: "text", text: otpCode }],
        },
      ],
    });

    return new Response('OTP sent', { status: 200 });
  } catch (error) {
    console.error('[PHONE_SEND]', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}
