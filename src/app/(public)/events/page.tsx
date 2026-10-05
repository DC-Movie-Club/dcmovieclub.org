import { PageBody } from "@/components/pages/PageBody";
import { getPage } from "@/lib/pages";
import { loadPageData } from "@/lib/page-data";

export default async function Events() {
  const [page, data] = await Promise.all([
    getPage("events"),
    loadPageData("events", getPage),
  ]);
  return <PageBody page={page} data={data} />;
}
