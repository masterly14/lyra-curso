"use client";

import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Spinner from "@/components/shared/Spinner";
import useSWR from "swr";
import { useSWRConfig } from 'swr';

interface StatusResponse {
  verified: boolean;
  phoneNumber?: string;
}

export default function OtpModal() {
  const [open, setOpen] = useState(false);
  const { mutate } = useSWRConfig();
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<StatusResponse | null>(null);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otp, setOtp] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function fetchStatus() {
    try {
      const res = await fetch("/api/auth/phone/status");
      if (!res.ok) throw new Error("Failed");
      const data = (await res.json()) as StatusResponse;
      setStatus(data);
      if (!data.verified) {
        setPhoneNumber(data.phoneNumber || "");
        setOpen(true);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchStatus();
  }, []);

  async function handleSendOtp() {
    try {
      setSending(true);
      setError(null);
      const res = await fetch("/api/auth/phone/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phoneNumber }),
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text);
      }
      // Actualizar status para mostrar campo OTP
      mutate('/api/auth/phone/status');
      alert("Código enviado a WhatsApp");
    } catch (e: any) {
      setError(e.message || "Error");
    } finally {
      setSending(false);
    }
  }

  async function handleVerify() {
    try {
      setSending(true);
      setError(null);
      const res = await fetch("/api/auth/phone/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ otpCode: otp }),
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text);
      }
      setOpen(false);
      location.reload();
    } catch (e: any) {
      setError(e.message || "Error");
    } finally {
      setSending(false);
    }
  }

  if (loading) return <Spinner />;

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Verifica tu número de WhatsApp</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {!status?.phoneNumber && (
            <>
              <Input
                placeholder="Número con código país"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
              />
              <Button disabled={sending || !phoneNumber} onClick={handleSendOtp} className="w-full">
                {sending ? "Enviando..." : "Enviar código"}
              </Button>
            </>
          )}

          {status?.phoneNumber && (
            <>
              <p className="text-sm text-muted-foreground">
                Código enviado al {status.phoneNumber}. Introduce el código de 6 dígitos.
              </p>
              <Input
                placeholder="Código OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
              />
              <Button disabled={sending || otp.length !== 6} onClick={handleVerify} className="w-full">
                {sending ? "Verificando..." : "Verificar"}
              </Button>
              <Button variant="link" onClick={handleSendOtp} disabled={sending} className="w-full">
                Reenviar código
              </Button>
            </>
          )}
          {error && <p className="text-destructive text-sm">{error}</p>}
        </div>
      </DialogContent>
    </Dialog>
  );
}
