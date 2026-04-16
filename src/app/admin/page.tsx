"use client";

import { useAuth } from "@/app/admin/hooks/useAuth";
import { PhoneAuth } from "@/app/admin/components/PhoneAuth";
import { PhoneManagement } from "@/app/admin/components/PhoneManagement";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";

export default function AdminPage() {
  const { loading, isAdmin, signOut } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="size-6 animate-spin rounded-full border-2 border-muted-foreground border-t-transparent" />
      </div>
    );
  }

  if (!isAdmin) {
    return <PhoneAuth onSuccess={() => window.location.reload()} />;
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-xl font-semibold">Admin</h1>
        <Button
          variant="ghost"
          size="sm"
          onClick={async () => {
            await fetch("/api/admin/logout", { method: "POST" });
            await signOut();
          }}
        >
          <LogOut />
          Sign out
        </Button>
      </div>
      <PhoneManagement />
    </div>
  );
}
