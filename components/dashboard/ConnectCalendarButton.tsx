"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then(r => r.json());

export function ConnectCalendarButton({ authConfigId }: { authConfigId: string }) {
  const [loading, setLoading] = useState(false);

  const { data, isLoading } = useSWR("/api/composio/status", fetcher, {
    revalidateOnFocus: true,
  });
  if (isLoading) return null;
  if (data?.connected) return null;

  async function handleClick() {
    try {
      setLoading(true);
      const res = await fetch('/api/composio/link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ authConfigId, callbackUrl: window.location.origin + '/api/composio/finalize' }),
      });
      const data = await res.json();
      if (data.redirectUrl) {
        window.location.href = data.redirectUrl;
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button onClick={handleClick} disabled={loading}>
      {loading ? 'Conectando…' : 'Conectar Calendario'}
    </Button>
  );
}
