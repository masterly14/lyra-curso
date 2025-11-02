import { NextRequest } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { composio } from '@/lib/composio';

export async function POST(request: NextRequest) {
  const user = await currentUser();
  if (!user) return new Response('Unauthorized', { status: 401 });

  const { authConfigId, callbackUrl } = await request.json();
  if (!authConfigId) return new Response('authConfigId required', { status: 400 });

  const connectionRequest = await composio.connectedAccounts.link(user.id, authConfigId, {
    callbackUrl,
  });

  return new Response(JSON.stringify({ redirectUrl: connectionRequest.redirectUrl }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}
