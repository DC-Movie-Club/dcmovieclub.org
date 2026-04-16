import { Suspense } from "react";
import { AdminManagement } from "@/app/admin/components/AdminManagement";

export default function AdminsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center py-12">
          <div className="size-6 animate-spin rounded-full border-2 border-muted-foreground border-t-transparent" />
        </div>
      }
    >
      <AdminManagement />
    </Suspense>
  );
}
