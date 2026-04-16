"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { adminTabs } from "@/app/admin/config";

export function AdminNav() {
  const pathname = usePathname();

  return (
    <nav className="flex gap-4 border-b">
      {Object.values(adminTabs).map(({ key, href, label }) => (
        <Link
          key={key}
          href={href}
          className={cn(
            "border-b-2 px-1 pb-2 text-sm font-medium transition-colors",
            pathname === href
              ? "border-foreground text-foreground"
              : "border-transparent text-muted-foreground hover:text-foreground"
          )}
        >
          {label}
        </Link>
      ))}
    </nav>
  );
}
