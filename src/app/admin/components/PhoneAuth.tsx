"use client";

import { useState, useEffect, useRef } from "react";
import {
  RecaptchaVerifier,
  signInWithPhoneNumber,
  type ConfirmationResult,
} from "firebase/auth";
import { auth } from "@/lib/firebase";
import { verifyAndSetAdminClaim } from "@/app/admin/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

function toE164(input: string): string {
  let digits = input.replace(/\D/g, "");
  // Handle iPhone autofill adding leading 1 to 10-digit numbers
  if (digits.length === 11 && digits.startsWith("1")) {
    digits = digits.slice(1);
  }
  if (digits.length === 10) {
    return `+1${digits}`;
  }
  // Already has country code or international
  if (input.startsWith("+")) {
    return `+${digits}`;
  }
  return `+${digits}`;
}

export function PhoneAuth({ onSuccess }: { onSuccess: () => void }) {
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [confirmation, setConfirmation] = useState<ConfirmationResult | null>(
    null
  );
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const recaptchaRef = useRef<HTMLDivElement>(null);
  const verifierRef = useRef<RecaptchaVerifier | null>(null);

  useEffect(() => {
    if (!recaptchaRef.current) return;

    verifierRef.current = new RecaptchaVerifier(auth, recaptchaRef.current, {
      size: "invisible",
    });

    return () => {
      verifierRef.current?.clear();
      verifierRef.current = null;
    };
  }, []);

  async function handleSendCode(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSending(true);

    try {
      const normalized = toE164(phone);
      const result = await signInWithPhoneNumber(
        auth,
        normalized,
        verifierRef.current!
      );
      setConfirmation(result);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to send verification code"
      );
    } finally {
      setSending(false);
    }
  }

  async function handleVerifyCode(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setVerifying(true);

    try {
      const result = await confirmation!.confirm(code);
      const idToken = await result.user.getIdToken();
      const verification = await verifyAndSetAdminClaim(idToken);

      if (!verification.success) {
        setError(verification.error ?? "Not authorized");
        await auth.signOut();
        setConfirmation(null);
        setCode("");
        return;
      }

      await result.user.getIdToken(true);

      await fetch("/api/admin/login", {
        method: "POST",
        headers: { Authorization: `Bearer ${await result.user.getIdToken()}` },
      });

      onSuccess();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to verify code"
      );
    } finally {
      setVerifying(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Admin Login</CardTitle>
          <CardDescription>Sign in with your phone number</CardDescription>
        </CardHeader>
        <CardContent>
          {!confirmation ? (
            <form onSubmit={handleSendCode} className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="phone">Phone number</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="(555) 555-5555"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                />
              </div>
              {error && <p className="text-sm text-destructive">{error}</p>}
              <Button type="submit" disabled={sending}>
                {sending ? "Sending..." : "Send code"}
              </Button>
            </form>
          ) : (
            <form onSubmit={handleVerifyCode} className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="code">Verification code</Label>
                <Input
                  id="code"
                  type="text"
                  inputMode="numeric"
                  placeholder="123456"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  required
                />
              </div>
              {error && <p className="text-sm text-destructive">{error}</p>}
              <Button type="submit" disabled={verifying}>
                {verifying ? "Verifying..." : "Verify"}
              </Button>
              <button
                type="button"
                onClick={() => {
                  setConfirmation(null);
                  setCode("");
                  setError("");
                }}
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                Use a different number
              </button>
            </form>
          )}
        </CardContent>
      </Card>
      <div ref={recaptchaRef} />
    </div>
  );
}
