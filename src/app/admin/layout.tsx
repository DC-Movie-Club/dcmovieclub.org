"use client";

import { useAuth } from "@/app/admin/hooks/useAuth";
import { PhoneAuth } from "@/app/admin/components/PhoneAuth";
import { AdminNav } from "@/app/admin/components/AdminNav";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { loading, isAdmin, signOut } = useAuth();

  if (loading) {
    return (
      <div className="font-sans min-h-screen bg-background text-foreground antialiased">
        <div className="flex min-h-screen items-center justify-center">
          <div className="size-6 animate-spin rounded-full border-2 border-muted-foreground border-t-transparent" />
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="font-sans min-h-screen bg-background text-foreground antialiased">
        <PhoneAuth onSuccess={() => window.location.reload()} />
      </div>
    );
  }

  return (
    <div className="font-sans min-h-screen bg-background text-foreground antialiased">
      <div className="mx-auto max-w-2xl px-4 py-8">
        <div className="flex items-center justify-between mb-6">
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
        <AdminNav />
        <div className="pt-6">{children}</div>
      </div>
    </div>
  );
}
