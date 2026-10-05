import { PageBody } from "@/components/pages/PageBody";
import { getPage } from "@/lib/pages";
import { loadPageData } from "@/lib/page-data";

export default async function Partnerships() {
  const [page, data] = await Promise.all([
    getPage("partnerships"),
    loadPageData("partnerships", getPage),
  ]);
  return <PageBody page={page} data={data} />;
}
