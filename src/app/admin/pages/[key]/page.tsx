import { notFound } from "next/navigation";
import { isPageKey } from "@/config/pages";
import { readBrandSwatches } from "@/lib/brand";
import { readPage } from "@/lib/pages";
import { BrandSwatchesProvider } from "@/app/admin/components/BrandSwatches";
import { PageEditor } from "@/app/admin/components/PageEditor";

export default async function EditPage({
  params,
}: {
  params: Promise<{ key: string }>;
}) {
  const { key } = await params;
  if (!isPageKey(key)) notFound();

  const [page, swatches] = await Promise.all([
    readPage(key),
    readBrandSwatches(),
  ]);
  return (
    <BrandSwatchesProvider initialSwatches={swatches}>
      <PageEditor initialPage={page} />
    </BrandSwatchesProvider>
  );
}
