import { PageBody } from "@/components/pages/PageBody";
import { getPage } from "@/lib/pages";
import { loadPageData } from "@/lib/page-data";

export default async function About() {
  const [page, data] = await Promise.all([
    getPage("about"),
    loadPageData("about", getPage),
  ]);
  return <PageBody page={page} data={data} />;
}
