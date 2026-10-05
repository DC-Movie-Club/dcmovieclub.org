import { PageBody } from "@/components/pages/PageBody";
import { getPage } from "@/lib/pages";
import { loadPageData } from "@/lib/page-data";

export default async function Home() {
  const [page, data] = await Promise.all([
    getPage("home"),
    loadPageData("home", getPage),
  ]);
  return <PageBody page={page} data={data} />;
}
