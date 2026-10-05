import { redirect } from "next/navigation";
import { pageTemplates } from "@/config/pages";

// Pages are picked from the editor's outline, which opens on the first one
export default function PagesPage() {
  redirect(`/admin/pages/${Object.values(pageTemplates)[0].key}`);
}
