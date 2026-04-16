"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { ADMIN_DEFAULT_TAB } from "@/app/admin/config";

export default function AdminPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace(ADMIN_DEFAULT_TAB);
  }, [router]);

  return null;
}
