import { notFound } from "next/navigation";
import { copySlots, isCopySlotKey } from "@/config/copy";
import { isPageKey } from "@/config/pages";
import { getCopy } from "@/lib/copy";
import { readPage } from "@/lib/pages";
import { CopyEditor } from "@/app/admin/components/CopyEditor";
import { PageEditor } from "@/app/admin/components/PageEditor";

export default async function EditPage({
  params,
}: {
  params: Promise<{ key: string }>;
}) {
  const { key } = await params;

  if (isPageKey(key)) {
    return <PageEditor initialPage={await readPage(key)} />;
  }
  if (isCopySlotKey(key)) {
    return <CopyEditor slot={copySlots[key]} initialDoc={await getCopy(key)} />;
  }
  notFound();
}
