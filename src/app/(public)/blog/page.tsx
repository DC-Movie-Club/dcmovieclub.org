import { PageBody } from "@/components/pages/PageBody";
import { getPage } from "@/lib/pages";
import { loadPageData } from "@/lib/page-data";

export default async function Blog() {
  const [page, data] = await Promise.all([
    getPage("blog"),
    loadPageData("blog", getPage),
  ]);
  return <PageBody page={page} data={data} />;
}
