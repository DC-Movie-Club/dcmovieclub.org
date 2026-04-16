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
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemTitle,
} from "@/components/ui/item";
import { Check, Pencil, Trash2, X } from "lucide-react";

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
  name: string;
  addedAt: Date | null;
}

export function PhoneManagement() {
  const { user } = useAuth();
  const [phones, setPhones] = useState<PhoneEntry[]>([]);
  const [newPhone, setNewPhone] = useState("");
  const [newName, setNewName] = useState("");
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState("");
  const [removing, setRemoving] = useState<string | null>(null);
  const [editing, setEditing] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editPhone, setEditPhone] = useState("");

  useEffect(() => {
    return onSnapshot(collection(db, "allowedPhones"), (snapshot) => {
      const entries = snapshot.docs.map((doc) => ({
        phone: doc.id,
        name: doc.data().name ?? "",
        addedAt: doc.data().addedAt?.toDate() ?? null,
      }));
      entries.sort((a, b) =>
        (a.name || a.phone).localeCompare(b.name || b.phone)
      );
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
        name: newName.trim(),
        addedAt: serverTimestamp(),
        addedBy: user?.phoneNumber ?? "unknown",
      });
      setNewPhone("");
      setNewName("");
    } catch {
      setError("Failed to add phone number");
    } finally {
      setAdding(false);
    }
  }

  function startEditing(phone: string, name: string) {
    setEditing(phone);
    setEditName(name);
    setEditPhone(phone);
  }

  function cancelEditing() {
    setEditing(null);
    setEditName("");
    setEditPhone("");
  }

  async function handleSaveEdit(originalPhone: string) {
    setError("");
    const normalizedPhone = toE164(editPhone);
    if (!normalizedPhone) {
      setError("Enter a valid phone number (e.g. (555) 555-5555)");
      return;
    }

    try {
      if (normalizedPhone !== originalPhone) {
        await deleteDoc(doc(db, "allowedPhones", originalPhone));
      }
      await setDoc(doc(db, "allowedPhones", normalizedPhone), {
        name: editName.trim(),
        addedAt: serverTimestamp(),
        addedBy: user?.phoneNumber ?? "unknown",
      });
      setEditing(null);
      setEditName("");
      setEditPhone("");
    } catch {
      setError("Failed to update admin");
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
        <ItemGroup>
          {phones.map(({ phone, name }) => {
            const isCurrentUser = phone === user?.phoneNumber;
            const isEditing = editing === phone;
            return isEditing ? (
              <Item key={phone} variant="outline" size="sm">
                <ItemContent>
                  <div className="flex gap-2">
                    <Input
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      placeholder="Name"
                      className="h-8 text-sm"
                    />
                    <Input
                      value={editPhone}
                      onChange={(e) => setEditPhone(e.target.value)}
                      placeholder="(555) 555-5555"
                      type="tel"
                      className="h-8 text-sm font-mono"
                    />
                  </div>
                </ItemContent>
                <ItemActions>
                  <Button
                    variant="ghost"
                    size="icon-xs"
                    onClick={() => handleSaveEdit(phone)}
                  >
                    <Check />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon-xs"
                    onClick={cancelEditing}
                  >
                    <X />
                  </Button>
                </ItemActions>
              </Item>
            ) : (
              <Item key={phone} variant="outline" size="sm">
                <ItemContent>
                  <ItemTitle>
                    {name || phone}
                    {isCurrentUser && (
                      <span className="text-xs font-normal text-muted-foreground">
                        (you)
                      </span>
                    )}
                  </ItemTitle>
                  {name && (
                    <ItemDescription className="font-mono">
                      {phone}
                    </ItemDescription>
                  )}
                </ItemContent>
                <ItemActions>
                  <Button
                    variant="ghost"
                    size="icon-xs"
                    onClick={() => startEditing(phone, name)}
                  >
                    <Pencil />
                  </Button>
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
                </ItemActions>
              </Item>
            );
          })}
          {phones.length === 0 && (
            <p className="text-sm text-muted-foreground py-2">
              No phone numbers added yet.
            </p>
          )}
        </ItemGroup>

        <form onSubmit={handleAdd} className="flex gap-2">
          <div className="flex-1">
            <Label htmlFor="new-name" className="sr-only">
              Name
            </Label>
            <Input
              id="new-name"
              type="text"
              placeholder="Name"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              required
            />
          </div>
          <div className="flex-1">
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
      </CardContent>
    </Card>
  );
}
