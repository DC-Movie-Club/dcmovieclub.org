import { redirect } from "next/navigation";
import { ADMIN_DEFAULT_TAB } from "@/app/admin/config";

export default function AdminPage() {
  redirect(ADMIN_DEFAULT_TAB);
}
