import { notFound } from "next/navigation";
import { PageBody } from "@/components/pages/PageBody";
import { isPageKey } from "@/config/pages";
import { kitPage, kitPageData } from "@/app/kit/fixtures";

export default async function KitPage({
  params,
}: {
  params: Promise<{ page: string }>;
}) {
  const { page } = await params;
  if (!isPageKey(page)) notFound();
  return <PageBody page={kitPage(page)} data={kitPageData(page)} />;
}
