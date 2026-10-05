"use client";

import "@/styles/admin.css";
import { usePathname } from "next/navigation";
import { useAuth } from "@/app/admin/hooks/useAuth";
import { useAdminSession } from "@/app/admin/hooks/useAdminSession";
import { PhoneAuth } from "@/app/admin/components/PhoneAuth";
import { AdminNav } from "@/app/admin/components/AdminNav";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { adminTabs } from "@/app/admin/config";
import { cn } from "@/lib/utils";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { loading, user, isAdmin, signOut } = useAuth();
  const session = useAdminSession(user, isAdmin);
  const pathname = usePathname();

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

  const fullWidth = Object.values(adminTabs).some(
    (tab) => tab.fullWidth && pathname.startsWith(tab.href),
  );

  return (
    <div
      className={cn(
        "flex flex-col bg-background text-foreground antialiased",
        fullWidth ? "h-dvh" : "min-h-dvh",
      )}
    >
      <header className="flex h-12 shrink-0 items-center gap-6 border-b px-4">
        <span className="text-sm font-semibold max-sm:hidden">
          DC Movie Club admin
        </span>
        <AdminNav />
        <Button
          variant="ghost"
          size="sm"
          className="ml-auto"
          onClick={async () => {
            await fetch("/api/admin/logout", { method: "POST" });
            await signOut();
          }}
        >
          <LogOut />
          Sign out
        </Button>
      </header>
      {fullWidth ? (
        children
      ) : (
        <main className="mx-auto w-full max-w-2xl px-4 py-8">{children}</main>
      )}
    </div>
  );
}
