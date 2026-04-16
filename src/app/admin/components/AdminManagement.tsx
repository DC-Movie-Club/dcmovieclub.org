"use client";

import { useState } from "react";
import {
  doc,
  setDoc,
  deleteDoc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";
import useSWR from "swr";
import { db } from "@/lib/firebase";
import {
  revokeAdminClaim,
  getAdminUsers,
} from "@/app/admin/actions/auth";
import { adminSWRKeys } from "@/app/admin/config";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Pencil } from "lucide-react";

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

export function AdminManagement() {
  const { user } = useAuth();
  const { data, mutate } = useSWR(
    adminSWRKeys.adminUsers.swrKey,
    getAdminUsers,
    { suspense: true }
  );
  const [newPhone, setNewPhone] = useState("");
  const [newName, setNewName] = useState("");
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState("");
  const [focusedPhone, setFocusedPhone] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [removing, setRemoving] = useState(false);

  const { phones, loginInfo } = data;
  const isCurrentUser = focusedPhone === user?.phoneNumber;

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
      mutate();
    } catch {
      setError("Failed to add admin");
    } finally {
      setAdding(false);
    }
  }

  async function handleSaveEdit(e: React.FormEvent) {
    e.preventDefault();
    if (!focusedPhone) return;
    setError("");

    try {
      await updateDoc(doc(db, "allowedPhones", focusedPhone), {
        name: editName.trim(),
      });
      setFocusedPhone(null);
      mutate();
    } catch {
      setError("Failed to update name");
    }
  }

  async function handleRemove() {
    if (!focusedPhone || isCurrentUser) return;
    if (!window.confirm("Remove this admin? They will lose access.")) return;

    setRemoving(true);
    try {
      await deleteDoc(doc(db, "allowedPhones", focusedPhone));
      await revokeAdminClaim(focusedPhone);
      setFocusedPhone(null);
      mutate();
    } catch {
      setError("Failed to remove admin");
    } finally {
      setRemoving(false);
    }
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Admins</CardTitle>
          <CardDescription>
            Manage who can access this dashboard
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-6">
          <ItemGroup>
            {phones.map(({ phone, name }) => (
              <Item key={phone} variant="outline" size="sm">
                <ItemContent>
                  <ItemTitle>
                    {name || phone}
                    {phone === user?.phoneNumber && (
                      <span className="text-xs font-normal text-muted-foreground">
                        (you)
                      </span>
                    )}
                  </ItemTitle>
                  <ItemDescription>
                    {name && <span className="font-mono">{phone}</span>}
                    {name && " · "}
                    <span>
                      {loginInfo[phone]?.lastSignIn
                        ? `Last login: ${new Date(loginInfo[phone].lastSignIn!).toLocaleDateString()}`
                        : "Never logged in"}
                    </span>
                  </ItemDescription>
                </ItemContent>
                <ItemActions>
                  <Button
                    variant="ghost"
                    size="icon-xs"
                    onClick={() => {
                      setFocusedPhone(phone);
                      setEditName(name);
                      setError("");
                    }}
                  >
                    <Pencil />
                  </Button>
                </ItemActions>
              </Item>
            ))}
            {phones.length === 0 && (
              <p className="text-sm text-muted-foreground py-2">
                No admins added yet.
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

      <Dialog
        open={focusedPhone !== null}
        onOpenChange={(open) => {
          if (!open) setFocusedPhone(null);
        }}
      >
        <DialogContent>
          <form onSubmit={handleSaveEdit}>
            <DialogHeader>
              <DialogTitle>Edit Admin</DialogTitle>
              <DialogDescription className="font-mono">
                {focusedPhone}
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <Label htmlFor="edit-name">Name</Label>
              <Input
                id="edit-name"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                autoFocus
              />
            </div>
            <DialogFooter>
              {!isCurrentUser && (
                <Button
                  type="button"
                  variant="destructive"
                  onClick={handleRemove}
                  disabled={removing}
                >
                  {removing ? "Removing..." : "Remove Admin"}
                </Button>
              )}
              <Button type="submit">Save</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
