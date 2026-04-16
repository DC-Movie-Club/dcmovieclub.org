"use client";

import { useState, useEffect } from "react";
import {
  collection,
  onSnapshot,
  doc,
  setDoc,
  deleteDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { revokeAdminClaim } from "@/app/admin/actions/auth";
import { useAuth } from "@/app/admin/hooks/useAuth";
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
import { Trash2 } from "lucide-react";

function toE164(input: string): string | null {
  let digits = input.replace(/\D/g, "");
  if (digits.length === 11 && digits.startsWith("1")) {
    digits = digits.slice(1);
  }
  if (digits.length === 10) {
    return `+1${digits}`;
  }
  if (input.startsWith("+") && digits.length >= 7 && digits.length <= 15) {
    return `+${digits}`;
  }
  return null;
}

interface PhoneEntry {
  phone: string;
  addedAt: Date | null;
}

export function PhoneManagement() {
  const { user } = useAuth();
  const [phones, setPhones] = useState<PhoneEntry[]>([]);
  const [newPhone, setNewPhone] = useState("");
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState("");
  const [removing, setRemoving] = useState<string | null>(null);

  useEffect(() => {
    return onSnapshot(collection(db, "allowedPhones"), (snapshot) => {
      const entries = snapshot.docs.map((doc) => ({
        phone: doc.id,
        addedAt: doc.data().addedAt?.toDate() ?? null,
      }));
      entries.sort((a, b) => a.phone.localeCompare(b.phone));
      setPhones(entries);
    });
  }, []);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    const normalized = toE164(newPhone);
    if (!normalized) {
      setError("Enter a valid phone number (e.g. (555) 555-5555)");
      return;
    }

    setAdding(true);
    try {
      await setDoc(doc(db, "allowedPhones", normalized), {
        addedAt: serverTimestamp(),
        addedBy: user?.phoneNumber ?? "unknown",
      });
      setNewPhone("");
    } catch {
      setError("Failed to add phone number");
    } finally {
      setAdding(false);
    }
  }

  async function handleRemove(phone: string) {
    if (phone === user?.phoneNumber) return;

    setRemoving(phone);
    try {
      await deleteDoc(doc(db, "allowedPhones", phone));
      await revokeAdminClaim(phone);
    } catch {
      setError("Failed to remove phone number");
    } finally {
      setRemoving(null);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Allowed Phone Numbers</CardTitle>
        <CardDescription>
          Manage which phone numbers can access admin
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-6">
        <form onSubmit={handleAdd} className="flex gap-2">
          <div className="flex flex-col gap-2 flex-1">
            <Label htmlFor="new-phone" className="sr-only">
              Phone number
            </Label>
            <Input
              id="new-phone"
              type="tel"
              placeholder="(555) 555-5555"
              value={newPhone}
              onChange={(e) => setNewPhone(e.target.value)}
              required
            />
          </div>
          <Button type="submit" disabled={adding}>
            {adding ? "Adding..." : "Add"}
          </Button>
        </form>
        {error && <p className="text-sm text-destructive">{error}</p>}

        <div className="flex flex-col gap-1">
          {phones.map(({ phone }) => {
            const isCurrentUser = phone === user?.phoneNumber;
            return (
              <div
                key={phone}
                className="flex items-center justify-between rounded-lg px-3 py-2 hover:bg-muted"
              >
                <span className="text-sm font-mono">
                  {phone}
                  {isCurrentUser && (
                    <span className="ml-2 text-xs text-muted-foreground">
                      (you)
                    </span>
                  )}
                </span>
                {!isCurrentUser && (
                  <Button
                    variant="ghost"
                    size="icon-xs"
                    onClick={() => handleRemove(phone)}
                    disabled={removing === phone}
                  >
                    <Trash2 />
                  </Button>
                )}
              </div>
            );
          })}
          {phones.length === 0 && (
            <p className="text-sm text-muted-foreground py-2">
              No phone numbers added yet.
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
