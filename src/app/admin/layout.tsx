"use client";

import "@/styles/admin.css";
import { useAuth } from "@/app/admin/hooks/useAuth";
import { useAdminSession } from "@/app/admin/hooks/useAdminSession";
import { PhoneAuth } from "@/app/admin/components/PhoneAuth";
import { AdminNav } from "@/app/admin/components/AdminNav";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { loading, user, isAdmin, signOut } = useAuth();
  const session = useAdminSession(user, isAdmin);

  if (loading || (isAdmin && !session.active)) {
    return (
      <div className="min-h-screen bg-background text-foreground antialiased">
        <div className="flex min-h-screen items-center justify-center">
          <div className="size-6 animate-spin rounded-full border-2 border-muted-foreground border-t-transparent" />
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-background text-foreground antialiased">
        <PhoneAuth notice={session.error} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground antialiased">
      <div className="mx-auto max-w-2xl px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl font-semibold">Admin Dashboard</h1>
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
