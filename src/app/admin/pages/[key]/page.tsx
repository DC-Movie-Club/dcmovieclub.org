import { notFound } from "next/navigation";
import { isPageKey } from "@/config/pages";
import { readPage } from "@/lib/pages";
import { PageEditor } from "@/app/admin/components/PageEditor";

export default async function EditPage({
  params,
}: {
  params: Promise<{ key: string }>;
}) {
  const { key } = await params;
  if (!isPageKey(key)) notFound();

  return <PageEditor initialPage={await readPage(key)} />;
}
