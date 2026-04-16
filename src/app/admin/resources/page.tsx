import { ResourcesEditor } from "@/app/admin/components/ResourcesEditor";
import { getResources } from "@/app/admin/actions/resources";

export default async function ResourcesPage() {
  const initialData = await getResources();
  return <ResourcesEditor initialData={initialData} />;
}
