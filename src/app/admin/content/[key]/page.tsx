import { notFound } from "next/navigation";
import { copySlots, isCopySlotKey } from "@/config/copy";
import { getCopy } from "@/lib/copy";
import { CopyEditor } from "@/app/admin/components/CopyEditor";

export default async function CopySlotPage({
  params,
}: {
  params: Promise<{ key: string }>;
}) {
  const { key } = await params;
  if (!isCopySlotKey(key)) notFound();

  const initialDoc = await getCopy(key);
  return <CopyEditor slot={copySlots[key]} initialDoc={initialDoc} />;
}
