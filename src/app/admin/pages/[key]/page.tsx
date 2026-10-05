import { notFound } from "next/navigation";
import { isPageKey } from "@/config/pages";
import { readBrandSwatches } from "@/lib/brand";
import { loadPageData } from "@/lib/page-data";
import { readPage } from "@/lib/pages";
import { BrandSwatchesProvider } from "@/app/admin/components/BrandSwatches";
import { PageEditor } from "@/app/admin/components/PageEditor";

export default async function EditPage({
  params,
  searchParams,
}: {
  params: Promise<{ key: string }>;
  searchParams: Promise<{ edit?: string | string[] }>;
}) {
  const [{ key }, { edit }] = await Promise.all([params, searchParams]);
  if (!isPageKey(key)) notFound();

  const [page, data, swatches] = await Promise.all([
    readPage(key),
    loadPageData(key, readPage),
    readBrandSwatches(),
  ]);
  return (
    <BrandSwatchesProvider initialSwatches={swatches}>
      <PageEditor
        key={key}
        initialPage={page}
        initialItem={typeof edit === "string" ? edit : null}
        data={data}
      />
    </BrandSwatchesProvider>
  );
}
