"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { adminTabs } from "@/app/admin/config";

export function AdminNav() {
  const pathname = usePathname();

  return (
    <nav className="flex gap-4 border-b">
      {adminTabs.map(({ href, label }) => (
        <Link
          key={href}
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
